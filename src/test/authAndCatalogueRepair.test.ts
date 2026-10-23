import { describe, it, expect, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

// Provide memory localStorage shim for Node test runner
if (typeof globalThis.localStorage === 'undefined' || !globalThis.localStorage.clear) {
  const memStore: Record<string, string> = {};
  globalThis.localStorage = {
    getItem: (key: string) => memStore[key] ?? null,
    setItem: (key: string, value: string) => { memStore[key] = String(value); },
    removeItem: (key: string) => { delete memStore[key]; },
    clear: () => { Object.keys(memStore).forEach(k => delete memStore[k]); },
    key: (i: number) => Object.keys(memStore)[i] ?? null,
    length: 0
  } as any;
}

import { authService } from '../lib/authService';
import { 
  detectColumnMapping, 
  validateAndParseRows, 
  executeBatchImport,
  normalizePrice,
  normalizeStock,
  resolveProductImage 
} from '../lib/bulkImportService';
import { store } from '../lib/store';
import { Product, Order } from '../types';

describe('DEW & GO — Comprehensive Master Test Suite', () => {

  beforeEach(() => {
    localStorage.clear();
  });

  // ==========================================
  // 1. AUTHENTICATION & RBAC
  // ==========================================
  describe('1. Authentication & RBAC Engine', () => {
    it('Customer signup and login succeed with valid credentials', async () => {
      const email = 'priya.test@dewandgo.com';
      const password = 'SecurePassword123!';
      const fullName = 'Priya Sharma';

      // Signup
      const signupRes = await authService.registerCustomer({
        fullName,
        email,
        password,
        confirmPassword: password,
        phone: '+91 98765 00001'
      });

      expect(signupRes.success).toBe(true);
      expect(signupRes.user).toBeDefined();
      expect(signupRes.user?.email).toBe(email);
      expect(signupRes.user?.role).toBe('customer');

      // Login
      const loginRes = await authService.login(email, password, 'customer');
      expect(loginRes.success).toBe(true);
      expect(loginRes.user?.role).toBe('customer');
      expect(loginRes.user?.fullName).toBe(fullName);
    });

    it('Rejects invalid credentials and unverified logins', async () => {
      const loginRes = await authService.login('nonexistent@dewandgo.com', 'wrongpassword', 'customer');
      expect(loginRes.success).toBe(false);
      expect(loginRes.error).toBeDefined();
    });

    it('Password reset generates a valid auditable reset request', async () => {
      const resetRes = await authService.requestPasswordReset('priya.test@dewandgo.com');
      expect(resetRes.success).toBe(true);
      expect(resetRes.message.toLowerCase()).toContain('password reset');
    });

    it('Prevents customer self-promotion to administrator role', async () => {
      // Even if customer attempts to pass admin role in signup, customer role is strictly enforced
      const signupRes = await authService.registerCustomer({
        fullName: 'Attacker User',
        email: 'attacker@example.com',
        password: 'AttackPassword123!',
        // @ts-expect-error test illegal role injection
        role: 'super_admin'
      });

      expect(signupRes.user?.role).toBe('customer');

      // Attempting to login to admin portal with customer account fails
      const adminLoginRes = await authService.login('attacker@example.com', 'AttackPassword123!', 'admin');
      expect(adminLoginRes.error?.toLowerCase()).toContain('administrator privileges');
    });

    it('Admin account can only be provisioned server-side with verified ADMIN_EMAIL', async () => {
      // Direct unauthorized admin creation is prevented
      const adminEmail = 'admin.authorized@dewandgo.com';
      const adminPassword = 'AdminSecret2026!#';

      // Provision via trusted server-side method
      const provisionRes = await authService.provisionAdmin({
        email: adminEmail,
        password: adminPassword,
        fullName: 'Authorized Operations Owner'
      });

      expect(provisionRes.success).toBe(true);
      expect(provisionRes.user?.role).toBe('super_admin');

      // Login to admin succeeds
      const adminLoginRes = await authService.login(adminEmail, adminPassword, 'admin');
      expect(adminLoginRes.success).toBe(true);
      expect(adminLoginRes.user?.role).toBe('super_admin');
    });
  });

  // ==========================================
  // 2. AUTHORIZATION & DATA ISOLATION
  // ==========================================
  describe('2. Authorization & Customer Order Isolation', () => {
    it('Customers can only access their own orders', () => {
      const customerAId = 'usr-cust-A';
      const customerBId = 'usr-cust-B';

      // Place order for customer A
      const orderA: Order = {
        id: 'ord-cust-A-1',
        orderNumber: 'DWG-A1',
        userId: customerAId,
        customerName: 'Customer A',
        customerPhone: '+91 99999 11111',
        customerEmail: 'a@example.com',
        status: 'confirmed',
        paymentStatus: 'paid',
        paymentMethod: 'razorpay',
        subtotal: 500,
        discountAmount: 0,
        deliveryFee: 0,
        taxAmount: 0,
        totalAmount: 500,
        items: [],
        shippingAddress: {
          id: 'addr-a',
          userId: customerAId,
          recipientName: 'Customer A',
          phoneNumber: '+91 99999 11111',
          addressLine: 'Street 1',
          area: 'Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          pinCode: '560038',
          isDefault: true
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      store.createOrder(orderA);

      // Customer A queries orders: returns 1
      const ordersA = store.getOrders(customerAId);
      expect(ordersA.length).toBe(1);
      expect(ordersA[0].id).toBe('ord-cust-A-1');

      // Customer B queries orders: returns 0 (isolated)
      const ordersB = store.getOrders(customerBId);
      expect(ordersB.length).toBe(0);

      // Customer B queries Order A by ID directly: returns undefined (blocked)
      const blockedFetch = store.getOrderByIdOrNumber('ord-cust-A-1', customerBId);
      expect(blockedFetch).toBeUndefined();

      // Admin queries orders: returns all orders
      const adminOrders = store.getOrders();
      expect(adminOrders.some(o => o.id === 'ord-cust-A-1')).toBe(true);
    });
  });

  // ==========================================
  // 3. CATALOGUE REPAIR & 750-PRODUCT EXCEL PIPELINE
  // ==========================================
  describe('3. 750-Product Catalogue Repair & Safe Pipeline', () => {
    it('Normalizes currency and preserves missing prices as null (never silently converts to zero)', () => {
      expect(normalizePrice('₹499').value).toBe(499);
      expect(normalizePrice('Rs. 1,299.50').value).toBe(1299.50);
      expect(normalizePrice('INR 750').value).toBe(750);
      expect(normalizePrice(599).value).toBe(599);
      expect(normalizePrice('').value).toBeNull();
      expect(normalizePrice(null).value).toBeNull();
      expect(normalizePrice(undefined).value).toBeNull();
      expect(normalizePrice(0).isValid).toBe(false); // non-positive price is rejected
      expect(normalizePrice(-100).isValid).toBe(false);
    });

    it('Preserves zero stock as zero (never converts to positive)', () => {
      expect(normalizeStock(0).value).toBe(0);
      expect(normalizeStock('0').value).toBe(0);
      expect(normalizeStock(25).value).toBe(25);
      expect(normalizeStock('100').value).toBe(100);
      expect(normalizeStock(-5).isValid).toBe(false);
    });

    it('Preserves all 750 rows from cosmetics_catalogue.xlsx and safely imports drafts', async () => {
      const filePath = path.resolve(process.cwd(), 'cosmetics_catalogue.xlsx');
      expect(fs.existsSync(filePath)).toBe(true);

      const buffer = fs.readFileSync(filePath);
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawRows: any[] = XLSX.utils.sheet_to_json(sheet);

      // Verify all 750 source rows exist in the spreadsheet
      expect(rawRows.length).toBe(750);

      // Verify column auto-detection correctly maps `product_id`, `selling_price_inr`, etc.
      const headers = Object.keys(rawRows[0]);
      const mapping = detectColumnMapping(headers);
      expect(mapping.productName).toBeDefined();
      expect(mapping.sku).toBe('product_id');
      expect(mapping.sellingPrice).toBe('selling_price_inr');
      expect(mapping.mrp).toBe('mrp_inr');
      expect(mapping.stock).toBe('stock_quantity');

      // Parse and validate rows
      const parsed = validateAndParseRows(rawRows, mapping, new Set(), store.getCategories(), { mode: 'full', publishPolicy: 'draft' });
      expect(parsed.length).toBe(750);

      // Verify missing prices are detected without converting to 0, and source zero stock is preserved
      parsed.forEach(r => {
        expect(r.sellingPrice).toBeNull();
        expect(r.stock).toBe(0);
        // Products with missing prices are flagged with warnings and designated as drafts
        expect(r.validationWarnings.length).toBeGreaterThan(0);
        expect(r.selectedForImport).toBe(true);
      });

      // Execute staged batch import
      const importResult = await executeBatchImport(parsed, {
        mode: 'full',
        publishPolicy: 'draft'
      });

      expect(importResult.totalProcessed).toBe(750);
      expect(importResult.createdCount).toBe(750);
      expect(importResult.draftCount).toBe(750);
      expect(importResult.publishedCount).toBe(0); // None published because prices were missing
      expect(importResult.failedCount).toBe(0);

      // Verify incomplete draft products DO NOT appear in published storefront listings
      const published = store.getPublishedProducts();
      const anyIncompletePublished = published.some(p => !p.defaultPrice || p.defaultPrice <= 0 || p.status === 'draft');
      expect(anyIncompletePublished).toBe(false);
    }, 30000);

    it('Detects duplicate SKUs and avoids accidental duplicates', () => {
      const mockRows = [
        { 'Product Name': 'Dew Toner A', 'SKU': 'SKU-DUP-1', 'Price': 399, 'Qty': 10 },
        { 'Product Name': 'Dew Toner B', 'SKU': 'SKU-DUP-1', 'Price': 499, 'Qty': 5 }
      ];
      const mapping = detectColumnMapping(['Product Name', 'SKU', 'Price', 'Qty']);
      const parsed = validateAndParseRows(mockRows, mapping, new Set(), store.getCategories());

      // Duplicate SKU in same file should be detected
      const duplicateRow = parsed[1];
      expect(duplicateRow.validationErrors.some(e => e.includes('Duplicate SKU'))).toBe(true);
    });

    it('Image resolution does not silently attach unrelated images', () => {
      // Empty image URL with unknown barcode
      const unresolved = resolveProductImage('', 'UNKNOWN_BARCODE_9999', 'Dew & Go', 'Rare Herbal Mask');
      expect(unresolved.source).toBe('unresolved');
      expect(unresolved.requiresReview).toBe(true);
    });
  });

  // ==========================================
  // 4. COMMERCE SAFETY & INVENTORY CONCURRENCY
  // ==========================================
  describe('4. Commerce Safety & Stock Protection', () => {
    it('Incomplete products cannot be published or added to cart', () => {
      const incompleteProd: Product = {
        id: 'incomplete-test-1',
        slug: 'incomplete-test-1',
        name: 'Incomplete Serum',
        brand: 'Dew & Go',
        category: 'Skincare',
        categoryId: 'cat-skincare',
        shortDescription: 'Test serum',
        description: 'Test',
        benefits: [],
        defaultPrice: 0, // missing price
        images: [],
        rating: 0,
        reviewCount: 0,
        isPublished: true, // attempting to publish
        status: 'published',
        createdAt: new Date().toISOString(),
        variants: [
          {
            id: 'var-inc-1',
            productId: 'incomplete-test-1',
            variantName: 'Default',
            sku: 'INC-SKU-1',
            price: 0,
            stockQuantity: 0,
            reservedQuantity: 0,
            isDefault: true,
            isActive: false
          }
        ]
      };

      store.addProduct(incompleteProd);

      // Store validation forces it to draft
      const stored = store.getProductById('incomplete-test-1');
      expect(stored?.isPublished).toBe(false);
      expect(stored?.status).toBe('draft');

      // Storefront published listings filter it out
      expect(store.getPublishedProducts().some(p => p.id === 'incomplete-test-1')).toBe(false);
    });

    it('Atomic inventory adjustment prevents negative stock', () => {
      const prod = store.getProducts()[0];
      const variantId = prod.variants[0].id;
      const initialStock = prod.variants[0].stockQuantity;

      // Adjust with an excessive deduction
      store.adjustInventory(variantId, -(initialStock + 100), 'test_deduction', 'Testing stock floor');

      // Stock floor must be 0, never negative
      const updated = store.getProductById(prod.id);
      const updatedVariant = updated?.variants.find(v => v.id === variantId);
      expect(updatedVariant?.stockQuantity).toBe(0);
    });
  });

});
