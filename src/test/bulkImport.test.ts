import { describe, it, expect, beforeEach } from 'vitest';
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
import { INITIAL_CATEGORIES } from '../data/seedData';

describe('DEW & GO — Bulk Excel Product Import Engine', () => {

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

});
