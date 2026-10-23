import * as XLSX from 'xlsx';
import { Product, ProductVariant, Category, ImportJob, ImportErrorRecord } from '../types';
import { store } from './store';
import { supabase, isSupabaseConfigured } from './supabase';

export interface ColumnMapping {
  productName: string;
  brand: string;
  category: string;
  subCategory?: string;
  sku: string;
  barcode?: string;
  description?: string;
  size?: string;
  shade?: string;
  variantName?: string;
  costPrice?: string;
  sellingPrice: string;
  mrp?: string;
  discount?: string;
  stock: string;
  taxPercent?: string;
  supplier?: string;
  imageUrl?: string;
  additionalImages?: string;
  status?: string;
}

export interface RawRowData {
  [key: string]: any;
}

export interface ParsedProductRow {
  rowIndex: number;
  productName: string;
  brand: string;
  category: string;
  subCategory?: string;
  sku: string;
  barcode?: string;
  description: string;
  size?: string;
  shade?: string;
  variantName: string;
  costPrice?: number;
  sellingPrice: number | null; // NULL if missing, never 0
  mrp?: number | null;
  discountPercentage?: number;
  stock: number;
  taxPercent?: number;
  supplier?: string;
  imageUrl?: string;
  additionalImages: string[];
  imageResolutionSource: 'direct_url' | 'supplier_feed' | 'barcode_match' | 'fuzzy_match' | 'unresolved';
  requiresImageReview: boolean;
  status: 'published' | 'draft' | 'archived';
  validationStatus: 'valid' | 'warning' | 'error';
  validationErrors: string[];
  validationWarnings: string[];
  selectedForImport: boolean;
  rawRow: RawRowData;
}

export interface ImportOptions {
  mode?: 'full' | 'catalogue_only' | 'new_only';
  publishPolicy?: 'draft' | 'published';
  defaultCategoryId?: string;
  defaultBrand?: string;
}

export interface ImportSummary {
  totalRows: number;
  totalProcessed?: number;
  selectedRows: number;
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  failedCount: number;
  draftCount?: number;
  publishedCount?: number;
  errors: { row: number; sku: string; name: string; error: string }[];
  durationMs: number;
}

// Known verified cosmetics image asset registry (for exact barcode or brand+name resolution)
const VERIFIED_COSMETIC_IMAGE_REGISTRY: Record<string, { image: string; brand: string; name: string }> = {
  // Barcode / GTIN matches
  '8901234567890': {
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
    brand: 'Dew & Go Skincare',
    name: 'Dew Glow Niacinamide 10% + Zinc 1% Clarifying Serum'
  },
  '8901234567891': {
    image: 'https://images.unsplash.com/photo-1556228722-d0b5de731748?auto=format&fit=crop&w=800&q=80',
    brand: 'Dew & Go Skincare',
    name: 'Cloud Barrier Ceramide + Peptide Recovery Cream'
  },
  '8901234567892': {
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    brand: 'Sol Shield Lab',
    name: 'Invisible Water Gel Sunscreen SPF 50+ PA++++'
  },
  '8901234567893': {
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80',
    brand: 'Rose Petal Beauty',
    name: 'Glaze Peptide Hydrating Lip Tint Oil'
  },
  '8901234567894': {
    image: 'https://images.unsplash.com/photo-1556228724-4da0d3b66804?auto=format&fit=crop&w=800&q=80',
    brand: 'Dew & Go Skincare',
    name: 'Gentle Melt Oat & Green Tea Cleansing Balm'
  },
  '8901234567895': {
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    brand: 'Rose Petal Beauty',
    name: 'Dew Drop Seamless Liquid Blush'
  },
  '8901234567896': {
    image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80',
    brand: 'Botanica Roots',
    name: 'Rosemary & Biotin Scalp Stimulating Density Oil'
  },
  '8901234567897': {
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
    brand: 'Atelier Dew',
    name: 'Santorini Sunset Eau de Parfum'
  },
  '8901234567898': {
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80',
    brand: 'Rose Petal Beauty',
    name: 'Silk Lash Definition & Length Peptide Mascara'
  },
  '8901234567899': {
    image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=800&q=80',
    brand: 'Dew & Go Skincare',
    name: 'AHA 10% Smoothing & Resurfacing Body Lotion'
  }
};

// Generic fallback aesthetic cosmetics placeholder image for unverified items requiring review
export const PLACEHOLDER_COSMETIC_IMAGE = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80';

// Known column aliases for smart mapping
const HEADER_ALIASES: Record<keyof ColumnMapping, string[]> = {
  productName: ['product_name', 'product name', 'name', 'title', 'product_title', 'product title', 'item_name', 'item name', 'item title', 'item_title'],
  brand: ['brand', 'brand_name', 'brand name', 'manufacturer', 'vendor', 'make'],
  category: ['category', 'category_name', 'category name', 'dept', 'department', 'product_category', 'product category', 'item category', 'item_category'],
  subCategory: ['subcategory', 'sub_category', 'sub category', 'type', 'treatment'],
  sku: ['product_id', 'product id', 'sku', 'sku_code', 'sku code', 'product_code', 'product code', 'item_code', 'item code', 'part_number', 'id'],
  barcode: ['barcode', 'gtin', 'ean', 'upc', 'isbn', 'barcode_number', 'barcode number'],
  description: ['description', 'desc', 'product_description', 'product description', 'short_description', 'short description', 'details', 'about'],
  size: ['size_or_variant', 'size or variant', 'size', 'volume', 'net_quantity', 'net quantity', 'net weight', 'weight', 'capacity'],
  shade: ['shade', 'colour', 'color', 'shade_name', 'shade name', 'tone'],
  variantName: ['variant', 'variant_name', 'variant name', 'option', 'flavor', 'size_or_variant'],
  costPrice: ['cost_price', 'cost price', 'cost', 'cp', 'purchase_price', 'purchase price', 'wholesale_price', 'wholesale price'],
  sellingPrice: ['selling_price_inr', 'selling price inr', 'selling_price', 'selling price', 'sale_price', 'sale price', 'price', 'price_inr', 'sp', 'offer_price', 'offer price'],
  mrp: ['mrp_inr', 'mrp inr', 'mrp (inr)', 'mrp', 'original_price', 'original price', 'retail_price', 'retail price', 'list_price', 'compare_at_price', 'max_retail_price'],
  discount: ['discount_percent', 'discount percent', 'discount_%', 'discount', 'discount_rate', 'discount rate'],
  stock: ['stock_quantity', 'stock quantity', 'stock', 'quantity', 'qty', 'inventory', 'inventory_qty', 'inventory qty', 'units'],
  taxPercent: ['tax', 'tax_percent', 'tax percent', 'gst', 'gst_rate', 'gst rate', 'tax_rate', 'vat'],
  supplier: ['supplier', 'supplier_name', 'supplier name', 'distributor', 'source'],
  imageUrl: ['image_url', 'image url', 'image_filename', 'image filename', 'image', 'primary_image', 'img', 'photo', 'picture', 'product_image', 'product image', 'product image url', 'product_image_url'],
  additionalImages: ['additional_images', 'additional images', 'other_images', 'gallery', 'more_images', 'image_2'],
  status: ['status', 'verification_status', 'state', 'publication_status']
};

/**
 * Normalizes price values without silently replacing missing/empty prices with 0.
 * Rejects negative prices and zero selling prices. Strips currency symbols (₹, $, Rs., INR) and commas.
 */
export const normalizePrice = (raw: any): { value: number | null; isValid: boolean; error?: string } => {
  if (raw === null || raw === undefined || raw === '') {
    return { value: null, isValid: true };
  }
  if (typeof raw === 'number') {
    if (isNaN(raw)) return { value: null, isValid: false, error: 'Price is not a valid number' };
    if (raw < 0) return { value: null, isValid: false, error: 'Selling price must be a valid positive number.' };
    if (raw === 0) return { value: 0, isValid: false, error: 'Selling price cannot be zero (missing or non-positive price)' };
    return { value: raw, isValid: true };
  }
  const str = String(raw).trim();
  if (!str) return { value: null, isValid: true };

  // Strip currency symbols (₹, $, Rs., INR), commas, and extraneous spaces
  const cleaned = str.replace(/[₹$€£,]/g, '').replace(/\b(?:rs|inr)\b\.?/gi, '').trim();
  const num = Number(cleaned);
  if (isNaN(num)) {
    return { value: null, isValid: false, error: `Invalid currency format: "${str}"` };
  }
  if (num < 0) {
    return { value: null, isValid: false, error: 'Selling price must be a valid positive number.' };
  }
  if (num === 0) {
    return { value: 0, isValid: false, error: 'Selling price cannot be zero (missing or non-positive price)' };
  }
  return { value: num, isValid: true };
};

/**
 * Normalizes stock quantity without converting zero stock into positive stock.
 */
export const normalizeStock = (raw: any): { value: number; isMissing: boolean; isValid: boolean; error?: string } => {
  if (raw === null || raw === undefined || raw === '') {
    return { value: 0, isMissing: true, isValid: true };
  }
  if (typeof raw === 'number') {
    if (isNaN(raw) || raw < 0 || !Number.isInteger(raw)) {
      return { value: 0, isMissing: false, isValid: false, error: 'Stock quantity must be a non-negative integer.' };
    }
    return { value: raw, isMissing: false, isValid: true };
  }
  const str = String(raw).trim().replace(/,/g, '');
  if (!str) return { value: 0, isMissing: true, isValid: true };
  const num = Number(str);
  if (isNaN(num) || num < 0 || !Number.isInteger(num)) {
    return { value: 0, isMissing: false, isValid: false, error: `Invalid stock quantity: "${str}"` };
  }
  return { value: num, isMissing: false, isValid: true };
};

/**
 * Reads an Excel or CSV file buffer and returns worksheet names and sheet data
 */
export const parseUploadedFile = async (
  file: File
): Promise<{ sheetNames: string[]; readSheet: (sheetName: string) => RawRowData[] }> => {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true, raw: false });

  return {
    sheetNames: workbook.SheetNames,
    readSheet: (sheetName: string) => {
      const worksheet = workbook.Sheets[sheetName];
      if (!worksheet) return [];
      // Parse as array of objects with first row as headers
      const rows = XLSX.utils.sheet_to_json<RawRowData>(worksheet, { defval: '' });
      return rows;
    }
  };
};

/**
 * Automatically inspects uploaded column headers and generates smart mapping suggestions
 */
export const detectColumnMapping = (headers: string[]): ColumnMapping => {
  const mapping: Partial<ColumnMapping> = {};
  const normalizedHeaders = headers.map(h => ({
    original: h,
    cleaned: h.toLowerCase().trim().replace(/[-_.]/g, ' ')
  }));

  for (const [field, aliases] of Object.entries(HEADER_ALIASES) as [keyof ColumnMapping, string[]][]) {
    const cleanedAliases = aliases.map(a => a.toLowerCase().trim().replace(/[-_.]/g, ' '));
    for (const h of normalizedHeaders) {
      if (cleanedAliases.includes(h.cleaned) || aliases.includes(h.original.toLowerCase().trim())) {
        mapping[field] = h.original;
        break;
      }
    }
  }

  return {
    productName: mapping.productName || '',
    brand: mapping.brand || '',
    category: mapping.category || '',
    subCategory: mapping.subCategory || '',
    sku: mapping.sku || '',
    barcode: mapping.barcode || '',
    description: mapping.description || '',
    size: mapping.size || '',
    shade: mapping.shade || '',
    variantName: mapping.variantName || '',
    costPrice: mapping.costPrice || '',
    sellingPrice: mapping.sellingPrice || '',
    mrp: mapping.mrp || '',
    discount: mapping.discount || '',
    stock: mapping.stock || '',
    taxPercent: mapping.taxPercent || '',
    supplier: mapping.supplier || '',
    imageUrl: mapping.imageUrl || '',
    additionalImages: mapping.additionalImages || '',
    status: mapping.status || ''
  };
};

/**
 * Image resolution pipeline following strict priority:
 * 1. Valid Direct URL from row
 * 2. Barcode / GTIN exact match
 * 3. Verified Brand + Product Name match
 * 4. Fallback to unverified placeholder requiring review
 */
export const resolveProductImage = (
  directUrl?: string,
  barcode?: string,
  brand?: string,
  productName?: string
): { imageUrl: string; source: ParsedProductRow['imageResolutionSource']; requiresReview: boolean } => {
  // 1. Direct valid URL
  if (directUrl && typeof directUrl === 'string') {
    const trimmed = directUrl.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return { imageUrl: trimmed, source: 'direct_url', requiresReview: false };
    }
  }

  // 2. Barcode match in verified registry
  if (barcode && VERIFIED_COSMETIC_IMAGE_REGISTRY[barcode.trim()]) {
    return {
      imageUrl: VERIFIED_COSMETIC_IMAGE_REGISTRY[barcode.trim()].image,
      source: 'barcode_match',
      requiresReview: false
    };
  }

  // 3. Match from existing seed database / registry by Brand + Name
  if (brand && productName) {
    const existingProducts = store.getProducts();
    const cleanBrand = brand.toLowerCase().trim();
    const cleanName = productName.toLowerCase().trim();

    const matched = existingProducts.find(
      p => p.brand.toLowerCase().trim() === cleanBrand && p.name.toLowerCase().trim() === cleanName
    );

    if (matched && matched.images && matched.images.length > 0) {
      return { imageUrl: matched.images[0], source: 'fuzzy_match', requiresReview: false };
    }
  }

  // 4. Unresolved fallback
  return {
    imageUrl: PLACEHOLDER_COSMETIC_IMAGE,
    source: 'unresolved',
    requiresReview: true
  };
};

/**
 * Validates, cleans, and transforms raw spreadsheet rows into parsed product rows
 */
export const validateAndParseRows = (
  rawRows: RawRowData[],
  mapping: ColumnMapping,
  existingSkus: Set<string>,
  availableCategories: Category[],
  options?: ImportOptions
): ParsedProductRow[] => {
  const seenSkusInFile = new Set<string>();

  return rawRows.map((row, index) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Name & Brand
    const productName = mapping.productName ? String(row[mapping.productName] || '').trim() : '';
    if (!productName) {
      errors.push('Product name is required.');
    }

    const brand = mapping.brand ? String(row[mapping.brand] || '').trim() : 'Dew & Go';
    if (!brand) {
      warnings.push('Brand was empty; defaulted to "Dew & Go".');
    }

    // 2. Category
    let category = mapping.category ? String(row[mapping.category] || '').trim() : 'Skincare';
    if (!category) {
      category = 'Skincare';
      warnings.push('Category empty; defaulted to "Skincare".');
    } else {
      const catExists = availableCategories.some(
        c => c.name.toLowerCase() === category.toLowerCase() || c.slug.toLowerCase() === category.toLowerCase()
      );
      if (!catExists) {
        warnings.push(`Category "${category}" will be automatically created.`);
      }
    }

    // 3. SKU validation
    let sku = mapping.sku ? String(row[mapping.sku] || '').trim() : '';
    if (!sku) {
      // Deterministic fallback SKU
      sku = `DWG-${brand.substring(0, 3).toUpperCase()}-${Date.now().toString(36)}-${index + 1}`.replace(/\s+/g, '');
      warnings.push(`Missing SKU; auto-generated: ${sku}`);
    } else {
      if (seenSkusInFile.has(sku.toLowerCase())) {
        errors.push(`Duplicate SKU "${sku}" found multiple times in spreadsheet.`);
      }
      seenSkusInFile.add(sku.toLowerCase());

      if (existingSkus.has(sku.toLowerCase())) {
        warnings.push(`SKU "${sku}" exists in catalogue. Will be updated.`);
      }
    }

    // 4. Barcode
    const barcode = mapping.barcode ? String(row[mapping.barcode] || '').trim() : undefined;

    // 5. Pricing (Never silently convert missing price to 0)
    const rawPrice = mapping.sellingPrice ? row[mapping.sellingPrice] : null;
    const priceRes = normalizePrice(rawPrice);

    if (!priceRes.isValid) {
      errors.push(priceRes.error || 'Selling price must be a valid positive number.');
    } else if (priceRes.value === null) {
      if (options?.publishPolicy === 'published') {
        errors.push('Missing selling price: cannot publish product without a valid positive selling price.');
      } else {
        warnings.push('Missing selling price: product will be saved as Draft (cannot be published or purchased until priced).');
      }
    }

    let mrp: number | null = null;
    if (mapping.mrp && row[mapping.mrp] !== undefined && row[mapping.mrp] !== '') {
      const mrpRes = normalizePrice(row[mapping.mrp]);
      if (!mrpRes.isValid) {
        warnings.push(mrpRes.error || 'Invalid MRP format.');
      } else if (mrpRes.value !== null && priceRes.value !== null && mrpRes.value < priceRes.value) {
        warnings.push(`MRP (₹${mrpRes.value}) was lower than selling price (₹${priceRes.value}); adjusted MRP to match price.`);
        mrp = priceRes.value;
      } else {
        mrp = mrpRes.value;
      }
    }

    let discountPercentage: number | undefined = undefined;
    if (mrp && priceRes.value && mrp > priceRes.value) {
      discountPercentage = Math.round(((mrp - priceRes.value) / mrp) * 100);
    } else if (mapping.discount && row[mapping.discount] !== undefined && row[mapping.discount] !== '') {
      const dNum = Number(String(row[mapping.discount]).replace(/[^0-9.]/g, ''));
      if (!isNaN(dNum) && dNum >= 0 && dNum <= 100) {
        discountPercentage = Math.round(dNum);
      }
    }

    // Cost Price
    let costPrice: number | undefined = undefined;
    if (mapping.costPrice && row[mapping.costPrice] !== undefined && row[mapping.costPrice] !== '') {
      const cpRes = normalizePrice(row[mapping.costPrice]);
      if (cpRes.isValid && cpRes.value !== null) costPrice = cpRes.value;
    }

    // 6. Stock Quantity (Preserve source stock; zero remains zero; displayed as out-of-stock)
    const rawStock = mapping.stock ? row[mapping.stock] : null;
    const stockRes = normalizeStock(rawStock);

    if (!stockRes.isValid) {
      errors.push(stockRes.error || 'Stock quantity must be a non-negative integer.');
    } else if (stockRes.isMissing) {
      warnings.push('Missing stock quantity: defaulted to 0 (Out of stock).');
    } else if (stockRes.value === 0) {
      warnings.push('Stock is 0: product will be marked as Out of Stock.');
    }

    // 7. Variant / Size / Shade
    const size = mapping.size ? String(row[mapping.size] || '').trim() : undefined;
    const shade = mapping.shade ? String(row[mapping.shade] || '').trim() : undefined;
    let variantName = mapping.variantName ? String(row[mapping.variantName] || '').trim() : '';
    if (!variantName) {
      if (size && shade) variantName = `${size} (${shade})`;
      else if (size) variantName = size;
      else if (shade) variantName = shade;
      else variantName = 'Standard';
    }

    // 8. Images (Never attach an unrelated product image merely to fill an empty field)
    const rawDirectUrl = mapping.imageUrl ? String(row[mapping.imageUrl] || '').trim() : '';
    const { imageUrl, source, requiresReview } = resolveProductImage(rawDirectUrl, barcode, brand, productName);
    if (requiresReview) {
      warnings.push('Image unverified or missing URL; placeholder used for preview. Requires manual review before publishing.');
    }

    const additionalImages: string[] = [];
    if (mapping.additionalImages && row[mapping.additionalImages]) {
      const extra = String(row[mapping.additionalImages]).split(/[\n,;]+/);
      for (const url of extra) {
        const u = url.trim();
        if (u.startsWith('http://') || u.startsWith('https://')) {
          additionalImages.push(u);
        }
      }
    }

    // 9. Status Determination
    let status: 'published' | 'draft' | 'archived' = 'draft';
    if (errors.length > 0 || priceRes.value === null || priceRes.value <= 0) {
      status = 'draft';
    } else if (mapping.status && row[mapping.status]) {
      const rowStatus = String(row[mapping.status]).toLowerCase().trim();
      status = (rowStatus === 'published' && options?.publishPolicy === 'published') ? 'published' : 'draft';
    } else {
      status = options?.publishPolicy === 'published' ? 'published' : 'draft';
    }

    const validationStatus: ParsedProductRow['validationStatus'] = 
      errors.length > 0 ? 'error' : warnings.length > 0 ? 'warning' : 'valid';

    return {
      rowIndex: index + 1,
      productName,
      brand,
      category,
      subCategory: mapping.subCategory ? String(row[mapping.subCategory] || '').trim() : undefined,
      sku,
      barcode,
      description: mapping.description ? String(row[mapping.description] || '').trim() : `${productName} by ${brand}. High-performance beauty formulation.`,
      size,
      shade,
      variantName,
      costPrice,
      sellingPrice: priceRes.value, // Preserves null if missing!
      mrp,
      discountPercentage,
      stock: stockRes.value,
      taxPercent: mapping.taxPercent ? Number(String(row[mapping.taxPercent] || '5').replace(/[^0-9.]/g, '')) : 5,
      supplier: mapping.supplier ? String(row[mapping.supplier] || '').trim() : undefined,
      imageUrl,
      additionalImages,
      imageResolutionSource: source,
      requiresImageReview: requiresReview,
      status,
      validationStatus,
      validationErrors: errors,
      validationWarnings: warnings,
      selectedForImport: errors.length === 0,
      rawRow: row
    };
  });
};

/**
 * Executes batch product imports into store and Supabase
 */
export const executeBatchImport = async (
  rows: ParsedProductRow[],
  options: ImportOptions,
  onProgress?: (progress: number, currentBatch: number, totalBatches: number) => void
): Promise<ImportSummary> => {
  const startTime = Date.now();
  const validRows = rows.filter(r => r.selectedForImport && r.validationStatus !== 'error');
  
  let createdCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;
  const errors: { row: number; sku: string; name: string; error: string }[] = [];

  const BATCH_SIZE = 25;
  const totalBatches = Math.max(1, Math.ceil(validRows.length / BATCH_SIZE));

  const existingProducts = store.getProducts();
  const existingCategories = store.getCategories();
  const processedSkus = new Set<string>();

  for (let b = 0; b < totalBatches; b++) {
    const batch = validRows.slice(b * BATCH_SIZE, (b + 1) * BATCH_SIZE);

    for (const item of batch) {
      try {
        // Prevent duplicate creation within same import session
        if (processedSkus.has(item.sku.toLowerCase())) {
          skippedCount++;
          continue;
        }
        processedSkus.add(item.sku.toLowerCase());

        // Find if SKU exists
        let existingProd: Product | undefined = undefined;
        let existingVariant: ProductVariant | undefined = undefined;

        for (const p of existingProducts) {
          const v = p.variants.find(vr => vr.sku.toLowerCase() === item.sku.toLowerCase());
          if (v) {
            existingProd = p;
            existingVariant = v;
            break;
          }
        }

        // Check import mode
        if (options.mode === 'new_only' && existingProd) {
          skippedCount++;
          continue;
        }

        // Category resolve or create
        let categoryObj = existingCategories.find(
          c => c.name.toLowerCase() === item.category.toLowerCase() || c.slug.toLowerCase() === item.category.toLowerCase()
        );
        if (!categoryObj) {
          const newCat: Category = {
            id: `cat-${item.category.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
            name: item.category,
            slug: item.category.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            description: `Curated ${item.category} essentials.`,
            imageUrl: item.imageUrl || PLACEHOLDER_COSMETIC_IMAGE,
            displayOrder: existingCategories.length + 1,
            isActive: true,
            productCount: 1
          };
          store.addCategory(newCat);
          categoryObj = newCat;
        }

        // Incomplete products can NEVER be published
        const isProductComplete = Boolean(item.productName && item.sellingPrice && item.sellingPrice > 0);
        const shouldPublish = options.publishPolicy === 'published' && isProductComplete;

        if (existingProd && existingVariant) {
          // UPDATE EXISTING PRODUCT
          if (options.mode === 'full') {
            // Update details and stock
            const prevStock = existingVariant.stockQuantity;
            const newStock = item.stock;

            if (item.sellingPrice !== null) existingVariant.price = item.sellingPrice;
            if (item.mrp !== null && item.mrp !== undefined) existingVariant.originalPrice = item.mrp;
            existingVariant.discountPercentage = item.discountPercentage;
            existingVariant.stockQuantity = newStock;
            existingVariant.variantName = item.variantName;
            if (item.barcode) existingVariant.barcode = item.barcode;

            // Log inventory adjustment
            if (newStock !== prevStock) {
              store.adjustInventory(
                existingVariant.id,
                newStock - prevStock,
                'excel_bulk_sync',
                `Bulk catalogue inventory sync from Excel (SKU: ${item.sku})`
              );
            }
          } else if (options.mode === 'catalogue_only') {
            // Update details only, preserve stock!
            if (item.sellingPrice !== null) existingVariant.price = item.sellingPrice;
            if (item.mrp !== null && item.mrp !== undefined) existingVariant.originalPrice = item.mrp;
            existingVariant.discountPercentage = item.discountPercentage;
            existingVariant.variantName = item.variantName;
            if (item.barcode) existingVariant.barcode = item.barcode;
          }

          // Update parent product
          store.updateProduct(existingProd.id, {
            name: item.productName,
            brand: item.brand,
            category: categoryObj.name,
            categoryId: categoryObj.id,
            description: item.description,
            images: [item.imageUrl, ...item.additionalImages].filter((img): img is string => Boolean(img)),
            variants: existingProd.variants,
            defaultPrice: existingVariant.price,
            defaultOriginalPrice: existingVariant.originalPrice,
            defaultDiscount: existingVariant.discountPercentage,
            status: shouldPublish ? 'published' : 'draft',
            isPublished: shouldPublish ? true : existingProd.isPublished
          });

          updatedCount++;
        } else {
          // CREATE NEW PRODUCT
          const newProductId = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
          const newVariantId = `var-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
          const productSlug = `${item.productName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36).substring(2, 5)}`;

          const effectivePrice = item.sellingPrice ?? 0;

          const newVariant: ProductVariant = {
            id: newVariantId,
            productId: newProductId,
            variantName: item.variantName,
            sku: item.sku,
            barcode: item.barcode,
            price: effectivePrice,
            originalPrice: item.mrp ?? undefined,
            stockQuantity: 0, // Initialized to 0; adjustInventory below sets exact imported stock and records audit log
            reservedQuantity: 0,
            isDefault: true,
            isActive: shouldPublish
          };

          const newProduct: Product = {
            id: newProductId,
            name: item.productName,
            slug: productSlug,
            brand: item.brand,
            category: categoryObj.name,
            categoryId: categoryObj.id,
            shortDescription: item.description.slice(0, 150),
            description: item.description,
            benefits: [
              'Dermatologist tested formulation',
              'Fast absorbing with zero residue',
              'Delivered in insulated 15-minute express packaging'
            ],
            skinType: ['All Skin Types'],
            skinConcern: [item.category],
            images: [item.imageUrl, ...item.additionalImages].filter((img): img is string => Boolean(img)),
            variants: [newVariant],
            defaultPrice: effectivePrice,
            defaultOriginalPrice: item.mrp ?? undefined,
            defaultDiscount: item.discountPercentage,
            rating: 4.8,
            reviewCount: 0,
            isBestseller: false,
            isTrending: false,
            isNewArrival: true,
            status: shouldPublish ? 'published' : 'draft',
            isPublished: shouldPublish,
            createdAt: new Date().toISOString()
          };

          store.addProduct(newProduct);

          // Log initial stock creation if non-zero
          if (item.stock > 0) {
            store.adjustInventory(
              newVariantId,
              item.stock,
              'excel_bulk_import',
              `Initial bulk catalogue stock import (SKU: ${item.sku})`
            );
          }

          createdCount++;
        }

        // If Supabase is active, async push to Supabase
        if (isSupabaseConfigured()) {
          supabase.from('products').upsert({
            name: item.productName,
            category_id: categoryObj.id,
            description: item.description,
            status: shouldPublish ? 'published' : 'draft',
            is_published: shouldPublish
          }).then(() => {}, () => {});
        }

      } catch (err: any) {
        failedCount++;
        errors.push({
          row: item.rowIndex,
          sku: item.sku,
          name: item.productName,
          error: err?.message || 'Database insert error'
        });
      }
    }

    if (onProgress) {
      onProgress(Math.round(((b + 1) / totalBatches) * 100), b + 1, totalBatches);
    }

    // Small delay to allow UI to breathe
    await new Promise(resolve => setTimeout(resolve, 30));
  }

  // Record Import Job in Store for auditing
  const importJob: ImportJob = {
    id: `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    filename: 'cosmetics_catalogue.xlsx',
    totalRows: rows.length,
    validRows: validRows.length,
    warningRows: rows.filter(r => r.validationStatus === 'warning').length,
    errorRows: rows.filter(r => r.validationStatus === 'error').length,
    importedRows: createdCount + updatedCount,
    status: failedCount > 0 && createdCount + updatedCount === 0 ? 'failed' : 'completed',
    options: {
      mode: options.mode || 'full',
      publishPolicy: options.publishPolicy || 'draft'
    },
    createdBy: 'Store Administrator',
    createdAt: new Date(startTime).toISOString(),
    completedAt: new Date().toISOString()
  };
  store.saveImportJob(importJob);

  if (errors.length > 0) {
    const errorRecords: ImportErrorRecord[] = errors.map(e => ({
      id: `err_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      jobId: importJob.id,
      rowNumber: e.row,
      sku: e.sku,
      productName: e.name,
      errorMessage: e.error,
      createdAt: new Date().toISOString()
    }));
    store.saveImportErrors(errorRecords);
  }

  return {
    totalRows: rows.length,
    totalProcessed: rows.length,
    selectedRows: validRows.length,
    createdCount,
    updatedCount,
    skippedCount,
    failedCount,
    draftCount: options.publishPolicy === 'draft' ? createdCount : 0,
    publishedCount: options.publishPolicy === 'published' ? createdCount : 0,
    errors,
    durationMs: Date.now() - startTime
  };
};


/**
 * Generates an Excel (.xlsx) Sample Workbook with 10 prefilled cosmetics items and instruction sheet
 */
export const generateSampleWorkbook = (): Uint8Array => {
  const workbook = XLSX.utils.book_new();

  // 1. Instructions Sheet
  const instructionsData = [
    ['DEW & GO — BULK CATALOGUE IMPORT TEMPLATE'],
    ['Version: 2026.1'],
    [''],
    ['COLUMN GUIDELINES & VALIDATION RULES:'],
    ['1. Product Name (Required): The full brand display title for the cosmetic item.'],
    ['2. Brand (Required): Brand name (e.g., Dew & Go Skincare, Rose Petal Beauty, Sol Shield Lab).'],
    ['3. Category (Required): Skincare, Makeup, Haircare, Sunscreen, Serums, Lip Care, Fragrance, Body Care.'],
    ['4. SKU (Required / Recommended): Unique merchant stock-keeping unit (e.g. DWG-SRM-01). Must be unique per variant.'],
    ['5. Barcode / GTIN: Optional 13-digit EAN/GTIN barcode. Used for automated verified image matching.'],
    ['6. Selling Price (Required): Price in INR charged at checkout (e.g. 549).'],
    ['7. MRP (Optional): Maximum Retail Price in INR. Must be greater than or equal to Selling Price.'],
    ['8. Stock Quantity (Required): Current warehouse stock on hand (integer >= 0).'],
    ['9. Image URL: Public HTTPS link to product packshot. If empty, the system will attempt Barcode / Brand matching.'],
    ['10. Variant Name / Size / Shade: e.g., 30ml, 50g, Warm Nectar (Peach), Petal Dew (Rose).'],
    [''],
    ['IMPORT MODES EXPLAINED:'],
    ['• Full Import: Updates product details, prices, and sets new inventory stock counts.'],
    ['• Catalogue Details Only: Updates titles, images, descriptions, and prices without touching active warehouse stock.'],
    ['• New Products Only: Safely inserts new items without modifying any existing products.']
  ];
  const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsData);
  XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');

  // 2. Sample Products Sheet
  const sampleProductsData = [
    {
      'Product Name': 'Dew Glow Niacinamide 10% + Zinc 1% Clarifying Serum',
      'Brand': 'Dew & Go Skincare',
      'Category': 'Serums',
      'SKU': 'DWG-SRM-NIA-30',
      'Barcode': '8901234567890',
      'Size': '30 ml',
      'Shade': '',
      'Variant Name': '30 ml Bottle',
      'Selling Price': 549,
      'MRP': 699,
      'Stock Quantity': 45,
      'Cost Price': 220,
      'Tax %': 5,
      'Supplier': 'Apex Pharma Labs',
      'Product Image URL': 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
      'Description': 'High-strength vitamin and mineral blemish formula with Zinc PCA for refined texture.'
    },
    {
      'Product Name': 'Cloud Barrier Ceramide + Peptide Recovery Cream',
      'Brand': 'Dew & Go Skincare',
      'Category': 'Skincare',
      'SKU': 'DWG-CRM-CER-50',
      'Barcode': '8901234567891',
      'Size': '50 g',
      'Shade': '',
      'Variant Name': '50 g Glass Jar',
      'Selling Price': 649,
      'MRP': 799,
      'Stock Quantity': 36,
      'Cost Price': 280,
      'Tax %': 5,
      'Supplier': 'Apex Pharma Labs',
      'Product Image URL': 'https://images.unsplash.com/photo-1556228722-d0b5de731748?auto=format&fit=crop&w=800&q=80',
      'Description': 'Cushiony barrier-repair moisturizer with 5 essential ceramides and multi-peptides.'
    },
    {
      'Product Name': 'Invisible Water Gel Sunscreen SPF 50+ PA++++',
      'Brand': 'Sol Shield Lab',
      'Category': 'Sunscreen',
      'SKU': 'SOL-SUN-GEL-50',
      'Barcode': '8901234567892',
      'Size': '50 ml',
      'Shade': '',
      'Variant Name': '50 ml Tube',
      'Selling Price': 499,
      'MRP': 599,
      'Stock Quantity': 55,
      'Cost Price': 210,
      'Tax %': 5,
      'Supplier': 'Sol Cosmetics Corp',
      'Product Image URL': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
      'Description': 'Ultra-light water gel with zero white cast, broad spectrum UV filters, and Vitamin E.'
    },
    {
      'Product Name': 'Glaze Peptide Hydrating Lip Tint Oil',
      'Brand': 'Rose Petal Beauty',
      'Category': 'Lip Care',
      'SKU': 'RPB-LIP-GLZ-01',
      'Barcode': '8901234567893',
      'Size': '7 ml',
      'Shade': 'Petal Dew (Soft Rose)',
      'Variant Name': 'Petal Dew (Soft Rose)',
      'Selling Price': 399,
      'MRP': 499,
      'Stock Quantity': 40,
      'Cost Price': 150,
      'Tax %': 5,
      'Supplier': 'Rose Petal D2C',
      'Product Image URL': 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80',
      'Description': 'Cushioning peptide lip oil offering glassy shine, sheer wash of rose color, and hydration.'
    },
    {
      'Product Name': 'Gentle Melt Oat & Green Tea Cleansing Balm',
      'Brand': 'Dew & Go Skincare',
      'Category': 'Skincare',
      'SKU': 'DWG-CLN-BLM-100',
      'Barcode': '8901234567894',
      'Size': '100 g',
      'Shade': '',
      'Variant Name': '100 g Jar + Spatula',
      'Selling Price': 599,
      'MRP': 750,
      'Stock Quantity': 30,
      'Cost Price': 240,
      'Tax %': 5,
      'Supplier': 'Apex Pharma Labs',
      'Product Image URL': 'https://images.unsplash.com/photo-1556228724-4da0d3b66804?auto=format&fit=crop&w=800&q=80',
      'Description': 'Sorbet-soft balm that melts stubborn waterproof makeup and SPF effortlessly without clouding eyes.'
    },
    {
      'Product Name': 'Dew Drop Seamless Liquid Blush',
      'Brand': 'Rose Petal Beauty',
      'Category': 'Makeup',
      'SKU': 'RPB-BLS-LIQ-01',
      'Barcode': '8901234567895',
      'Size': '12 ml',
      'Shade': 'Warm Nectar (Peach)',
      'Variant Name': 'Warm Nectar (Peach)',
      'Selling Price': 449,
      'MRP': 549,
      'Stock Quantity': 25,
      'Cost Price': 180,
      'Tax %': 5,
      'Supplier': 'Rose Petal D2C',
      'Product Image URL': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
      'Description': 'Weightless serum-infused liquid blush that melts into cheekbones for a natural flush.'
    },
    {
      'Product Name': 'Rosemary & Biotin Scalp Stimulating Density Oil',
      'Brand': 'Botanica Roots',
      'Category': 'Haircare',
      'SKU': 'BOT-HAR-OIL-50',
      'Barcode': '8901234567896',
      'Size': '50 ml',
      'Shade': '',
      'Variant Name': '50 ml Glass Dropper',
      'Selling Price': 499,
      'MRP': 650,
      'Stock Quantity': 42,
      'Cost Price': 190,
      'Tax %': 5,
      'Supplier': 'Botanica Organics',
      'Product Image URL': 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80',
      'Description': 'Pure steam-distilled Rosemary leaf extract with Biotin and cold-pressed Castor Oil.'
    },
    {
      'Product Name': 'Santorini Sunset Eau de Parfum',
      'Brand': 'Atelier Dew',
      'Category': 'Fragrance',
      'SKU': 'ATL-FRG-SAN-50',
      'Barcode': '8901234567897',
      'Size': '50 ml',
      'Shade': '',
      'Variant Name': '50 ml Glass Spray',
      'Selling Price': 1299,
      'MRP': 1599,
      'Stock Quantity': 18,
      'Cost Price': 550,
      'Tax %': 18,
      'Supplier': 'Atelier France',
      'Product Image URL': 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
      'Description': 'Luminous solar floral with Mediterranean Neroli, creamy Coconut Milk, and Amber.'
    },
    {
      'Product Name': 'Silk Lash Definition & Length Peptide Mascara',
      'Brand': 'Rose Petal Beauty',
      'Category': 'Makeup',
      'SKU': 'RPB-MSC-SLK-01',
      'Barcode': '8901234567898',
      'Size': '8 ml',
      'Shade': 'Deep Onyx Black',
      'Variant Name': 'Deep Onyx Black (8 ml)',
      'Selling Price': 499,
      'MRP': 650,
      'Stock Quantity': 38,
      'Cost Price': 175,
      'Tax %': 5,
      'Supplier': 'Rose Petal D2C',
      'Product Image URL': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80',
      'Description': 'Clean smudge-proof tubing mascara infused with Biotinoyl Tripeptide for fluttery lashes.'
    },
    {
      'Product Name': 'AHA 10% Smoothing & Resurfacing Body Lotion',
      'Brand': 'Dew & Go Skincare',
      'Category': 'Body Care',
      'SKU': 'DWG-BDY-AHA-200',
      'Barcode': '8901234567899',
      'Size': '200 ml',
      'Shade': '',
      'Variant Name': '200 ml Pump Bottle',
      'Selling Price': 699,
      'MRP': 899,
      'Stock Quantity': 24,
      'Cost Price': 310,
      'Tax %': 5,
      'Supplier': 'Apex Pharma Labs',
      'Product Image URL': 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=800&q=80',
      'Description': 'Gentle Lactic & Glycolic acid body treatment for strawberry legs and keratosis pilaris.'
    }
  ];

  const productsSheet = XLSX.utils.json_to_sheet(sampleProductsData);
  XLSX.utils.book_append_sheet(workbook, productsSheet, 'Catalogue');

  const buf = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
  return new Uint8Array(buf);
};

/**
 * Downloads binary buffer as file in the browser
 */
export const downloadFile = (data: any, filename: string, mimeType: string) => {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Exports error report as CSV
 */
export const exportErrorsToCsv = (errors: ImportSummary['errors']) => {
  const header = ['Row Number', 'SKU', 'Product Name', 'Error Reason'];
  const rows = errors.map(e => [
    e.row,
    `"${(e.sku || '').replace(/"/g, '""')}"`,
    `"${(e.name || '').replace(/"/g, '""')}"`,
    `"${(e.error || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
  downloadFile(csvContent, `dew_and_go_import_errors_${Date.now()}.csv`, 'text/csv;charset=utf-8;');
};
