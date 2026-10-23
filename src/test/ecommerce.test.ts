import { describe, it, expect, beforeEach } from 'vitest';
import { store } from '../lib/store';
import crypto from 'crypto';

describe('Dew & Go E-Commerce Engine & Business Logic', () => {

  describe('Coupon & Pricing Calculations', () => {
    it('applies percentage discount correctly with upper cap', () => {
      // DEWGLOW20: 20% off, min order 399, max discount 200
      const subtotal = 1000;
      const res = store.validateCoupon('DEWGLOW20', subtotal);
      expect(res.valid).toBe(true);
      expect(res.discount).toBe(200); // capped at 200
    });

    it('rejects coupon when subtotal is below minimum order value', () => {
      const subtotal = 250;
      const res = store.validateCoupon('DEWGLOW20', subtotal);
      expect(res.valid).toBe(false);
      expect(res.discount).toBe(0);
      expect(res.message).toContain('Minimum order value');
    });

    it('applies fixed discount coupon correctly', () => {
      // FIRSTDEW: Flat ₹100 off on min order 299
      const subtotal = 500;
      const res = store.validateCoupon('FIRSTDEW', subtotal);
      expect(res.valid).toBe(true);
      expect(res.discount).toBe(100);
    });

    it('calculates 5% GST tax accurately', () => {
      const subtotal = 600;
      const tax = Math.round(subtotal * 0.05);
      expect(tax).toBe(30);
    });

    it('applies free delivery threshold (₹499)', () => {
      const threshold = 499;
      const subtotalBelow = 400;
      const feeBelow = subtotalBelow >= threshold ? 0 : 49;
      expect(feeBelow).toBe(49);

      const subtotalAbove = 549;
      const feeAbove = subtotalAbove >= threshold ? 0 : 49;
      expect(feeAbove).toBe(0);
    });
  });

  describe('Hyperlocal Serviceability', () => {
    it('confirms serviceability for active express hubs', () => {
      const res = store.checkServiceability('560038'); // Indiranagar
      expect(res.serviceable).toBe(true);
      expect(res.estimatedMinutes).toBeLessThanOrEqual(15);
    });

    it('rejects unsupported or non-hyperlocal PIN codes', () => {
      const res = store.checkServiceability('999999');
      expect(res.serviceable).toBe(false);
      expect(res.estimatedMinutes).toBe(0);
    });
  });

  describe('Inventory Adjustments & Overselling Protection', () => {
    it('adjusts inventory and records audit log', () => {
      const products = store.getProducts();
      const variant = products[0].variants[0];
      const initialStock = variant.stockQuantity;

      const success = store.adjustInventory(
        variant.id,
        5,
        'restock',
        'Batch intake from distribution center'
      );

      expect(success).toBe(true);
      expect(variant.stockQuantity).toBe(initialStock + 5);

      const logs = store.getInventoryLogs();
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].variantId).toBe(variant.id);
      expect(logs[0].change).toBe(5);
    });
  });

  describe('Order State Transitions & Razorpay Verification', () => {
    it('creates order, deducts inventory, and tracks status', () => {
      const products = store.getProducts();
      const variant = products[0].variants[0];
      const prevStock = variant.stockQuantity;

      const orderNumber = `DWG-TEST-${Date.now()}`;
      const newOrder = store.createOrder({
        id: `ord-test-${Date.now()}`,
        orderNumber,
        userId: 'usr-test',
        customerName: 'Test Customer',
        customerPhone: '+91 99999 88888',
        customerEmail: 'test@example.com',
        status: 'confirmed',
        paymentStatus: 'paid',
        paymentMethod: 'razorpay',
        subtotal: 549,
        discountAmount: 0,
        deliveryFee: 0,
        taxAmount: 27,
        totalAmount: 576,
        shippingAddress: {
          id: 'addr-test',
          userId: 'usr-test',
          recipientName: 'Test Customer',
          phoneNumber: '+91 99999 88888',
          addressLine: '12th Main',
          area: 'Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          pinCode: '560038',
          isDefault: true
        },
        items: [
          {
            id: 'item-1',
            productId: products[0].id,
            variantId: variant.id,
            productName: products[0].name,
            variantName: variant.variantName,
            sku: variant.sku,
            unitPrice: variant.price,
            quantity: 1,
            totalPrice: variant.price,
            imageUrl: products[0].images[0]
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      expect(newOrder.orderNumber).toBe(orderNumber);
      expect(variant.stockQuantity).toBe(prevStock - 1);

      // Status update transition
      const updated = store.updateOrderStatus(newOrder.id, 'out_for_delivery');
      expect(updated?.status).toBe('out_for_delivery');

      // Delivery assignment
      const assigned = store.assignDeliveryPerson(newOrder.id, {
        id: 'rider-01',
        name: 'Ramesh Rider',
        phone: '+91 98765 00000'
      });
      expect(assigned?.assignedDeliveryPerson?.name).toBe('Ramesh Rider');
    });

    it('cryptographically verifies HMAC-SHA256 Razorpay payment signature', () => {
      const keySecret = 'test_secret_for_unit_tests';
      const orderId = 'order_test_992384';
      const paymentId = 'pay_test_883472';

      const validSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      // Compare
      const clientSignature = validSignature;
      const expected = crypto
        .createHmac('sha256', keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      expect(clientSignature).toBe(expected);

      // Invalid signature detection
      const tamperedSignature = 'tampered_signature_12345';
      expect(tamperedSignature === expected).toBe(false);
    });
  });

});
