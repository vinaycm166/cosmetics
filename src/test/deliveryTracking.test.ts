import { describe, it, expect, beforeEach } from 'vitest';
import { store } from '../lib/store';
import { 
  validateLocationUpdate, 
  calculateHaversineDistanceKm, 
  estimateTravelDurationMinutes,
  resolveHubCoordinates,
  resolveDestinationCoordinates
} from '../lib/routingService';
import { Order } from '../types';

describe('Dew & Go Swiggy/Zomato-Style Live Delivery Tracking System', () => {

  describe('1. Server-Side GPS Validation Engine', () => {
    const validCurrentCoord = { lat: 12.9716, lng: 77.5946 }; // Indiranagar

    it('accepts valid, recent foreground GPS coordinates within realistic thresholds', () => {
      const now = new Date().toISOString();
      const result = validateLocationUpdate(
        12.9720,
        77.5950,
        now,
        15, // 15m accuracy
        validCurrentCoord,
        new Date(Date.now() - 10000).toISOString() // 10s ago
      );

      expect(result.valid).toBe(true);
      expect(result.isValid).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('rejects coordinates with latitude or longitude out of geographic bounds', () => {
      const now = new Date().toISOString();
      const invalidLat = validateLocationUpdate(95.0, 77.5946, now, 10);
      expect(invalidLat.valid).toBe(false);
      expect(invalidLat.reason).toContain('Latitude out of bounds');

      const invalidLng = validateLocationUpdate(12.9716, 185.0, now, 10);
      expect(invalidLng.valid).toBe(false);
      expect(invalidLng.reason).toContain('Longitude out of bounds');
    });

    it('rejects stale GPS location updates older than 120 seconds', () => {
      const staleTimestamp = new Date(Date.now() - 150 * 1000).toISOString(); // 150s ago
      const result = validateLocationUpdate(12.9716, 77.5946, staleTimestamp, 10);

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Stale location update');
    });

    it('rejects GPS timestamps far in the future (>60 seconds clock drift)', () => {
      const futureTimestamp = new Date(Date.now() + 120 * 1000).toISOString(); // 2 mins future
      const result = validateLocationUpdate(12.9716, 77.5946, futureTimestamp, 10);

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Clock drift');
    });

    it('rejects impossible vehicle speeds (>120 km/h teleportation)', () => {
      // 10km away in 5 seconds = 7200 km/h
      const fiveSecondsAgo = new Date(Date.now() - 5000).toISOString();
      const currentTimestamp = new Date().toISOString();
      const farAwayCoord = { lat: 13.0827, lng: 80.2707 }; // Chennai to Bangalore in 5s!

      const result = validateLocationUpdate(
        farAwayCoord.lat,
        farAwayCoord.lng,
        currentTimestamp,
        10,
        validCurrentCoord,
        fiveSecondsAgo
      );

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('teleportation');
    });

    it('rejects severely degraded GPS accuracy (>200 meters)', () => {
      const now = new Date().toISOString();
      const result = validateLocationUpdate(12.9716, 77.5946, now, 250); // 250m accuracy

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('degraded accuracy');
    });
  });

  describe('2. Road Routing & Distance Calculation Engine', () => {
    it('accurately calculates Haversine spherical distance between two points', () => {
      // Indiranagar (12.9784, 77.6408) to Koramangala (12.9352, 77.6245) is ~5-6 km
      const distanceKm = calculateHaversineDistanceKm(12.9784, 77.6408, 12.9352, 77.6245);
      expect(distanceKm).toBeGreaterThan(4.5);
      expect(distanceKm).toBeLessThan(6.5);
    });

    it('estimates realistic urban motorcycle travel duration', () => {
      // 5 km in urban Bangalore traffic at ~22 km/h is ~13-16 mins
      const durationMins = estimateTravelDurationMinutes(5.0, 22);
      expect(durationMins).toBeGreaterThanOrEqual(13);
      expect(durationMins).toBeLessThanOrEqual(18);
    });

    it('resolves dark-store hub coordinates for known PIN codes and areas', () => {
      const indiranagarHub = resolveHubCoordinates('560038');
      expect(indiranagarHub.lat).toBeCloseTo(12.9719, 2);
      expect(indiranagarHub.lng).toBeCloseTo(77.6412, 2);

      const koramangalaHub = resolveHubCoordinates('560034');
      expect(koramangalaHub.lat).toBeCloseTo(12.9345, 2);
    });

    it('resolves delivery destination coordinates with fallback jitter', () => {
      const dest = resolveDestinationCoordinates('560038', '12th Main Road, Indiranagar');
      expect(dest.lat).toBeGreaterThan(12.0);
      expect(dest.lng).toBeGreaterThan(77.0);
    });
  });

  describe('3. Delivery Partner Courier Management & Auto-Suggestion', () => {
    it('retrieves registered delivery partners from store', () => {
      const partners = store.getDeliveryPartners();
      expect(partners.length).toBeGreaterThanOrEqual(4);
      expect(partners.some(p => p.name === 'Rajesh Kumar')).toBe(true);
    });

    it('updates delivery partner duty status (available, busy, offline)', () => {
      const partners = store.getDeliveryPartners();
      const firstPartner = partners[0];

      store.updatePartnerStatus(firstPartner.id, 'offline');
      let updated = store.getDeliveryPartners().find(p => p.id === firstPartner.id);
      expect(updated?.currentStatus).toBe('offline');

      store.updatePartnerStatus(firstPartner.id, 'available');
      updated = store.getDeliveryPartners().find(p => p.id === firstPartner.id);
      expect(updated?.currentStatus).toBe('available');
    });

    it('suggests the closest available partner using smart auto-assignment', () => {
      // Hub at Indiranagar (12.9719, 77.6412)
      const suggestion = store.suggestBestPartner({ lat: 12.9719, lng: 77.6412 });
      expect(suggestion).not.toBeNull();
      if (suggestion) {
        expect(suggestion.partner.currentStatus).toBe('available');
        expect(suggestion.distanceKm).toBeGreaterThanOrEqual(0);
        expect(suggestion.etaMinutes).toBeGreaterThan(0);
      }
    });

    it('updates partner live GPS position and timestamp', () => {
      const partners = store.getDeliveryPartners();
      const targetPartner = partners[0];

      const newLat = targetPartner.currentLocation ? targetPartner.currentLocation.latitude + 0.0002 : 12.9750;
      const newLng = targetPartner.currentLocation ? targetPartner.currentLocation.longitude + 0.0002 : 77.6350;
      const res = store.updatePartnerLocation(targetPartner.id, {
        latitude: newLat,
        longitude: newLng,
        speed: 25,
        heading: 90,
        accuracy: 8,
        timestamp: new Date().toISOString()
      });
      expect(res.success).toBe(true);

      const updated = store.getDeliveryPartners().find(p => p.id === targetPartner.id);
      expect(updated?.currentLocation?.latitude).toBeCloseTo(newLat, 4);
      expect(updated?.currentLocation?.longitude).toBeCloseTo(newLng, 4);
      expect(updated?.currentLocation?.speed).toBe(25);
      expect(updated?.currentLocation?.heading).toBe(90);
    });
  });

  describe('4. Order Lifecycle Transitions & Assignment Engine', () => {
    let testOrder: Order;

    beforeEach(() => {
      // Find an order to test transitions (avoiding DWG-88210 used for telemetry tests)
      const orders = store.getOrders();
      testOrder = orders.find(o => o.orderNumber !== 'DWG-88210') || orders[0];
    });

    it('assigns an available courier to an order and updates statuses', () => {
      const partners = store.getDeliveryPartners().filter(p => p.currentStatus === 'available');
      expect(partners.length).toBeGreaterThan(0);
      const chosenPartner = partners[0];

      const assignedOrder = store.assignDeliveryPartner(testOrder.orderNumber, chosenPartner.id);
      expect(assignedOrder).toBeDefined();

      const updatedOrder = store.getOrderByNumber(testOrder.orderNumber);
      expect(updatedOrder?.deliveryAssignment).toBeDefined();
      expect(updatedOrder?.deliveryAssignment?.partnerId).toBe(chosenPartner.id);
      expect(updatedOrder?.deliveryAssignment?.partnerName).toBe(chosenPartner.name);
      expect(updatedOrder?.status).toBe('assigned');

      // Partner should now be busy
      const updatedPartner = store.getDeliveryPartners().find(p => p.id === chosenPartner.id);
      expect(updatedPartner?.currentStatus).toBe('busy');
    });

    it('advances order through full Swiggy/Zomato lifecycle: assigned → picked_up → out_for_delivery → delivered', () => {
      const orderNumber = testOrder.orderNumber;

      // 1. Mark Picked Up
      let order = store.updateDeliveryProgress(orderNumber, 'picked_up', 'Parcel checked and picked up from hub');
      expect(order).toBeDefined();
      expect(order?.status).toBe('picked_up');
      expect(order?.deliveryAssignment?.pickedUpAt).toBeDefined();

      // Verify status history audit trail
      const pickedUpHistory = order?.statusHistory?.find(h => h.status === 'picked_up');
      expect(pickedUpHistory).toBeDefined();
      expect(pickedUpHistory?.actor.role).toBe('delivery_partner');

      // 2. Mark Out for Delivery
      order = store.updateDeliveryProgress(orderNumber, 'out_for_delivery', 'Rider is en route to customer doorstep');
      expect(order).toBeDefined();
      expect(order?.status).toBe('out_for_delivery');

      // 3. Mark Delivered
      order = store.updateDeliveryProgress(orderNumber, 'delivered', 'Handed over to customer with OTP verification');
      expect(order).toBeDefined();
      expect(order?.status).toBe('delivered');
      expect(order?.deliveryAssignment?.deliveredAt).toBeDefined();

      // Partner should be freed back to available
      const partnerId = order?.deliveryAssignment?.partnerId;
      if (partnerId) {
        const partner = store.getDeliveryPartners().find(p => p.id === partnerId);
        expect(partner?.currentStatus).toBe('available');
      }
    });

    it('handles failed delivery with reason code and audit log', () => {
      const orders = store.getOrders();
      const failOrder = orders.find(o => o.orderNumber !== 'DWG-88210' && o.orderNumber !== testOrder.orderNumber) || orders[1];

      const partners = store.getDeliveryPartners();
      store.assignDeliveryPartner(failOrder.orderNumber, partners[1].id);

      const updated = store.updateDeliveryProgress(
        failOrder.orderNumber,
        'failed_delivery',
        'Customer unreachable after 3 contact attempts at door'
      );
      expect(updated).toBeDefined();
      expect(updated?.status).toBe('failed_delivery');

      const failedHistory = updated?.statusHistory?.find(h => h.status === 'failed_delivery');
      expect(failedHistory).toBeDefined();
      expect(failedHistory?.notes).toContain('Customer unreachable');
    });

    it('allows eligible order cancellation before pickup', () => {
      const orders = store.getOrders();
      const cancelOrder = orders.find(o => o.orderNumber !== 'DWG-88210') || orders[0];

      // Set to confirmed
      store.updateOrderStatus(cancelOrder.orderNumber, 'confirmed');

      const updated = store.updateOrderStatus(cancelOrder.orderNumber, 'cancelled');
      expect(updated).toBeDefined();
      expect(updated?.status).toBe('cancelled');
    });
  });

  describe('5. Real-Time Tracking Telemetry & Sync', () => {
    it('loads active seed order DWG-88210 with live delivery assignment', () => {
      // Ensure seed state for DWG-88210 is active
      const activeOrder = store.getOrderByNumber('DWG-88210');
      expect(activeOrder).toBeDefined();
      expect(activeOrder?.deliveryAssignment).toBeDefined();
      expect(activeOrder?.deliveryAssignment?.partnerName).toBe('Rajesh Kumar');
      expect(activeOrder?.destinationCoordinates).toBeDefined();
    });

    it('synchronizes partner location with active order assignment', () => {
      const activeOrder = store.getOrderByNumber('DWG-88210');
      expect(activeOrder).toBeDefined();
      const partnerId = activeOrder!.deliveryAssignment!.partnerId;

      const partner = store.getDeliveryPartnerById(partnerId);
      const targetLat = partner?.currentLocation ? partner.currentLocation.latitude + 0.0002 : 12.9735;
      const targetLng = partner?.currentLocation ? partner.currentLocation.longitude + 0.0002 : 77.6255;

      const res = store.updatePartnerLocation(partnerId, {
        latitude: targetLat,
        longitude: targetLng,
        speed: 28,
        heading: 140,
        accuracy: 6,
        timestamp: new Date().toISOString()
      });
      expect(res.success).toBe(true);

      const refreshedOrder = store.getOrderByNumber('DWG-88210');
      expect(refreshedOrder?.deliveryAssignment?.currentRiderLocation?.latitude).toBeCloseTo(targetLat, 3);
      expect(refreshedOrder?.deliveryAssignment?.currentRiderLocation?.longitude).toBeCloseTo(targetLng, 3);
    });
  });
});
