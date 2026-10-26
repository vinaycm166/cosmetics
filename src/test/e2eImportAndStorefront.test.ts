import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as XLSX from 'xlsx';
import path from 'path';
import { 
  detectColumnMapping, 
  validateAndParseRows, 
  executeBatchImport 
} from '../lib/bulkImportService';
import { store, isEligibleForPublish, getUnpublishedReason } from '../lib/store';
import { INITIAL_CATEGORIES, BASE_INITIAL_PRODUCTS, INITIAL_PRODUCTS } from '../data/seedData';

describe('DEW & GO — Full End-to-End Catalogue Synchronization Verification', () => {
  const xlsxPath = path.resolve(__dirname, '../../public/test_77_catalogue.xlsx');

  beforeAll(() => {
    store.resetTo(BASE_INITIAL_PRODUCTS);
  });

  afterAll(() => {
    store.resetTo(INITIAL_PRODUCTS);
  });

  it('Step 1-4: Reads Excel file, detects columns, parses and imports 77 products as drafts', async () => {
    // 1. Read the Excel workbook
    const wb = XLSX.readFile(xlsxPath);
    expect(wb.SheetNames).toContain('Catalogue');
    const sheet = wb.Sheets['Catalogue'];
    const rawRows = XLSX.utils.sheet_to_json<any>(sheet);
    expect(rawRows.length).toBe(77);

    // 2. Detect column mapping
    const headers = Object.keys(rawRows[0]);
    const mapping = detectColumnMapping(headers);
    expect(mapping.productName).toBe('Product Name');
    expect(mapping.brand).toBe('Brand');
    expect(mapping.category).toBe('Category');
    expect(mapping.sku).toBe('SKU');
    expect(mapping.sellingPrice).toBe('Selling Price');
    expect(mapping.stock).toBe('Stock Quantity');
    expect(mapping.imageUrl).toBe('Image URL');

    // 3. Validate rows
    const existingSkus = new Set(
      store.getProducts().flatMap(p => p.variants.map(v => v.sku.toLowerCase()))
    );
    const parsedRows = validateAndParseRows(rawRows, mapping, existingSkus, INITIAL_CATEGORIES);
    expect(parsedRows.length).toBe(77);
    expect(parsedRows.every(r => r.validationStatus !== 'error')).toBe(true);
    expect(parsedRows.every(r => r.validationErrors.length === 0)).toBe(true);

    // 4. Execute Batch Import with publishPolicy = 'draft' (safe production practice)
    const summary = await executeBatchImport(parsedRows, {
      mode: 'full',
      publishPolicy: 'draft'
    });

    // 5. Verify database/store import statistics
    expect(summary.totalProcessed).toBe(77);
    expect(summary.createdCount).toBe(77);
    expect(summary.updatedCount).toBe(0);
    expect(summary.skippedCount).toBe(0);
    expect(summary.failedCount).toBe(0);
    expect(summary.draftCount).toBe(77);
    expect(summary.publishedCount).toBe(0);
  });

  it('Step 5-7: Verifies all 77 products in the database are drafts and not live to customers', () => {
    const allProducts = store.getProducts();
    const imported77 = allProducts.filter(p => p.name.startsWith('Aura Silk Peptide Elixir #'));
    expect(imported77.length).toBe(77);

    // Verify all 77 have unique SKUs and valid attributes
    const skus = new Set(imported77.map(p => p.variants[0]?.sku));
    expect(skus.size).toBe(77);

    // Verify draft status
    for (const p of imported77) {
      expect(p.status).toBe('draft');
      expect(p.isPublished).toBe(false);
      expect(p.defaultPrice).toBeGreaterThan(0);
      expect(p.images.length).toBeGreaterThan(0);
      expect(isEligibleForPublish(p)).toBe(true);
      expect(getUnpublishedReason(p)).toBe('Ready to Publish');
    }

    // Customer storefront query MUST return ZERO of these 77 draft products
    const liveProducts = store.getPublishedProducts();
    const liveAura = liveProducts.filter(p => p.name.startsWith('Aura Silk Peptide Elixir #'));
    expect(liveAura.length).toBe(0);
  });

  it('Step 8-13: Admin publishes an eligible test product and customer storefront updates immediately', () => {
    const allProducts = store.getProducts();
    const testProduct = allProducts.find(p => p.name === 'Aura Silk Peptide Elixir #1');
    expect(testProduct).toBeDefined();

    // Publish the test product via admin action
    const pubRes = store.publishProduct(testProduct!.id);
    expect(pubRes.success).toBe(true);

    // Refresh live catalogue
    const liveCatalogue = store.getPublishedProducts();
    const publishedTestProd = liveCatalogue.find(p => p.id === testProduct!.id);
    expect(publishedTestProd).toBeDefined();
    expect(publishedTestProd?.name).toBe('Aura Silk Peptide Elixir #1');
    expect(publishedTestProd?.status).toBe('published');
    expect(publishedTestProd?.isPublished).toBe(true);

    // Ensure all other 76 products remain strictly unpublished
    const otherAuraLive = liveCatalogue.filter(
      p => p.name.startsWith('Aura Silk Peptide Elixir #') && p.id !== testProduct!.id
    );
    expect(otherAuraLive.length).toBe(0);

    // Verify customer search matching
    const searchMatch = liveCatalogue.filter(p => 
      p.name.toLowerCase().includes('aura silk peptide elixir #1')
    );
    expect(searchMatch.length).toBe(1);
    expect(searchMatch[0].id).toBe(testProduct!.id);

    // Verify product detail page resolution
    const detailProd = store.getProductBySlug(testProduct!.slug);
    expect(detailProd).toBeDefined();
    expect(detailProd?.defaultPrice).toBe(testProduct!.defaultPrice);
    expect(detailProd?.variants[0]?.stockQuantity).toBe(testProduct!.variants[0]?.stockQuantity);

    // Verify Category synchronization
    const category = store.getCategories().find(c => c.name.toLowerCase() === testProduct!.category.toLowerCase());
    expect(category).toBeDefined();
    expect(category!.productCount).toBeGreaterThan(0);
  });

  it('Step 14: Repeat import of the same spreadsheet updates existing records without creating duplicates', async () => {
    const countBefore = store.getProducts().length;

    // Read workbook again
    const wb = XLSX.readFile(xlsxPath);
    const sheet = wb.Sheets['Catalogue'];
    const rawRows = XLSX.utils.sheet_to_json<any>(sheet);
    const headers = Object.keys(rawRows[0]);
    const mapping = detectColumnMapping(headers);

    const existingSkus = new Set(
      store.getProducts().flatMap(p => p.variants.map(v => v.sku.toLowerCase()))
    );
    const parsedRows = validateAndParseRows(rawRows, mapping, existingSkus, INITIAL_CATEGORIES);

    // Re-import the 77 rows
    const summary = await executeBatchImport(parsedRows, {
      mode: 'full',
      publishPolicy: 'draft'
    });

    // Idempotency check: 0 created, 77 updated
    expect(summary.totalProcessed).toBe(77);
    expect(summary.createdCount).toBe(0);
    expect(summary.updatedCount).toBe(77);
    expect(summary.skippedCount).toBe(0);
    expect(summary.failedCount).toBe(0);

    // Total catalogue size MUST remain identical (zero duplicates)
    const countAfter = store.getProducts().length;
    expect(countAfter).toBe(countBefore);
  });
});
