import { describe, it, expect } from 'vitest';
import { store } from '../lib/store';
import { isValidImageUrl } from '../components/common/ProductImage';

describe('Dew & Go: Gokulam Mysuru Local Delivery & Product Photography Repair', () => {

  describe('1. Image URL Validation & Fallback Strategy', () => {
    it('correctly identifies valid verified HTTP/HTTPS product photograph URLs', () => {
      expect(isValidImageUrl('https://images.unsplash.com/photo-1522337360788-8b13dee7a37e')).toBe(true);
      expect(isValidImageUrl('http://res.cloudinary.com/brand/image/upload/serum.jpg')).toBe(true);
      expect(isValidImageUrl('https://supabase.co/storage/v1/object/public/products/cleanser.webp')).toBe(true);
    });

    it('correctly identifies uploaded Base64 data URLs as valid images', () => {
      expect(isValidImageUrl('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=')).toBe(true);
    });

    it('identifies unhosted relative catalogue filenames as invalid to prevent broken image displays', () => {
      expect(isValidImageUrl('Minimalist/SKU0001.jpg')).toBe(false);
      expect(isValidImageUrl('products/toner.png')).toBe(false);
      expect(isValidImageUrl('SKU0099.jpg')).toBe(false);
    });

    it('identifies empty, whitespace, and undefined image values as invalid', () => {
      expect(isValidImageUrl('')).toBe(false);
      expect(isValidImageUrl('   ')).toBe(false);
      expect(isValidImageUrl(undefined)).toBe(false);
      expect(isValidImageUrl(null as any)).toBe(false);
    });
  });

  describe('2. Gokulam, Mysuru Hyperlocal Service Area Validation', () => {
    it('validates that Gokulam, Mysuru (PIN 570002) is configured and serviceable', () => {
      const result = store.checkServiceability('570002');
      expect(result.serviceable).toBe(true);
      expect(result.zone).toBeDefined();
      expect(result.zone?.zoneName).toContain('Gokulam');
      expect(result.zone?.supportedPincodes).toContain('570002');
      expect(result.estimatedMinutes).toBeGreaterThan(0);
    });

    it('validates that regional Mysuru zones (Jayalakshmipuram 570012, Saraswathipuram 570009) are active', () => {
      const jayalakshmi = store.checkServiceability('570012');
      expect(jayalakshmi.serviceable).toBe(true);
      expect(jayalakshmi.zone?.zoneName).toContain('Jayalakshmipuram');

      const saraswathi = store.checkServiceability('570009');
      expect(saraswathi.serviceable).toBe(true);
    });

    it('rejects unconfigured PIN codes and does not falsely claim full Mysuru coverage', () => {
      // 570099 is not a configured micro-hub
      const unconfigured = store.checkServiceability('570099');
      expect(unconfigured.serviceable).toBe(false);
      expect(unconfigured.zone).toBeUndefined();

      // Completely invalid PIN
      const invalid = store.checkServiceability('000000');
      expect(invalid.serviceable).toBe(false);
    });

    it('preserves existing delivery fee and order calculation logic', () => {
      const zones = store.getDeliveryZones();
      const gokulamZone = zones.find(z => z.supportedPincodes.includes('570002'));
      expect(gokulamZone).toBeDefined();
      expect(gokulamZone?.deliveryFee).toBeDefined();
      expect(gokulamZone?.freeDeliveryThreshold).toBeDefined();
    });
  });

  describe('3. Catalogue Repair & Data Integrity Preservation', () => {
    it('preserves products with verified prices and isolates drafts without selling prices', () => {
      const products = store.getProducts();
      expect(products.length).toBeGreaterThan(0);

      // Verify that all published products have prices > 0
      const published = products.filter(p => p.status === 'published' && p.isPublished);
      published.forEach(p => {
        expect(p.defaultPrice).toBeGreaterThan(0);
      });
    });

    it('updates product image safely without corrupting other product metadata', () => {
      const products = store.getProducts();
      const testProd = products[0];
      const originalBrand = testProd.brand;
      const originalCategory = testProd.category;

      const newImageUrl = 'https://images.unsplash.com/photo-verified-bottle.jpg';
      store.updateProduct(testProd.id, {
        images: [newImageUrl]
      });

      const updated = store.getProductById(testProd.id);
      expect(updated?.images[0]).toBe(newImageUrl);
      expect(updated?.brand).toBe(originalBrand);
      expect(updated?.category).toBe(originalCategory);
    });
  });

});
