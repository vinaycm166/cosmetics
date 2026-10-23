import { 
  Product, 
  Category, 
  DeliveryZone, 
  Coupon, 
  Order, 
  OrderStatus, 
  PaymentStatus, 
  Address, 
  UserProfile, 
  DeliveryPartner, 
  DeliveryAssignment, 
  OrderStatusHistoryItem,
  ImportJob,
  ImportErrorRecord
} from '../types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_DELIVERY_ZONES, INITIAL_COUPONS, INITIAL_DELIVERY_PARTNERS, INITIAL_ORDERS } from '../data/seedData';
import { validateLocationUpdate, calculateRoadRoute, calculateHaversineDistanceKm, resolveDestinationCoordinates, DEFAULT_DARK_STORE_HUB, DARK_STORE_HUBS, LatLng } from './routingService';

// Local storage keys
const STORAGE_PREFIX = 'dew_and_go_';
const KEYS = {
  PRODUCTS: `${STORAGE_PREFIX}products`,
  CATEGORIES: `${STORAGE_PREFIX}categories`,
  ORDERS: `${STORAGE_PREFIX}orders`,
  ZONES: `${STORAGE_PREFIX}zones`,
  COUPONS: `${STORAGE_PREFIX}coupons`,
  INVENTORY_LOGS: `${STORAGE_PREFIX}inventory_logs`,
  SETTINGS: `${STORAGE_PREFIX}settings`,
  PARTNERS: `${STORAGE_PREFIX}delivery_partners`,
  IMPORT_JOBS: `${STORAGE_PREFIX}import_jobs`,
  IMPORT_ERRORS: `${STORAGE_PREFIX}import_errors`,
};

export interface InventoryLog {
  id: string;
  variantId: string;
  productName: string;
  sku: string;
  previousStock: number;
  newStock: number;
  change: number;
  type: string;
  reason: string;
  timestamp: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  announcementBar: {
    enabled: boolean;
    text: string;
    link?: string;
  };
  supportEmail: string;
  supportPhone: string;
  freeDeliveryThreshold: number;
  standardDeliveryFee: number;
  estimatedDeliveryMinutes: number;
  taxRatePercent?: number;
  razorpayEnabled: boolean;
  codEnabled: boolean;
}

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'Dew & Go',
  tagline: 'Beauty Essentials, Delivered.',
  announcementBar: {
    enabled: true,
    text: '⚡ Super-fast 15-minute beauty delivery across active city hubs! Free delivery on orders ₹499+',
  },
  supportEmail: 'care@dewandgo.com',
  supportPhone: '+91 80000 12345',
  freeDeliveryThreshold: 499,
  standardDeliveryFee: 49,
  estimatedDeliveryMinutes: 15,
  taxRatePercent: 5,
  razorpayEnabled: true,
  codEnabled: true,
};

const safeStorage = {
  getItem: (key: string): string | null => {
    if (typeof localStorage !== 'undefined') {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    }
    return null;
  },
  setItem: (key: string, val: string): void => {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(key, val);
      } catch {}
    }
  }
};

class Store {
  private products: Product[] = [];
  private categories: Category[] = [];
  private deliveryZones: DeliveryZone[] = [];
  private coupons: Coupon[] = [];
  private orders: Order[] = [];
  private deliveryPartners: DeliveryPartner[] = [];
  private inventoryLogs: InventoryLog[] = [];
  private importJobs: ImportJob[] = [];
  private importErrors: ImportErrorRecord[] = [];
  private settings: StoreSettings = DEFAULT_SETTINGS;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.init();
  }

  private init() {
    try {
      const storedProds = safeStorage.getItem(KEYS.PRODUCTS);
      this.products = storedProds ? JSON.parse(storedProds) : INITIAL_PRODUCTS;

      const storedCats = safeStorage.getItem(KEYS.CATEGORIES);
      this.categories = storedCats ? JSON.parse(storedCats) : INITIAL_CATEGORIES;

      const storedZones = safeStorage.getItem(KEYS.ZONES);
      this.deliveryZones = storedZones ? JSON.parse(storedZones) : INITIAL_DELIVERY_ZONES;

      const storedCoupons = safeStorage.getItem(KEYS.COUPONS);
      this.coupons = storedCoupons ? JSON.parse(storedCoupons) : INITIAL_COUPONS;

      const storedPartners = safeStorage.getItem(KEYS.PARTNERS);
      this.deliveryPartners = storedPartners ? JSON.parse(storedPartners) : INITIAL_DELIVERY_PARTNERS;

      const storedOrders = safeStorage.getItem(KEYS.ORDERS);
      const parsedOrders = storedOrders ? JSON.parse(storedOrders) : [];
      this.orders = (parsedOrders && parsedOrders.length > 0) ? parsedOrders : INITIAL_ORDERS;

      const storedLogs = safeStorage.getItem(KEYS.INVENTORY_LOGS);
      this.inventoryLogs = storedLogs ? JSON.parse(storedLogs) : [];

      const storedJobs = safeStorage.getItem(KEYS.IMPORT_JOBS);
      this.importJobs = storedJobs ? JSON.parse(storedJobs) : [];

      const storedErrors = safeStorage.getItem(KEYS.IMPORT_ERRORS);
      this.importErrors = storedErrors ? JSON.parse(storedErrors) : [];

      const storedSettings = safeStorage.getItem(KEYS.SETTINGS);
      this.settings = storedSettings ? JSON.parse(storedSettings) : DEFAULT_SETTINGS;
    } catch {
      this.products = INITIAL_PRODUCTS;
      this.categories = INITIAL_CATEGORIES;
      this.deliveryZones = INITIAL_DELIVERY_ZONES;
      this.coupons = INITIAL_COUPONS;
      this.deliveryPartners = INITIAL_DELIVERY_PARTNERS;
      this.orders = INITIAL_ORDERS;
      this.inventoryLogs = [];
      this.importJobs = [];
      this.importErrors = [];
      this.settings = DEFAULT_SETTINGS;
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }

  // --- PRODUCTS ---
  public getProducts(): Product[] {
    return this.products;
  }

  /**
   * Only returns active, published products that are not drafts and have a positive valid price
   */
  public getPublishedProducts(): Product[] {
    return this.products.filter(p => p.isPublished && p.status !== 'draft' && p.defaultPrice > 0);
  }

  public getProductBySlug(slug: string): Product | undefined {
    return this.products.find(p => p.slug === slug);
  }

  public getProductById(id: string): Product | undefined {
    return this.products.find(p => p.id === id);
  }

  public addProduct(product: Product): void {
    // Validate publication criteria: Incomplete products cannot be published
    if (!product.defaultPrice || product.defaultPrice <= 0 || !product.name) {
      product.isPublished = false;
      product.status = 'draft';
    } else if (!product.status) {
      product.status = product.isPublished ? 'published' : 'draft';
    }

    this.products.unshift(product);
    safeStorage.setItem(KEYS.PRODUCTS, JSON.stringify(this.products));
    this.notify();
  }

  public updateProduct(id: string, updates: Partial<Product>): void {
    this.products = this.products.map(p => {
      if (p.id !== id) return p;
      const merged = { ...p, ...updates, updatedAt: new Date().toISOString() };
      // Prevent incomplete products from being published
      if ((merged.isPublished || merged.status === 'published') && (!merged.defaultPrice || merged.defaultPrice <= 0 || !merged.name)) {
        merged.isPublished = false;
        merged.status = 'draft';
      }
      return merged;
    });
    safeStorage.setItem(KEYS.PRODUCTS, JSON.stringify(this.products));
    this.notify();
  }

  public deleteProduct(id: string): void {
    // Soft delete / unpublish
    this.updateProduct(id, { isPublished: false, status: 'archived' });
  }

  // --- CATEGORIES ---
  public getCategories(): Category[] {
    return this.categories;
  }

  public getCategoryBySlug(slug: string): Category | undefined {
    return this.categories.find(c => c.slug === slug);
  }

  public addCategory(category: Category): void {
    this.categories.push(category);
    safeStorage.setItem(KEYS.CATEGORIES, JSON.stringify(this.categories));
    this.notify();
  }

  // --- DELIVERY ZONES & SERVICEABILITY ---
  public getDeliveryZones(): DeliveryZone[] {
    return this.deliveryZones;
  }

  public checkServiceability(pinCode: string): { serviceable: boolean; zone?: DeliveryZone; estimatedMinutes: number } {
    const cleanPin = pinCode.trim();
    const zone = this.deliveryZones.find(z => z.isActive && z.supportedPincodes.includes(cleanPin));
    if (zone) {
      return { serviceable: true, zone, estimatedMinutes: zone.estimatedDeliveryMinutes };
    }
    return { serviceable: false, estimatedMinutes: 0 };
  }

  // --- INVENTORY ADJUSTMENTS ---
  public adjustInventory(variantId: string, change: number, type: string, reason: string): boolean {
    let modified = false;
    for (const prod of this.products) {
      const variant = prod.variants.find(v => v.id === variantId);
      if (variant) {
        const prev = variant.stockQuantity;
        const next = Math.max(0, prev + change);
        variant.stockQuantity = next;
        
        this.inventoryLogs.unshift({
          id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          variantId,
          productName: prod.name,
          sku: variant.sku,
          previousStock: prev,
          newStock: next,
          change,
          type,
          reason,
          timestamp: new Date().toISOString()
        });

        modified = true;
        break;
      }
    }

    if (modified) {
      safeStorage.setItem(KEYS.PRODUCTS, JSON.stringify(this.products));
      safeStorage.setItem(KEYS.INVENTORY_LOGS, JSON.stringify(this.inventoryLogs));
      this.notify();
      return true;
    }
    return false;
  }

  public getInventoryLogs(): InventoryLog[] {
    return this.inventoryLogs;
  }

  // --- ORDERS ---
  public getOrders(userId?: string, requestingUser?: { id: string; role: string }): Order[] {
    // If requesting user is a customer, strictly isolate to their own orders
    if (requestingUser && requestingUser.role === 'customer') {
      return this.orders.filter(o => o.userId === requestingUser.id);
    }
    if (userId) {
      return this.orders.filter(o => o.userId === userId);
    }
    return this.orders;
  }

  public getOrderByIdOrNumber(query: string, requestingUser?: { id: string; role?: string } | string): Order | undefined {
    const order = this.orders.find(o => o.id === query || o.orderNumber.toLowerCase() === query.toLowerCase());
    if (!order) return undefined;
    // Strict customer isolation: customer cannot view another customer's order
    if (requestingUser) {
      const reqId = typeof requestingUser === 'string' ? requestingUser : requestingUser.id;
      const reqRole = typeof requestingUser === 'string' ? 'customer' : (requestingUser.role || 'customer');
      if (reqRole === 'customer' && order.userId && order.userId !== reqId) {
        return undefined;
      }
    }
    return order;
  }

  public getOrderByNumber(query: string, requestingUser?: { id: string; role?: string } | string): Order | undefined {
    return this.getOrderByIdOrNumber(query, requestingUser);
  }

  // --- IMPORT JOBS & ERRORS ---
  public getImportJobs(): ImportJob[] {
    return this.importJobs;
  }

  public saveImportJob(job: ImportJob): void {
    this.importJobs.unshift(job);
    safeStorage.setItem(KEYS.IMPORT_JOBS, JSON.stringify(this.importJobs));
    this.notify();
  }

  public getImportErrors(jobId?: string): ImportErrorRecord[] {
    if (jobId) {
      return this.importErrors.filter(e => e.id === jobId);
    }
    return this.importErrors;
  }

  public saveImportErrors(errors: ImportErrorRecord[]): void {
    this.importErrors.unshift(...errors);
    safeStorage.setItem(KEYS.IMPORT_ERRORS, JSON.stringify(this.importErrors));
    this.notify();
  }

  public createOrder(order: Order): Order {
    // Deduct stock atomic simulation
    for (const item of order.items) {
      this.adjustInventory(item.variantId, -item.quantity, 'purchase', `Purchased in Order ${order.orderNumber}`);
    }

    if (!order.destinationCoordinates) {
      const coords = resolveDestinationCoordinates(order.shippingAddress);
      order.destinationCoordinates = {
        latitude: coords.lat,
        longitude: coords.lng
      };
    }

    if (!order.statusHistory || order.statusHistory.length === 0) {
      order.statusHistory = [
        {
          id: `hist-${Date.now()}`,
          orderId: order.id,
          status: order.status,
          timestamp: new Date().toISOString(),
          actor: { id: order.userId || 'sys', name: order.customerName, role: 'customer' },
          notes: `Order placed via ${order.paymentMethod.toUpperCase()}`
        }
      ];
    }

    this.orders.unshift(order);
    safeStorage.setItem(KEYS.ORDERS, JSON.stringify(this.orders));
    this.notify();
    return order;
  }

  // --- DELIVERY PARTNER & LIVE DISPATCH METHODS ---
  public getDeliveryPartners(): DeliveryPartner[] {
    return this.deliveryPartners.map(p => {
      const activeCount = this.orders.filter(
        o => (o.assignedDeliveryPerson?.id === p.id || o.deliveryAssignment?.partnerId === p.id) &&
             ['assigned', 'acknowledged', 'picked_up', 'out_for_delivery'].includes(o.status)
      ).length;

      const copy: any = { 
        ...p, 
        currentStatus: p.currentStatus,
        status: p.currentStatus,
        isActive: p.isActive !== false,
        maxActiveOrders: p.maxActiveOrders || 2,
        assignedOrdersCount: activeCount
      };

      if (p.currentLocation) {
        copy.currentLocation = {
          ...p.currentLocation,
          lat: p.currentLocation.latitude,
          lng: p.currentLocation.longitude,
          speedKmH: p.currentLocation.speed || 0
        };
      }
      return copy;
    });
  }

  public getDeliveryPartnerById(id: string): DeliveryPartner | undefined {
    const p = this.deliveryPartners.find(partner => partner.id === id);
    if (!p) return undefined;
    const activeCount = this.orders.filter(
      o => (o.assignedDeliveryPerson?.id === p.id || o.deliveryAssignment?.partnerId === p.id) &&
           ['assigned', 'acknowledged', 'picked_up', 'out_for_delivery'].includes(o.status)
    ).length;

    const copy: any = { 
      ...p, 
      currentStatus: p.currentStatus,
      status: p.currentStatus,
      isActive: p.isActive !== false,
      maxActiveOrders: p.maxActiveOrders || 2,
      assignedOrdersCount: activeCount
    };

    if (p.currentLocation) {
      copy.currentLocation = {
        ...p.currentLocation,
        lat: p.currentLocation.latitude,
        lng: p.currentLocation.longitude,
        speedKmH: p.currentLocation.speed || 0
      };
    }
    return copy;
  }

  public createDeliveryPartner(data: {
    name: string;
    phone: string;
    email: string;
    vehicleType: 'electric_scooter' | 'bike' | 'bicycle' | 'van';
    vehicleNumber: string;
    avatarUrl?: string;
    maxActiveOrders?: number;
  }): DeliveryPartner {
    const newPartner: DeliveryPartner = {
      id: `partner-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: data.name,
      phone: data.phone,
      email: data.email,
      avatarUrl: data.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      vehicleType: data.vehicleType,
      vehicleNumber: data.vehicleNumber,
      rating: 5.0,
      totalDeliveries: 0,
      isOnline: false,
      isActive: true,
      currentStatus: 'offline',
      maxActiveOrders: data.maxActiveOrders || 2,
      joinedAt: new Date().toISOString()
    };

    this.deliveryPartners.push(newPartner);
    safeStorage.setItem(KEYS.PARTNERS, JSON.stringify(this.deliveryPartners));
    this.notify();
    return newPartner;
  }

  public updateDeliveryPartner(id: string, updates: Partial<DeliveryPartner>): DeliveryPartner | undefined {
    const index = this.deliveryPartners.findIndex(p => p.id === id);
    if (index === -1) return undefined;

    this.deliveryPartners[index] = { ...this.deliveryPartners[index], ...updates };
    safeStorage.setItem(KEYS.PARTNERS, JSON.stringify(this.deliveryPartners));
    this.notify();
    return this.deliveryPartners[index];
  }

  public togglePartnerActive(partnerId: string, isActive: boolean): boolean {
    const partner = this.deliveryPartners.find(p => p.id === partnerId);
    if (!partner) return false;

    partner.isActive = isActive;
    if (!isActive) {
      partner.isOnline = false;
      partner.currentStatus = 'offline';
      (partner as any).status = 'offline';
    }
    safeStorage.setItem(KEYS.PARTNERS, JSON.stringify(this.deliveryPartners));
    this.notify();
    return true;
  }

  public deleteDeliveryPartner(id: string): boolean {
    const index = this.deliveryPartners.findIndex(p => p.id === id);
    if (index === -1) return false;

    this.deliveryPartners.splice(index, 1);
    safeStorage.setItem(KEYS.PARTNERS, JSON.stringify(this.deliveryPartners));
    this.notify();
    return true;
  }

  public updatePartnerStatus(partnerId: string, status: 'available' | 'busy' | 'offline'): boolean {
    const partner = this.deliveryPartners.find(p => p.id === partnerId);
    if (!partner) return false;

    // Disabled or suspended partner cannot go online or available
    if (partner.isActive === false && status !== 'offline') {
      return false;
    }

    partner.currentStatus = status;
    (partner as any).status = status;
    partner.isOnline = status !== 'offline';
    safeStorage.setItem(KEYS.PARTNERS, JSON.stringify(this.deliveryPartners));
    this.notify();
    return true;
  }

  public updatePartnerLocation(
    partnerId: string,
    locOrLat: {
      latitude?: number;
      lat?: number;
      longitude?: number;
      lng?: number;
      accuracy?: number;
      heading?: number;
      speed?: number;
      timestamp?: string;
    } | number,
    argLng?: number,
    argSpeed?: number,
    argHeading?: number,
    argAccuracy?: number
  ): { success: boolean; error?: string } {
    const partner = this.deliveryPartners.find(p => p.id === partnerId);
    if (!partner) {
      return { success: false, error: 'Partner not found.' };
    }

    let latitude: number;
    let longitude: number;
    let speed: number | undefined;
    let heading: number | undefined;
    let accuracy: number | undefined;
    let timestamp: string | undefined;

    if (typeof locOrLat === 'number') {
      latitude = locOrLat;
      longitude = typeof argLng === 'number' ? argLng : 0;
      speed = argSpeed;
      heading = argHeading;
      accuracy = argAccuracy;
    } else {
      latitude = locOrLat.latitude !== undefined ? locOrLat.latitude : (locOrLat.lat || 0);
      longitude = locOrLat.longitude !== undefined ? locOrLat.longitude : (locOrLat.lng || 0);
      speed = locOrLat.speed;
      heading = locOrLat.heading;
      accuracy = locOrLat.accuracy;
      timestamp = locOrLat.timestamp;
    }

    // Server-side validation: reject invalid bounds, stale timestamps, or impossible speeds (>120 km/h)
    const prevLoc = partner.currentLocation ? {
      latitude: partner.currentLocation.latitude,
      longitude: partner.currentLocation.longitude,
      updatedAt: partner.currentLocation.updatedAt
    } : undefined;

    const validation = validateLocationUpdate({ latitude, longitude, accuracy, speed, timestamp }, prevLoc);
    if (!validation.isValid) {
      return { success: false, error: validation.reason };
    }

    const nowIso = timestamp || new Date().toISOString();
    const locObj: any = {
      latitude,
      longitude,
      lat: latitude,
      lng: longitude,
      accuracy: accuracy || 5,
      heading,
      speed,
      speedKmH: speed,
      updatedAt: nowIso
    };
    partner.currentLocation = locObj;

    // Update active in-transit order if assigned to this partner
    const activeOrder = this.orders.find(
      o => (o.assignedDeliveryPerson?.id === partnerId || o.deliveryAssignment?.partnerId === partnerId) &&
           ['assigned', 'acknowledged', 'picked_up', 'out_for_delivery'].includes(o.status)
    );

    if (activeOrder && activeOrder.deliveryAssignment) {
      activeOrder.deliveryAssignment.currentRiderLocation = {
        latitude,
        longitude,
        accuracy,
        heading,
        speed,
        timestamp: nowIso
      };
      (activeOrder.deliveryAssignment.currentRiderLocation as any).lat = latitude;
      (activeOrder.deliveryAssignment.currentRiderLocation as any).lng = longitude;
      activeOrder.deliveryAssignment.lastLocationUpdate = nowIso;

      // Recalculate remaining distance to destination
      if (activeOrder.destinationCoordinates) {
        const remainingKm = calculateHaversineDistanceKm(
          { lat: latitude, lng: longitude },
          { lat: activeOrder.destinationCoordinates.latitude, lng: activeOrder.destinationCoordinates.longitude }
        );
        const roadRemainingKm = Number((remainingKm * 1.35).toFixed(2));
        activeOrder.deliveryAssignment.distanceRemainingKm = roadRemainingKm;
        activeOrder.deliveryAssignment.etaMinutes = Math.max(1, Math.round((roadRemainingKm / 22) * 60) + 1);
        activeOrder.estimatedDeliveryTime = new Date(Date.now() + activeOrder.deliveryAssignment.etaMinutes * 60000).toISOString();
      }

      activeOrder.updatedAt = nowIso;
      safeStorage.setItem(KEYS.ORDERS, JSON.stringify(this.orders));
    }

    safeStorage.setItem(KEYS.PARTNERS, JSON.stringify(this.deliveryPartners));
    this.notify();

    // Broadcast across windows/tabs for real-time live map updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('dewandgo:location_update', {
          detail: { partnerId, location: locObj, orderId: activeOrder?.id }
        })
      );
    }

    return { success: true };
  }

  public assignDeliveryPartner(
    orderId: string,
    partnerId: string,
    actor?: { id: string; name: string; role: string },
    reassignmentReason?: string
  ): Order | undefined {
    const orderIndex = this.orders.findIndex(
      o => o.id === orderId || o.orderNumber.toLowerCase() === orderId.toLowerCase()
    );
    if (orderIndex === -1) return undefined;

    const partner = this.deliveryPartners.find(p => p.id === partnerId);
    if (!partner) return undefined;

    // Validation 1: Target partner must be active (not disabled/suspended)
    if (partner.isActive === false) {
      return undefined;
    }

    // Validation 2: Target partner cannot be offline
    if (partner.currentStatus === 'offline') {
      return undefined;
    }

    const order = this.orders[orderIndex];

    // Validation 3: Cancelled orders cannot be assigned
    if (order.status === 'cancelled') {
      return undefined;
    }

    // Validation 4: Workload capacity limit (max active concurrent orders)
    const activePartnerOrders = this.orders.filter(
      o => o.id !== order.id &&
           (o.assignedDeliveryPerson?.id === partner.id || o.deliveryAssignment?.partnerId === partner.id) &&
           ['assigned', 'acknowledged', 'picked_up', 'out_for_delivery'].includes(o.status)
    );
    if (activePartnerOrders.length >= (partner.maxActiveOrders || 2)) {
      return undefined;
    }

    const nowIso = new Date().toISOString();

    // Conflict Prevention & Reassignment Handling
    const prevAssignment = order.deliveryAssignment;
    if (prevAssignment && prevAssignment.partnerId !== partner.id) {
      const prevPartner = this.deliveryPartners.find(p => p.id === prevAssignment.partnerId);

      // Archive previous assignment
      const archivedAssignment: DeliveryAssignment = {
        ...prevAssignment,
        status: 'reassigned',
        reassignedAt: nowIso,
        reassignedToPartnerId: partner.id,
        reassignedBy: actor,
        reassignmentReason: reassignmentReason || 'Reassigned by dispatch controller',
        locationSharingActive: false
      };

      if (!order.assignmentHistory) order.assignmentHistory = [];
      order.assignmentHistory.push(archivedAssignment);

      // If previous partner has no other active assignments, free them back to available
      if (prevPartner) {
        const otherOrders = this.orders.filter(
          o => o.id !== order.id &&
               (o.assignedDeliveryPerson?.id === prevPartner.id || o.deliveryAssignment?.partnerId === prevPartner.id) &&
               ['assigned', 'acknowledged', 'picked_up', 'out_for_delivery'].includes(o.status)
        );
        if (otherOrders.length === 0 && prevPartner.isActive !== false && prevPartner.currentStatus !== 'offline') {
          prevPartner.currentStatus = 'available';
          (prevPartner as any).status = 'available';
        }
      }
    }

    partner.currentStatus = 'busy';
    (partner as any).status = 'busy';
    safeStorage.setItem(KEYS.PARTNERS, JSON.stringify(this.deliveryPartners));

    const rawDest = order.destinationCoordinates || resolveDestinationCoordinates(order.shippingAddress);
    const destLat = (rawDest as any).lat !== undefined ? (rawDest as any).lat : (rawDest as any).latitude;
    const destLng = (rawDest as any).lng !== undefined ? (rawDest as any).lng : (rawDest as any).longitude;
    const destCoords: any = { lat: destLat, lng: destLng, latitude: destLat, longitude: destLng };
    order.destinationCoordinates = destCoords;

    const pin = (order.shippingAddress.pinCode || '').trim();
    const hub = DARK_STORE_HUBS[pin] || DEFAULT_DARK_STORE_HUB;

    const riderLoc = partner.currentLocation || {
      latitude: hub.coordinates.lat,
      longitude: hub.coordinates.lng,
      accuracy: 5,
      updatedAt: nowIso
    };

    const distKm = Number((calculateHaversineDistanceKm(
      { lat: riderLoc.latitude, lng: riderLoc.longitude },
      { lat: destLat, lng: destLng }
    ) * 1.35).toFixed(2));

    const etaMins = Math.max(3, Math.round((distKm / 22) * 60) + 2);

    const assignment: DeliveryAssignment = {
      id: `asgn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      orderId: order.id,
      partnerId: partner.id,
      partnerName: partner.name,
      partnerPhone: partner.phone,
      partnerAvatar: partner.avatarUrl,
      vehicleNumber: partner.vehicleNumber,
      vehicleType: partner.vehicleType,
      assignedAt: nowIso,
      assignedBy: actor || { id: 'admin-dispatch', name: 'Dispatch Controller', role: 'delivery_manager' },
      status: 'assigned',
      currentRiderLocation: {
        latitude: riderLoc.latitude,
        longitude: riderLoc.longitude,
        accuracy: riderLoc.accuracy,
        timestamp: nowIso
      },
      destinationLocation: {
        latitude: destLat,
        longitude: destLng,
        addressText: `${order.shippingAddress.addressLine}, ${order.shippingAddress.area}`
      },
      hubLocation: {
        latitude: hub.coordinates.lat,
        longitude: hub.coordinates.lng,
        name: hub.name,
        address: hub.address
      },
      distanceRemainingKm: distKm,
      etaMinutes: etaMins,
      lastLocationUpdate: nowIso,
      locationSharingActive: true,
      routeGeometry: [
        [riderLoc.latitude, riderLoc.longitude],
        [destLat, destLng]
      ]
    };

    order.assignedDeliveryPerson = {
      id: partner.id,
      name: partner.name,
      phone: partner.phone,
      avatarUrl: partner.avatarUrl,
      vehicleNumber: partner.vehicleNumber,
      rating: partner.rating
    };

    order.deliveryAssignment = assignment;
    order.status = 'assigned';
    order.estimatedDeliveryTime = new Date(Date.now() + etaMins * 60000).toISOString();
    order.updatedAt = nowIso;

    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
      id: `hist-${Date.now()}`,
      orderId: order.id,
      status: 'assigned',
      timestamp: nowIso,
      actor: actor || { id: 'admin-dispatch', name: 'Dispatch Controller', role: 'delivery_manager' },
      notes: prevAssignment 
        ? `Reassigned from ${prevAssignment.partnerName} to ${partner.name} (${partner.vehicleNumber}). Reason: ${reassignmentReason || 'Manual dispatch reassignment'}`
        : `Assigned to delivery partner ${partner.name} (${partner.vehicleNumber})`
    });

    this.orders[orderIndex] = { ...order };
    safeStorage.setItem(KEYS.ORDERS, JSON.stringify(this.orders));
    this.notify();

    // Compute road route async
    calculateRoadRoute(
      { lat: riderLoc.latitude, lng: riderLoc.longitude },
      { lat: destLat, lng: destLng }
    ).then(res => {
      if (res.success && this.orders[orderIndex]?.deliveryAssignment) {
        this.orders[orderIndex].deliveryAssignment!.routeGeometry = res.coordinates;
        this.orders[orderIndex].deliveryAssignment!.distanceRemainingKm = res.distanceKm;
        this.orders[orderIndex].deliveryAssignment!.etaMinutes = res.durationMinutes;
        safeStorage.setItem(KEYS.ORDERS, JSON.stringify(this.orders));
        this.notify();
      }
    }).catch(() => {});

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('dewandgo:order_status_update', {
          detail: { orderId: order.id, status: 'assigned' }
        })
      );
    }

    return this.orders[orderIndex];
  }

  public reassignDeliveryPartner(
    orderId: string,
    newPartnerId: string,
    reason: string,
    actor?: { id: string; name: string; role: string }
  ): Order | undefined {
    return this.assignDeliveryPartner(orderId, newPartnerId, actor, reason);
  }

  public suggestBestPartner(target: string | LatLng): any {
    let hubCoord: LatLng;

    if (typeof target === 'string') {
      const order = this.orders.find(o => o.id === target || o.orderNumber.toLowerCase() === target.toLowerCase());
      const pin = (order?.shippingAddress.pinCode || '').trim();
      const hub = DARK_STORE_HUBS[pin] || DEFAULT_DARK_STORE_HUB;
      hubCoord = hub.coordinates;
    } else {
      hubCoord = target;
    }

    // Filter partners: must be online, active, and under capacity
    const eligiblePartners = this.deliveryPartners.filter(p => {
      if (!p.isOnline || p.isActive === false || p.currentStatus === 'offline') return false;
      const activeCount = this.orders.filter(
        o => (o.assignedDeliveryPerson?.id === p.id || o.deliveryAssignment?.partnerId === p.id) &&
             ['assigned', 'acknowledged', 'picked_up', 'out_for_delivery'].includes(o.status)
      ).length;
      return activeCount < (p.maxActiveOrders || 2);
    });

    if (eligiblePartners.length === 0) return undefined;

    // Sort by: available status first, then proximity to hub
    const scored = [...eligiblePartners].sort((a, b) => {
      const aAvail = a.currentStatus === 'available' || (a as any).status === 'available';
      const bAvail = b.currentStatus === 'available' || (b as any).status === 'available';
      if (aAvail && !bAvail) return -1;
      if (bAvail && !aAvail) return 1;

      const distA = a.currentLocation
        ? calculateHaversineDistanceKm(
            { lat: a.currentLocation.latitude, lng: a.currentLocation.longitude },
            hubCoord
          )
        : 999;
      const distB = b.currentLocation
        ? calculateHaversineDistanceKm(
            { lat: b.currentLocation.latitude, lng: b.currentLocation.longitude },
            hubCoord
          )
        : 999;
      return distA - distB;
    });

    const best = scored[0];
    if (!best) return undefined;

    const riderLoc = best.currentLocation || { latitude: hubCoord.lat, longitude: hubCoord.lng };
    const distKm = calculateHaversineDistanceKm(
      { lat: riderLoc.latitude, lng: riderLoc.longitude },
      hubCoord
    );

    const result: any = { ...best, status: best.currentStatus };
    result.partner = { ...best, status: best.currentStatus };
    result.distanceKm = Number(distKm.toFixed(2));
    result.etaMinutes = Math.max(1, Math.round((distKm / 22) * 60) + 1);

    return result;
  }

  public updateDeliveryProgress(
    orderId: string,
    nextStatus: OrderStatus,
    notes?: string,
    actor?: { id: string; name: string; role: string }
  ): Order | undefined {
    const orderIndex = this.orders.findIndex(
      o => o.id === orderId || o.orderNumber.toLowerCase() === orderId.toLowerCase()
    );
    if (orderIndex === -1) return undefined;

    const order = this.orders[orderIndex];

    // If identical status, return current order idempotently
    if (order.status === nextStatus) {
      return order;
    }

    // State machine transition validation
    const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
      'pending_payment': ['confirmed', 'cancelled'],
      'confirmed': ['processing', 'cancelled'],
      'processing': ['packed', 'cancelled'],
      'packed': ['ready_for_dispatch', 'assigned', 'cancelled'],
      'ready_for_dispatch': ['assigned', 'cancelled'],
      'assigned': ['acknowledged', 'picked_up', 'ready_for_dispatch', 'failed_delivery', 'cancelled'],
      'acknowledged': ['picked_up', 'ready_for_dispatch', 'failed_delivery', 'cancelled'],
      'picked_up': ['out_for_delivery', 'failed_delivery', 'cancelled'],
      'out_for_delivery': ['delivered', 'failed_delivery'],
      'delivered': [],
      'failed_delivery': ['ready_for_dispatch', 'assigned', 'cancelled'],
      'cancelled': [],
      'refund_pending': ['refunded'],
      'refunded': []
    };

    const allowed = ALLOWED_TRANSITIONS[order.status];
    if (!allowed || !allowed.includes(nextStatus)) {
      // Transition rejected by state machine
      return undefined;
    }

    // Authorization validation: If actor is a delivery partner, they must be assigned to this order
    if (actor && ['delivery_person', 'delivery_partner'].includes(actor.role)) {
      const assignedPartnerId = order.deliveryAssignment?.partnerId || order.assignedDeliveryPerson?.id;
      if (assignedPartnerId && assignedPartnerId !== actor.id) {
        return undefined; // Unauthorized order access
      }
    }

    const nowIso = new Date().toISOString();
    order.status = nextStatus;
    order.updatedAt = nowIso;

    // COD payment handling: Mark payment completed on verified delivery
    if (nextStatus === 'delivered' && order.paymentMethod?.toLowerCase() === 'cod') {
      order.paymentStatus = 'paid';
    }

    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      orderId: order.id,
      status: nextStatus,
      timestamp: nowIso,
      actor: actor || { id: 'sys', name: 'Delivery System', role: 'delivery_partner' },
      notes: notes || `Order progressed to ${nextStatus.replace(/_/g, ' ')}`
    });

    if (order.deliveryAssignment) {
      if (nextStatus === 'acknowledged') {
        order.deliveryAssignment.status = 'acknowledged';
        order.deliveryAssignment.acknowledgedAt = nowIso;
      } else if (nextStatus === 'picked_up') {
        order.deliveryAssignment.status = 'picked_up';
        order.deliveryAssignment.pickedUpAt = nowIso;
      } else if (nextStatus === 'out_for_delivery') {
        order.deliveryAssignment.status = 'out_for_delivery';
        order.deliveryAssignment.outForDeliveryAt = nowIso;
        order.deliveryAssignment.locationSharingActive = true;
      } else if (nextStatus === 'delivered') {
        order.deliveryAssignment.status = 'delivered';
        order.deliveryAssignment.deliveredAt = nowIso;
        order.deliveryAssignment.locationSharingActive = false;
        order.actualDeliveryTime = nowIso;

        const partnerId = order.deliveryAssignment?.partnerId || order.assignedDeliveryPerson?.id;
        if (partnerId) {
          const partner = this.deliveryPartners.find(p => p.id === partnerId);
          if (partner) {
            partner.totalDeliveries = (partner.totalDeliveries || 0) + 1;
            if (partner.isActive !== false && partner.currentStatus !== 'offline') {
              partner.currentStatus = 'available';
              (partner as any).status = 'available';
              safeStorage.setItem(KEYS.PARTNERS, JSON.stringify(this.deliveryPartners));
            }
          }
        }
      } else if (nextStatus === 'failed_delivery') {
        order.deliveryAssignment.status = 'failed';
        order.deliveryAssignment.failedAt = nowIso;
        order.deliveryAssignment.failureReason = notes || 'Customer unavailable or unreachable';
        order.deliveryAssignment.locationSharingActive = false;

        const partnerId = order.deliveryAssignment?.partnerId || order.assignedDeliveryPerson?.id;
        if (partnerId) {
          this.freePartnerIfNoActiveOrders(partnerId, order.id);
        }
      } else if (nextStatus === 'cancelled') {
        order.deliveryAssignment.locationSharingActive = false;
        const partnerId = order.deliveryAssignment?.partnerId || order.assignedDeliveryPerson?.id;
        if (partnerId) {
          this.freePartnerIfNoActiveOrders(partnerId, order.id);
        }
      }
    }

    this.orders[orderIndex] = { ...order };
    safeStorage.setItem(KEYS.ORDERS, JSON.stringify(this.orders));
    this.notify();

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('dewandgo:order_status_update', {
          detail: { orderId: order.id, status: nextStatus, notes }
        })
      );
    }

    return this.orders[orderIndex];
  }

  private freePartnerIfNoActiveOrders(partnerId: string, excludeOrderId?: string) {
    const partner = this.deliveryPartners.find(p => p.id === partnerId);
    if (!partner) return;
    const remainingActive = this.orders.filter(
      o => o.id !== excludeOrderId &&
           o.orderNumber.toLowerCase() !== (excludeOrderId || '').toLowerCase() &&
           (o.assignedDeliveryPerson?.id === partner.id || o.deliveryAssignment?.partnerId === partner.id) &&
           ['assigned', 'acknowledged', 'picked_up', 'out_for_delivery'].includes(o.status)
    );
    if (remainingActive.length === 0 && partner.isActive !== false && partner.currentStatus !== 'offline') {
      partner.currentStatus = 'available';
      (partner as any).status = 'available';
      safeStorage.setItem(KEYS.PARTNERS, JSON.stringify(this.deliveryPartners));
    }
  }

  public updateOrderStatus(orderId: string, status: OrderStatus, paymentStatus?: PaymentStatus, reason?: string): Order | undefined {
    const orderIndex = this.orders.findIndex(
      o => o.id === orderId || o.orderNumber.toLowerCase() === orderId.toLowerCase()
    );
    if (orderIndex === -1) return undefined;

    const order = this.orders[orderIndex];
    const prevStatus = order.status;
    order.status = status;
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }
    const nowIso = new Date().toISOString();
    order.updatedAt = nowIso;

    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      orderId: order.id,
      status,
      timestamp: nowIso,
      actor: { id: 'admin', name: 'Operations Controller', role: 'super_admin' },
      notes: reason || `Admin updated order status from ${prevStatus} to ${status}`
    });

    if (order.deliveryAssignment) {
      if (status === 'delivered') {
        order.deliveryAssignment.status = 'delivered';
        order.deliveryAssignment.deliveredAt = nowIso;
        order.deliveryAssignment.locationSharingActive = false;
        order.actualDeliveryTime = nowIso;
        if (order.paymentMethod === 'cod') {
          order.paymentStatus = 'paid';
        }
        this.freePartnerIfNoActiveOrders(order.deliveryAssignment.partnerId, order.id);
      } else if (status === 'cancelled') {
        order.deliveryAssignment.status = 'cancelled';
        order.deliveryAssignment.locationSharingActive = false;
        this.freePartnerIfNoActiveOrders(order.deliveryAssignment.partnerId, order.id);
      } else if (status === 'failed_delivery') {
        order.deliveryAssignment.status = 'failed';
        order.deliveryAssignment.failedAt = nowIso;
        order.deliveryAssignment.locationSharingActive = false;
        this.freePartnerIfNoActiveOrders(order.deliveryAssignment.partnerId, order.id);
      } else if (['assigned', 'acknowledged', 'picked_up', 'out_for_delivery'].includes(status)) {
        order.deliveryAssignment.status = status as any;
      }
    }

    this.orders[orderIndex] = { ...order };
    safeStorage.setItem(KEYS.ORDERS, JSON.stringify(this.orders));
    this.notify();

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('dewandgo:order_status_update', {
          detail: { orderId: order.id, status, notes: reason }
        })
      );
    }

    return this.orders[orderIndex];
  }

  public assignDeliveryPerson(orderId: string, person: { id: string; name: string; phone: string }): Order | undefined {
    const partner = this.deliveryPartners.find(p => p.id === person.id || p.name.toLowerCase() === person.name.toLowerCase());
    if (partner) {
      this.assignDeliveryPartner(orderId, partner.id);
      return this.getOrderByIdOrNumber(orderId);
    }

    const orderIndex = this.orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return undefined;

    this.orders[orderIndex].assignedDeliveryPerson = person;
    this.orders[orderIndex].status = 'ready_for_dispatch';
    this.orders[orderIndex].updatedAt = new Date().toISOString();

    safeStorage.setItem(KEYS.ORDERS, JSON.stringify(this.orders));
    this.notify();
    return this.orders[orderIndex];
  }

  // --- COUPONS ---
  public getCoupons(): Coupon[] {
    return this.coupons;
  }

  public validateCoupon(code: string, subtotal: number): { valid: boolean; discount: number; message: string; coupon?: Coupon } {
    const clean = code.trim().toUpperCase();
    const coupon = this.coupons.find(c => c.code === clean && c.isActive);
    if (!coupon) {
      return { valid: false, discount: 0, message: 'Invalid or expired coupon code' };
    }

    if (subtotal < coupon.minOrderValue) {
      return { valid: false, discount: 0, message: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon` };
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscountValue && discount > coupon.maxDiscountValue) {
        discount = coupon.maxDiscountValue;
      }
    } else {
      discount = coupon.discountValue;
    }

    return { valid: true, discount, message: `Coupon ${coupon.code} applied successfully!`, coupon };
  }

  public addCoupon(coupon: Coupon): void {
    this.coupons.push(coupon);
    safeStorage.setItem(KEYS.COUPONS, JSON.stringify(this.coupons));
    this.notify();
  }

  // --- SETTINGS ---
  public getSettings(): StoreSettings {
    return this.settings;
  }

  public updateSettings(updates: Partial<StoreSettings>): void {
    this.settings = { ...this.settings, ...updates };
    safeStorage.setItem(KEYS.SETTINGS, JSON.stringify(this.settings));
    this.notify();
  }

  // --- ANALYTICS ---
  public getAnalytics() {
    const totalOrders = this.orders.length;
    const paidOrders = this.orders.filter(o => o.paymentStatus === 'paid' && o.status !== 'cancelled');
    const netRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const deliveredOrders = this.orders.filter(o => o.status === 'delivered').length;
    const cancelledOrders = this.orders.filter(o => o.status === 'cancelled').length;
    const pendingOrders = this.orders.filter(o => ['pending_payment', 'confirmed', 'processing'].includes(o.status)).length;
    const avgOrderValue = paidOrders.length > 0 ? Math.round(netRevenue / paidOrders.length) : 0;

    // Low stock variants (< 10)
    const lowStockItems: { productName: string; variantName: string; stock: number; sku: string }[] = [];
    for (const p of this.products) {
      for (const v of p.variants) {
        if (v.stockQuantity < 10) {
          lowStockItems.push({
            productName: p.name,
            variantName: v.variantName,
            stock: v.stockQuantity,
            sku: v.sku
          });
        }
      }
    }

    return {
      netRevenue,
      totalOrders,
      paidOrdersCount: paidOrders.length,
      deliveredOrders,
      cancelledOrders,
      pendingOrders,
      avgOrderValue,
      lowStockCount: lowStockItems.length,
      lowStockItems,
      recentOrders: this.orders.slice(0, 8),
    };
  }
}

export const store = new Store();
