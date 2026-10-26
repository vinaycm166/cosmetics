import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import * as XLSX from 'xlsx';
import { 
  generateSampleWorkbook, 
  detectColumnMapping, 
  resolveProductImage, 
  validateAndParseRows, 
  executeBatchImport,
  ColumnMapping,
  RawRowData,
  PLACEHOLDER_COSMETIC_IMAGE
} from '../lib/bulkImportService';
import { store } from '../lib/store';
import { INITIAL_CATEGORIES, BASE_INITIAL_PRODUCTS, INITIAL_PRODUCTS } from '../data/seedData';

describe('DEW & GO — Bulk Excel Product Import Engine', () => {
  beforeAll(() => {
    store.resetTo(BASE_INITIAL_PRODUCTS);
  });

  afterAll(() => {
    store.resetTo(INITIAL_PRODUCTS);
  });

  it('1. Generates a valid sample Excel workbook with Instructions and Catalogue sheets', () => {
    const buffer = generateSampleWorkbook();
    expect(buffer).toBeDefined();
    expect(buffer.length).toBeGreaterThan(100);

    // Read back buffer via XLSX
    const wb = XLSX.read(buffer, { type: 'array' });
    expect(wb.SheetNames).toContain('Instructions');
    expect(wb.SheetNames).toContain('Catalogue');

    const products = XLSX.utils.sheet_to_json(wb.Sheets['Catalogue']);
    expect(products.length).toBeGreaterThanOrEqual(10);
    const firstProduct: any = products[0];
    expect(firstProduct['Product Name']).toBeDefined();
    expect(firstProduct['Selling Price']).toBeGreaterThan(0);
    expect(firstProduct['SKU']).toBeDefined();
  });

  it('2. Smart Column Detection automatically maps diverse supplier headers', () => {
    const supplierHeaders = [
      'Item Title',
      'Vendor',
      'Product Category',
      'SKU_Code',
      'Barcode_Number',
      'Sale Price',
      'MRP_INR',
      'Inventory Qty',
      'Product Image URL',
      'About'
    ];

    const mapping = detectColumnMapping(supplierHeaders);
    expect(mapping.productName).toBe('Item Title');
    expect(mapping.brand).toBe('Vendor');
    expect(mapping.category).toBe('Product Category');
    expect(mapping.sku).toBe('SKU_Code');
    expect(mapping.barcode).toBe('Barcode_Number');
    expect(mapping.sellingPrice).toBe('Sale Price');
    expect(mapping.mrp).toBe('MRP_INR');
    expect(mapping.stock).toBe('Inventory Qty');
    expect(mapping.imageUrl).toBe('Product Image URL');
    expect(mapping.description).toBe('About');
  });

  it('3. Image Resolution prioritizes direct URLs, barcodes, and marks unresolved for review', () => {
    // 3a. Direct valid HTTPS image URL
    const directRes = resolveProductImage('https://images.example.com/serum.jpg', '12345', 'Dew', 'Serum');
    expect(directRes.source).toBe('direct_url');
    expect(directRes.imageUrl).toBe('https://images.example.com/serum.jpg');
    expect(directRes.requiresReview).toBe(false);

    // 3b. Barcode match in verified registry
    const barcodeRes = resolveProductImage('', '8901234567890', 'Unknown Brand', 'Unknown Title');
    expect(barcodeRes.source).toBe('barcode_match');
    expect(barcodeRes.imageUrl).toContain('images.unsplash.com');
    expect(barcodeRes.requiresReview).toBe(false);

    // 3c. Unresolved fallback
    const unresolvedRes = resolveProductImage('', '9999999999999', 'Fake Brand', 'Nonexistent Product 99');
    expect(unresolvedRes.source).toBe('unresolved');
    expect(unresolvedRes.imageUrl).toBe(PLACEHOLDER_COSMETIC_IMAGE);
    expect(unresolvedRes.requiresReview).toBe(true);
  });

  it('4. Row Validation catches missing product names, negative stock, and invalid prices', () => {
    const rawRows: RawRowData[] = [
      {
        'Title': '', // missing
        'Price': 499,
        'Qty': 20,
        'SKU': 'TEST-SKU-01'
      },
      {
        'Title': 'Valid Serum',
        'Price': -50, // invalid price
        'Qty': 10,
        'SKU': 'TEST-SKU-02'
      },
      {
        'Title': 'Valid Sunscreen',
        'Price': 399,
        'Qty': -5, // negative stock
        'SKU': 'TEST-SKU-03'
      },
      {
        'Title': 'Perfect Product',
        'Brand': 'Dew & Go Skincare',
        'Category': 'Skincare',
        'Price': 599,
        'MRP': 799,
        'Qty': 50,
        'SKU': 'TEST-SKU-04',
        'Image': 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80'
      }
    ];

    const mapping: ColumnMapping = {
      productName: 'Title',
      brand: 'Brand',
      category: 'Category',
      sku: 'SKU',
      sellingPrice: 'Price',
      mrp: 'MRP',
      stock: 'Qty',
      imageUrl: 'Image'
    };

    const existingSkus = new Set<string>();
    const validated = validateAndParseRows(rawRows, mapping, existingSkus, INITIAL_CATEGORIES);

    expect(validated.length).toBe(4);
    expect(validated[0].validationStatus).toBe('error');
    expect(validated[0].validationErrors).toContain('Product name is required.');

    expect(validated[1].validationStatus).toBe('error');
    expect(validated[1].validationErrors).toContain('Selling price must be a valid positive number.');

    expect(validated[2].validationStatus).toBe('error');
    expect(validated[2].validationErrors).toContain('Stock quantity must be a non-negative integer.');

    expect(validated[3].validationStatus).toBe('valid');
    expect(validated[3].validationErrors.length).toBe(0);
    expect(validated[3].sellingPrice).toBe(599);
    expect(validated[3].mrp).toBe(799);
    expect(validated[3].discountPercentage).toBe(25);
  });

  it('5. Batch Execution creates new products and updates inventory audit logs', async () => {
    const uniqueSku = `TEST-IMPORT-SKU-${Date.now()}`;
    const testRows: any[] = [
      {
        rowIndex: 1,
        productName: 'Hydra Burst Vitamin E Face Mist',
        brand: 'Dew & Go Skincare',
        category: 'Skincare',
        sku: uniqueSku,
        description: 'Instant facial hydration mist.',
        variantName: '100 ml Spray',
        sellingPrice: 349,
        mrp: 449,
        discountPercentage: 22,
        stock: 35,
        imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
        additionalImages: [],
        imageResolutionSource: 'direct_url',
        requiresImageReview: false,
        validationStatus: 'valid',
        validationErrors: [],
        validationWarnings: [],
        selectedForImport: true
      }
    ];

    const summary = await executeBatchImport(testRows, {
      mode: 'full',
      publishPolicy: 'published'
    });

    expect(summary.createdCount).toBe(1);
    expect(summary.failedCount).toBe(0);

    // Verify product exists in store
    const stored = store.getProducts().find(p => p.variants.some(v => v.sku === uniqueSku));
    expect(stored).toBeDefined();
    expect(stored?.name).toBe('Hydra Burst Vitamin E Face Mist');
    expect(stored?.defaultPrice).toBe(349);

    // Verify stock and inventory movement log
    const variant = stored?.variants.find(v => v.sku === uniqueSku);
    expect(variant?.stockQuantity).toBe(35);

    const logs = store.getInventoryLogs();
    const importLog = logs.find(l => l.sku === uniqueSku);
    expect(importLog).toBeDefined();
    expect(importLog?.newStock).toBe(35);
  });

  it('6. Catalogue-only mode updates pricing but preserves existing warehouse stock', async () => {
    const existingProduct = store.getProducts()[0];
    const existingVariant = existingProduct.variants[0];
    const initialStock = existingVariant.stockQuantity;
    const initialPrice = existingVariant.price;
    const targetPrice = initialPrice + 50;

    const testRows: any[] = [
      {
        rowIndex: 1,
        productName: existingProduct.name,
        brand: existingProduct.brand,
        category: existingProduct.category,
        sku: existingVariant.sku,
        description: 'Updated description through catalogue import.',
        variantName: existingVariant.variantName,
        sellingPrice: targetPrice,
        mrp: targetPrice + 100,
        discountPercentage: 15,
        stock: 999, // Should NOT overwrite in catalogue_only mode!
        imageUrl: existingProduct.images[0],
        additionalImages: [],
        imageResolutionSource: 'direct_url',
        requiresImageReview: false,
        validationStatus: 'valid',
        validationErrors: [],
        validationWarnings: [],
        selectedForImport: true
      }
    ];

    const summary = await executeBatchImport(testRows, {
      mode: 'catalogue_only',
      publishPolicy: 'published'
    });

    expect(summary.updatedCount).toBe(1);

    // Re-fetch from store
    const updatedProd = store.getProductById(existingProduct.id);
    const updatedVariant = updatedProd?.variants.find(v => v.sku === existingVariant.sku);

    // Stock should be preserved!
    expect(updatedVariant?.stockQuantity).toBe(initialStock);
    expect(updatedVariant?.price).toBe(targetPrice);
  });

  it('7. 77 new spreadsheet entries are accurately counted as 77 CREATED and 0 UPDATED', async () => {
    // Generate 77 realistic supplier rows
    const test77Rows: any[] = [];
    const timestamp = Date.now();
    for (let i = 1; i <= 77; i++) {
      test77Rows.push({
        rowIndex: i,
        productName: `Glow Product ${i}`,
        brand: 'Luxe Botanicals',
        category: i % 2 === 0 ? 'Skincare' : 'Haircare',
        sku: `LUXE-77-SKU-${timestamp}-${i}`,
        description: `Premium beauty formula item #${i}`,
        variantName: '50ml',
        sellingPrice: 400 + i * 5,
        mrp: 600 + i * 5,
        discountPercentage: 20,
        stock: 25,
        imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
        additionalImages: [],
        imageResolutionSource: 'direct_url',
        requiresImageReview: false,
        validationStatus: 'valid',
        validationErrors: [],
        validationWarnings: [],
        selectedForImport: true
      });
    }

    const summary = await executeBatchImport(test77Rows, {
      mode: 'full',
      publishPolicy: 'draft' // Draft policy: safely imported as drafts
    });

    // Verify accurate metrics: 77 created, 0 updated, 0 skipped, 0 failed
    expect(summary.totalProcessed).toBe(77);
    expect(summary.createdCount).toBe(77);
    expect(summary.updatedCount).toBe(0);
    expect(summary.skippedCount).toBe(0);
    expect(summary.failedCount).toBe(0);
    expect(summary.draftCount).toBe(77);
    expect(summary.publishedCount).toBe(0);

    // Verify that draft products are NOT visible on the customer storefront
    const published = store.getPublishedProducts();
    const customerVisibleLuxe = published.filter(p => p.brand === 'Luxe Botanicals');
    expect(customerVisibleLuxe.length).toBe(0);
  });

  it('8. Re-importing the same 77 rows updates existing items (0 created, 77 updated) with zero duplicates', async () => {
    // Re-run the batch with updated prices
    const existingLuxeProducts = store.getProducts().filter(p => p.brand === 'Luxe Botanicals');
    expect(existingLuxeProducts.length).toBe(77);

    const reimportRows: any[] = existingLuxeProducts.map((p, idx) => ({
      rowIndex: idx + 1,
      productName: p.name,
      brand: p.brand,
      category: p.category,
      sku: p.variants[0].sku,
      description: p.description,
      variantName: p.variants[0].variantName,
      sellingPrice: (p.defaultPrice || 500) + 10,
      mrp: (p.mrp || 700) + 10,
      discountPercentage: 20,
      stock: 30,
      imageUrl: p.images[0],
      additionalImages: [],
      imageResolutionSource: 'direct_url',
      requiresImageReview: false,
      validationStatus: 'valid',
      validationErrors: [],
      validationWarnings: [],
      selectedForImport: true
    }));

    const summary = await executeBatchImport(reimportRows, {
      mode: 'full',
      publishPolicy: 'draft'
    });

    expect(summary.totalProcessed).toBe(77);
    expect(summary.createdCount).toBe(0);
    expect(summary.updatedCount).toBe(77);
    expect(summary.skippedCount).toBe(0);
    expect(summary.failedCount).toBe(0);

    // Total Luxe products should still be exactly 77 (no duplicates)
    const afterReimport = store.getProducts().filter(p => p.brand === 'Luxe Botanicals');
    expect(afterReimport.length).toBe(77);
  });

  it('9. Draft safety: Incomplete products cannot be published, but eligible products publish and become visible to customers', () => {
    // 1. Create an incomplete draft (missing price)
    const incompleteDraft: any = {
      id: 'incomplete-test-id-1',
      name: 'Incomplete Serum',
      slug: 'incomplete-serum',
      brand: 'Test Lab',
      category: 'Skincare',
      description: 'Missing price',
      defaultPrice: 0, // Incomplete!
      images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80'],
      status: 'draft',
      isPublished: false,
      variants: [{
        id: 'var-inc-1',
        variantName: '30ml',
        price: 0,
        sku: 'INC-SKU-001',
        stockQuantity: 10
      }]
    };
    store.addProduct(incompleteDraft);

    // Attempting to publish incomplete product should fail
    const pubRes1 = store.publishProduct(incompleteDraft.id);
    expect(pubRes1.success).toBe(false);
    expect(pubRes1.error).toContain('Valid selling price greater than ₹0 is required');

    // 2. Publish an eligible product from the Luxe batch
    const luxeProduct = store.getProducts().find(p => p.brand === 'Luxe Botanicals')!;
    expect(luxeProduct).toBeDefined();

    const pubRes2 = store.publishProduct(luxeProduct.id);
    expect(pubRes2.success).toBe(true);

    // Verify it is now immediately returned in store.getPublishedProducts()
    const liveCatalogue = store.getPublishedProducts();
    const isNowLive = liveCatalogue.some(p => p.id === luxeProduct.id);
    expect(isNowLive).toBe(true);

    // The incomplete draft is still NOT live
    const isIncompleteLive = liveCatalogue.some(p => p.id === incompleteDraft.id);
    expect(isIncompleteLive).toBe(false);
  });

  it('10. Bulk publish publishes eligible drafts while retaining incomplete drafts safely in draft', () => {
    const initialLiveCount = store.getPublishedProducts().length;
    
    // Run bulk publish
    const bulkRes = store.bulkPublishEligible();
    expect(bulkRes.publishedCount).toBeGreaterThan(0);

    const newLiveCount = store.getPublishedProducts().length;
    expect(newLiveCount).toBe(initialLiveCount + bulkRes.publishedCount);

    // Incomplete draft created in test 9 should still remain a draft
    const incomplete = store.getProducts().find(p => p.name === 'Incomplete Serum');
    expect(incomplete?.status).toBe('draft');
    expect(incomplete?.isPublished).toBe(false);
  });

});
