import { describe, it, expect, beforeEach } from 'vitest';
import { store } from '../lib/store';
import { Order, OrderStatus, DeliveryPartner } from '../types';

describe('Dew & Go Phase 1: Live Delivery Assignment & Courier Workflow System', () => {

  describe('1. Delivery Partner Management & Secure Accounts', () => {
    it('creates a new delivery partner account with active status and max orders capacity', () => {
      const partner = store.createDeliveryPartner({
        name: 'Suresh Patil',
        phone: '+91 98451 99887',
        email: 'suresh.patil@dewandgo.com',
        vehicleType: 'electric_scooter',
        vehicleNumber: 'KA 03 EV 4567',
        maxActiveOrders: 2
      });

      expect(partner).toBeDefined();
      expect(partner.id).toContain('partner-');
      expect(partner.name).toBe('Suresh Patil');
      expect(partner.isActive).toBe(true);
      expect(partner.currentStatus).toBe('offline');
      expect(partner.maxActiveOrders).toBe(2);

      const found = store.getDeliveryPartnerById(partner.id);
      expect(found).toBeDefined();
      expect(found?.name).toBe('Suresh Patil');
    });

    it('toggles partner account between active and inactive (suspended)', () => {
      // Find an active partner
      const partners = store.getDeliveryPartners();
      const activePartner = partners.find(p => p.isActive !== false) || partners[0];

      // Deactivate / suspend partner
      const deactivated = store.togglePartnerActive(activePartner.id, false);
      expect(deactivated).toBe(true);

      const suspended = store.getDeliveryPartnerById(activePartner.id);
      expect(suspended?.isActive).toBe(false);
      expect(suspended?.currentStatus).toBe('offline');

      // Attempting to set an inactive partner to 'available' must be blocked
      const couldGoOnline = store.updatePartnerStatus(activePartner.id, 'available');
      expect(couldGoOnline).toBe(false);

      // Reactivate partner
      const reactivated = store.togglePartnerActive(activePartner.id, true);
      expect(reactivated).toBe(true);
      const restored = store.getDeliveryPartnerById(activePartner.id);
      expect(restored?.isActive).toBe(true);
    });

    it('updates delivery partner profile details safely', () => {
      const partners = store.getDeliveryPartners();
      const target = partners[0];

      const updated = store.updateDeliveryPartner(target.id, {
        vehicleNumber: 'KA 01 MG 9999',
        phone: '+91 99999 11111'
      });

      expect(updated).toBeDefined();
      expect(updated?.vehicleNumber).toBe('KA 01 MG 9999');
      expect(updated?.phone).toBe('+91 99999 11111');
    });
  });

  describe('2. Manual Delivery Assignment & Conflict Prevention Engine', () => {
    it('successfully assigns an eligible order to an active, online delivery partner', () => {
      const orders = store.getOrders();
      const targetOrder = orders.find(o => ['packed', 'ready_for_dispatch', 'confirmed'].includes(o.status)) || orders[0];

      const partners = store.getDeliveryPartners();
      const activePartner = partners.find(p => p.isActive !== false && p.currentStatus !== 'offline') || partners[0];

      // Set partner available
      store.updatePartnerStatus(activePartner.id, 'available');

      const assigned = store.assignDeliveryPartner(targetOrder.orderNumber, activePartner.id, {
        id: 'admin-controller-01',
        name: 'Meera Nair',
        role: 'delivery_manager'
      });

      expect(assigned).toBeDefined();
      expect(assigned?.status).toBe('assigned');
      expect(assigned?.deliveryAssignment).toBeDefined();
      expect(assigned?.deliveryAssignment?.partnerId).toBe(activePartner.id);
      expect(assigned?.deliveryAssignment?.assignedBy?.name).toBe('Meera Nair');
      expect(assigned?.assignedDeliveryPerson?.id).toBe(activePartner.id);

      // Verify status audit log
      const assignLog = assigned?.statusHistory?.find(h => h.status === 'assigned');
      expect(assignLog).toBeDefined();
      expect(assignLog?.actor?.name).toBe('Meera Nair');
    });

    it('strictly prevents assigning orders to inactive/suspended partner accounts', () => {
      // Find inactive partner (partner-blr-05 seeded as isActive: false)
      const inactivePartner = store.getDeliveryPartners().find(p => p.isActive === false);
      expect(inactivePartner).toBeDefined();

      const orders = store.getOrders();
      const testOrder = orders.find(o => o.status !== 'cancelled') || orders[0];

      const result = store.assignDeliveryPartner(testOrder.orderNumber, inactivePartner!.id);
      expect(result).toBeUndefined(); // Must reject assignment
    });

    it('strictly prevents assigning orders to offline partners', () => {
      const offlinePartner = store.getDeliveryPartners().find(p => p.currentStatus === 'offline' && p.isActive !== false);
      expect(offlinePartner).toBeDefined();

      const orders = store.getOrders();
      const testOrder = orders.find(o => o.status !== 'cancelled') || orders[0];

      const result = store.assignDeliveryPartner(testOrder.orderNumber, offlinePartner!.id);
      expect(result).toBeUndefined();
    });

    it('enforces maximum concurrent order workload capacity', () => {
      // Create partner with strict max capacity of 1 order
      const testCourier = store.createDeliveryPartner({
        name: 'Fast Runner',
        phone: '+91 91234 56789',
        email: 'fast@dewandgo.com',
        vehicleType: 'bicycle',
        vehicleNumber: 'N/A',
        maxActiveOrders: 1
      });
      store.updatePartnerStatus(testCourier.id, 'available');

      const orders = store.getOrders();
      const order1 = orders[0];
      const order2 = orders[1];

      // Assign first order -> must succeed
      const assign1 = store.assignDeliveryPartner(order1.orderNumber, testCourier.id);
      expect(assign1).toBeDefined();

      // Assign second order -> must be rejected because maxActiveOrders is 1
      const assign2 = store.assignDeliveryPartner(order2.orderNumber, testCourier.id);
      expect(assign2).toBeUndefined();
    });

    it('reassigns an active order to a new partner and archives previous assignment in history', () => {
      const orders = store.getOrders();
      const order = orders.find(o => o.orderNumber === 'DWG-88210') || orders[0];

      const partners = store.getDeliveryPartners().filter(p => p.isActive !== false);
      const originalPartner = partners[0];
      const replacementPartner = partners[1];

      // Ensure replacement partner is available
      store.updatePartnerStatus(replacementPartner.id, 'available');

      // Reassign with reason
      const reassigned = store.reassignDeliveryPartner(
        order.orderNumber,
        replacementPartner.id,
        'Original partner experienced flat tyre on 100ft road',
        { id: 'admin-dispatch', name: 'Duty Supervisor', role: 'super_admin' }
      );

      expect(reassigned).toBeDefined();
      expect(reassigned?.deliveryAssignment?.partnerId).toBe(replacementPartner.id);
      expect(reassigned?.assignedDeliveryPerson?.id).toBe(replacementPartner.id);

      // Check assignment history contains archived previous assignment
      expect(reassigned?.assignmentHistory).toBeDefined();
      expect(reassigned!.assignmentHistory!.length).toBeGreaterThan(0);

      const archived = reassigned!.assignmentHistory![reassigned!.assignmentHistory!.length - 1];
      expect(archived.status).toBe('reassigned');
      expect(archived.reassignedToPartnerId).toBe(replacementPartner.id);
      expect(archived.reassignmentReason).toContain('flat tyre');
      expect(archived.reassignedAt).toBeDefined();
    });
  });

  describe('3. Validated Courier Status Transitions (Phase 1 Lifecycle)', () => {
    it('executes the full step-by-step courier lifecycle: assigned → acknowledged → picked_up → out_for_delivery → delivered', () => {
      const orders = store.getOrders();
      const testOrder = orders.find(o => o.status !== 'cancelled') || orders[0];
      const partner = store.getDeliveryPartners().find(p => p.isActive !== false && p.currentStatus !== 'offline')!;
      store.updatePartnerStatus(partner.id, 'available');

      // 1. Assign
      const assigned = store.assignDeliveryPartner(testOrder.orderNumber, partner.id);
      expect(assigned?.status).toBe('assigned');

      // 2. Courier Acknowledges Assignment
      const acknowledged = store.updateDeliveryProgress(
        testOrder.orderNumber,
        'acknowledged',
        'Partner acknowledged notification and heading to dark store',
        { id: partner.id, name: partner.name, role: 'delivery_person' }
      );
      expect(acknowledged).toBeDefined();
      expect(acknowledged?.status).toBe('acknowledged');
      expect(acknowledged?.deliveryAssignment?.acknowledgedAt).toBeDefined();

      // 3. Confirm Dark Store Pickup
      const pickedUp = store.updateDeliveryProgress(
        testOrder.orderNumber,
        'picked_up',
        'Package verified with tamper seal and loaded in insulated bag',
        { id: partner.id, name: partner.name, role: 'delivery_person' }
      );
      expect(pickedUp).toBeDefined();
      expect(pickedUp?.status).toBe('picked_up');
      expect(pickedUp?.deliveryAssignment?.pickedUpAt).toBeDefined();

      // 4. Start Road Delivery
      const outForDelivery = store.updateDeliveryProgress(
        testOrder.orderNumber,
        'out_for_delivery',
        'Rider on bike en route to customer',
        { id: partner.id, name: partner.name, role: 'delivery_person' }
      );
      expect(outForDelivery).toBeDefined();
      expect(outForDelivery?.status).toBe('out_for_delivery');
      expect(outForDelivery?.deliveryAssignment?.outForDeliveryAt).toBeDefined();

      // 5. Complete Handover
      const delivered = store.updateDeliveryProgress(
        testOrder.orderNumber,
        'delivered',
        'Handed over directly to customer. Verified OTP.',
        { id: partner.id, name: partner.name, role: 'delivery_person' }
      );
      expect(delivered).toBeDefined();
      expect(delivered?.status).toBe('delivered');
      expect(delivered?.deliveryAssignment?.deliveredAt).toBeDefined();
    });

    it('rejects illegal status skipping (e.g. attempting assigned straight to delivered)', () => {
      const orders = store.getOrders();
      const testOrder = orders.find(o => o.status !== 'cancelled') || orders[0];
      const partner = store.getDeliveryPartners().find(p => p.isActive !== false && p.currentStatus !== 'offline')!;

      store.assignDeliveryPartner(testOrder.orderNumber, partner.id);

      // Attempting to skip pickup and road delivery straight to delivered
      const illegal = store.updateDeliveryProgress(
        testOrder.orderNumber,
        'delivered',
        'Illegal skip attempt',
        { id: partner.id, name: partner.name, role: 'delivery_person' }
      );
      expect(illegal).toBeUndefined(); // Must reject illegal transition
    });

    it('rejects unauthorized couriers from progressing other couriers orders', () => {
      const courierA = store.createDeliveryPartner({
        name: 'Courier Alpha',
        phone: '+91 99000 11111',
        email: 'alpha@dewandgo.com',
        vehicleType: 'electric_scooter',
        vehicleNumber: 'KA 01 AA 1111',
        maxActiveOrders: 5
      });
      const courierB = store.createDeliveryPartner({
        name: 'Courier Beta',
        phone: '+91 99000 22222',
        email: 'beta@dewandgo.com',
        vehicleType: 'bike',
        vehicleNumber: 'KA 01 BB 2222',
        maxActiveOrders: 5
      });
      store.updatePartnerStatus(courierA.id, 'available');
      store.updatePartnerStatus(courierB.id, 'available');

      const testOrder = store.createOrder({
        id: `ord-auth-test-${Date.now()}`,
        orderNumber: `DWG-AUTH-${Math.floor(1000 + Math.random() * 9000)}`,
        userId: 'user-auth-test',
        customerName: 'Security Tester',
        customerPhone: '+91 99999 88888',
        customerEmail: 'security@example.com',
        status: 'ready_for_dispatch',
        paymentStatus: 'paid',
        paymentMethod: 'razorpay',
        subtotal: 500,
        discountAmount: 0,
        deliveryFee: 0,
        taxAmount: 25,
        totalAmount: 525,
        shippingAddress: {
          id: 'addr-sec',
          userId: 'user-auth-test',
          recipientName: 'Security Tester',
          phoneNumber: '+91 99999 88888',
          addressLine: '123 Security Lane',
          area: 'Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          pinCode: '560038',
          isDefault: true
        },
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Assign to Courier A
      const assigned = store.assignDeliveryPartner(testOrder.orderNumber, courierA.id);
      expect(assigned?.deliveryAssignment?.partnerId).toBe(courierA.id);

      // Courier B attempts to update Courier A's order
      const unauthorizedAttempt = store.updateDeliveryProgress(
        testOrder.orderNumber,
        'picked_up',
        'Malicious or mistaken pickup attempt',
        { id: courierB.id, name: courierB.name, role: 'delivery_person' }
      );

      expect(unauthorizedAttempt).toBeUndefined(); // Must reject unauthorized courier
    });

    it('automatically settles Cash on Delivery payment status when marked delivered', () => {
      const courier = store.createDeliveryPartner({
        name: 'COD Courier',
        phone: '+91 99000 33333',
        email: 'cod@dewandgo.com',
        vehicleType: 'bike',
        vehicleNumber: 'KA 01 COD 99',
        maxActiveOrders: 5
      });
      store.updatePartnerStatus(courier.id, 'available');

      const codOrder = store.createOrder({
        id: `ord-cod-test-${Date.now()}`,
        orderNumber: `DWG-COD-${Math.floor(1000 + Math.random() * 9000)}`,
        userId: 'user-cod-test',
        customerName: 'COD Customer',
        customerPhone: '+91 98888 77777',
        customerEmail: 'cod@example.com',
        status: 'ready_for_dispatch',
        paymentStatus: 'pending',
        paymentMethod: 'cod',
        subtotal: 500,
        discountAmount: 0,
        deliveryFee: 49,
        taxAmount: 25,
        totalAmount: 574,
        shippingAddress: {
          id: 'addr-cod',
          userId: 'user-cod-test',
          recipientName: 'COD Customer',
          phoneNumber: '+91 98888 77777',
          addressLine: '45 Cash Street',
          area: 'Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          pinCode: '560038',
          isDefault: true
        },
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      store.assignDeliveryPartner(codOrder.orderNumber, courier.id);
      store.updateDeliveryProgress(codOrder.orderNumber, 'picked_up');
      store.updateDeliveryProgress(codOrder.orderNumber, 'out_for_delivery');

      // Handover with COD collection
      const completed = store.updateDeliveryProgress(codOrder.orderNumber, 'delivered', 'Cash collected ₹' + codOrder.totalAmount);
      expect(completed).toBeDefined();
      expect(completed?.status).toBe('delivered');
      expect(completed?.paymentStatus).toBe('paid'); // Auto-marked paid on delivery handover
    });
  });

});
