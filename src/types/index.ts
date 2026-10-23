export type UserRole = 
  | 'customer'
  | 'super_admin'
  | 'store_manager'
  | 'inventory_manager'
  | 'order_manager'
  | 'delivery_manager'
  | 'delivery_person'
  | 'support_agent';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt: string;
}

export interface Address {
  id: string;
  userId: string;
  recipientName: string;
  phoneNumber: string;
  addressLine: string;
  apartmentBuilding?: string;
  landmark?: string;
  area: string;
  city: string;
  state: string;
  pinCode: string;
  deliveryInstructions?: string;
  isDefault: boolean;
}

export interface DeliveryZone {
  id: string;
  zoneName: string;
  supportedPincodes: string[];
  deliveryFee: number;
  freeDeliveryThreshold: number;
  minOrderValue: number;
  prepTimeMinutes: number;
  estimatedDeliveryMinutes: number;
  operatingHoursStart: string;
  operatingHoursEnd: string;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  bannerUrl?: string;
  displayOrder: number;
  isActive: boolean;
  productCount?: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  description?: string;
  isActive: boolean;
}

export interface ProductVariant {
  id: string;
  productId: string;
  variantName: string; // e.g. "50ml", "100ml", "Shade 02 Rose Petal"
  sku: string;
  price: number;
  originalPrice?: number;
  mrp?: number;
  discountPercentage?: number;
  barcode?: string;
  stockQuantity: number;
  reservedQuantity: number;
  isDefault: boolean;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  brandId?: string;
  category: string;
  categoryId: string;
  shortDescription: string;
  description: string;
  benefits: string[];
  ingredients?: string;
  howToUse?: string;
  safetyInformation?: string;
  skinType?: string[];
  skinConcern?: string[];
  hairType?: string[];
  images: string[];
  variants: ProductVariant[];
  defaultPrice: number;
  defaultOriginalPrice?: number;
  mrp?: number;
  defaultDiscount?: number;
  rating: number;
  reviewCount: number;
  isFeatured?: boolean;
  isTrending?: boolean;
  isBestseller?: boolean;
  isNewArrival?: boolean;
  isPublished: boolean;
  status?: 'published' | 'draft' | 'archived';
  createdAt: string;
  updatedAt?: string;
}

export interface ImportJob {
  id: string;
  filename: string;
  totalRows: number;
  validRows: number;
  warningRows: number;
  errorRows: number;
  importedRows: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  options: {
    mode: 'full' | 'catalogue_only' | 'new_only';
    publishPolicy: 'draft' | 'published';
  };
  createdBy: string;
  createdAt: string;
  completedAt?: string;
}

export interface ImportErrorRecord {
  id: string;
  jobId: string;
  rowNumber: number;
  sku: string;
  productName: string;
  errorMessage: string;
  rawData?: Record<string, any>;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  brand: string;
  variantName: string;
  sku: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  availableStock: number;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscountValue?: number;
  description: string;
  isActive: boolean;
}

export type OrderStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'ready_for_dispatch'
  | 'assigned'
  | 'acknowledged'
  | 'picked_up'
  | 'out_for_delivery'
  | 'delivered'
  | 'failed_delivery'
  | 'cancelled'
  | 'refund_pending'
  | 'refunded';

export type PaymentStatus =
  | 'created'
  | 'pending'
  | 'authorized'
  | 'paid'
  | 'failed'
  | 'cancelled'
  | 'refund_pending'
  | 'partially_refunded'
  | 'refunded';

export interface OrderStatusHistoryItem {
  id: string;
  orderId: string;
  status: OrderStatus;
  timestamp: string;
  actor: {
    id: string;
    name: string;
    role: string;
  };
  notes?: string;
  latitude?: number;
  longitude?: number;
}

export interface DeliveryPartner {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatarUrl: string;
  vehicleType: 'electric_scooter' | 'bike' | 'bicycle' | 'van';
  vehicleNumber: string;
  rating: number;
  totalDeliveries: number;
  isOnline: boolean;
  isActive: boolean; // Admin can toggle active/inactive account status
  currentStatus: 'available' | 'busy' | 'offline';
  maxActiveOrders?: number; // capacity management (e.g. 2 max concurrent active orders)
  assignedOrdersCount?: number; // dynamically computed or persisted active orders count
  joinedAt?: string;
  currentLocation?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    heading?: number;
    speed?: number;
    updatedAt: string;
  };
}

export interface DeliveryAssignment {
  id: string;
  orderId: string;
  partnerId: string;
  partnerName: string;
  partnerPhone: string;
  partnerAvatar?: string;
  vehicleNumber?: string;
  vehicleType?: string;
  assignedAt: string;
  assignedBy?: {
    id: string;
    name: string;
    role: string;
  };
  acknowledgedAt?: string;
  pickedUpAt?: string;
  outForDeliveryAt?: string;
  deliveredAt?: string;
  failedAt?: string;
  failureReason?: string;
  reassignedAt?: string;
  reassignedToPartnerId?: string;
  reassignedBy?: {
    id: string;
    name: string;
    role: string;
  };
  reassignmentReason?: string;
  status: 'assigned' | 'acknowledged' | 'picked_up' | 'out_for_delivery' | 'delivered' | 'failed' | 'reassigned' | 'cancelled';
  currentRiderLocation?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    heading?: number;
    speed?: number;
    timestamp: string;
  };
  destinationLocation?: {
    latitude: number;
    longitude: number;
    addressText: string;
  };
  hubLocation?: {
    latitude: number;
    longitude: number;
    name: string;
    address: string;
  };
  distanceRemainingKm?: number;
  etaMinutes?: number;
  lastLocationUpdate?: string;
  locationSharingActive: boolean;
  routeGeometry?: [number, number][]; // [lat, lng] array for polyline
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: 'razorpay' | 'cod';
  subtotal: number;
  discountAmount: number;
  couponCode?: string;
  deliveryFee: number;
  taxAmount: number;
  totalAmount: number;
  shippingAddress: Address;
  items: OrderItem[];
  estimatedDeliveryTime?: string;
  actualDeliveryTime?: string;
  assignedDeliveryPerson?: {
    id: string;
    name: string;
    phone: string;
    avatarUrl?: string;
    vehicleNumber?: string;
    rating?: number;
  };
  deliveryAssignment?: DeliveryAssignment;
  assignmentHistory?: DeliveryAssignment[];
  statusHistory?: OrderStatusHistoryItem[];
  destinationCoordinates?: {
    latitude: number;
    longitude: number;
  };
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  isVerifiedBuyer: boolean;
  createdAt: string;
}
