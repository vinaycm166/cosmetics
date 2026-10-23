import React, { useState, useEffect } from 'react';
import { 
  Package, 
  CheckCircle2, 
  Clock, 
  Truck, 
  MapPin, 
  Phone, 
  User, 
  AlertCircle, 
  ShieldCheck, 
  ChevronRight,
  Navigation,
  Compass,
  Star,
  Info,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { store } from '../lib/store';
import { Order, OrderStatus } from '../types';
import { LiveTrackingMap } from '../components/delivery/LiveTrackingMap';
import { resolveDestinationCoordinates, DARK_STORE_HUBS, DEFAULT_DARK_STORE_HUB } from '../lib/routingService';

interface TrackOrderPageProps {
  orderNumber?: string;
  onNavigate: (route: string) => void;
}

const LIFECYCLE_STEPS: { status: OrderStatus; label: string; desc: string }[] = [
  { status: 'confirmed', label: 'Order Confirmed', desc: 'Received and verified by micro-hub' },
  { status: 'processing', label: 'Formulations Picked', desc: 'Active skincare retrieved from temperature-controlled bays' },
  { status: 'packed', label: 'Packed & Sealed', desc: 'Protected in insulated thermal packaging with tamper seal' },
  { status: 'ready_for_dispatch', label: 'Ready for Dispatch', desc: 'Awaiting courier collection at dispatch bay' },
  { status: 'assigned', label: 'Rider Assigned', desc: 'Delivery partner allocated to your order' },
  { status: 'picked_up', label: 'Order Picked Up', desc: 'Parcel verified by rider at dark store' },
  { status: 'out_for_delivery', label: 'Out for Delivery', desc: 'Rider is on the road to your doorstep' },
  { status: 'delivered', label: 'Delivered', desc: 'Delivered in mint condition with cold-chain intact' },
];

export const TrackOrderPage: React.FC<TrackOrderPageProps> = ({ orderNumber, onNavigate }) => {
  const [searchCode, setSearchCode] = useState(orderNumber || '');
  const [currentOrder, setCurrentOrder] = useState<Order | undefined>(() => {
    if (orderNumber) return store.getOrderByIdOrNumber(orderNumber);
    return store.getOrders()[0];
  });

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelFeedback, setCancelFeedback] = useState<string | null>(null);

  // Subscribe to store updates & custom live location events
  useEffect(() => {
    const syncOrder = () => {
      const ord = (orderNumber || currentOrder?.orderNumber) 
        ? store.getOrderByIdOrNumber(orderNumber || currentOrder!.orderNumber) 
        : store.getOrders()[0];
      setCurrentOrder(ord);
    };

    const unsubscribe = store.subscribe(syncOrder);

    const handleLocationUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (currentOrder && customEvent.detail?.orderId === currentOrder.id) {
        syncOrder();
      }
    };

    const handleStatusUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (currentOrder && customEvent.detail?.orderId === currentOrder.id) {
        syncOrder();
      }
    };

    window.addEventListener('dewandgo:location_update', handleLocationUpdate);
    window.addEventListener('dewandgo:order_status_update', handleStatusUpdate);

    return () => {
      unsubscribe();
      window.removeEventListener('dewandgo:location_update', handleLocationUpdate);
      window.removeEventListener('dewandgo:order_status_update', handleStatusUpdate);
    };
  }, [orderNumber, currentOrder?.orderNumber]);

  const getStepIndex = (status: OrderStatus): number => {
    switch (status) {
      case 'pending_payment': return -1;
      case 'confirmed': return 0;
      case 'processing': return 1;
      case 'packed': return 2;
      case 'ready_for_dispatch': return 3;
      case 'assigned': return 4;
      case 'picked_up': return 5;
      case 'out_for_delivery': return 6;
      case 'delivered': return 7;
      default: return 0;
    }
  };

  const handleCancelOrder = () => {
    if (!currentOrder) return;
    if (['picked_up', 'out_for_delivery', 'delivered'].includes(currentOrder.status)) {
      setCancelFeedback('Orders already picked up or out for delivery cannot be cancelled online. Please contact our 24/7 care team at care@dewandgo.com.');
      return;
    }

    store.updateDeliveryProgress(
      currentOrder.id,
      'cancelled',
      cancelReason || 'Customer requested online cancellation',
      { id: currentOrder.userId || 'user', name: currentOrder.customerName, role: 'customer' }
    );
    setCancelFeedback('Your order has been cancelled. Any pre-paid payments will be refunded to the original payment source within 24–48 hours.');
    setTimeout(() => {
      setCancelModalOpen(false);
      setCancelFeedback(null);
    }, 2200);
  };

  if (!currentOrder) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <Package className="w-12 h-12 text-[#756D77] mx-auto" />
        <h2 className="font-heading font-bold text-2xl text-[#29242A]">Live Order Tracking</h2>
        <p className="text-xs text-[#756D77]">Enter your order ID (e.g. DWG-88210) to view your live GPS delivery status.</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchCode}
            onChange={e => setSearchCode(e.target.value)}
            placeholder="DWG-88210..."
            className="flex-1 px-3 py-2 text-xs rounded-lg border border-[#EFE7E1] bg-white font-mono uppercase"
          />
          <button
            onClick={() => {
              if (searchCode.trim()) onNavigate(`/track-order/${searchCode.trim()}`);
            }}
            className="dew-btn-berry text-xs !px-5 font-bold shadow-sm"
          >
            Track
          </button>
        </div>
      </div>
    );
  }

  const currentStep = getStepIndex(currentOrder.status);
  const isCancelled = currentOrder.status === 'cancelled';
  const isFailed = currentOrder.status === 'failed_delivery';
  const isDelivered = currentOrder.status === 'delivered';
  const isEnRoute = ['picked_up', 'out_for_delivery'].includes(currentOrder.status);

  // Destination & Hub resolution
  const rawDest = currentOrder.destinationCoordinates || resolveDestinationCoordinates(currentOrder.shippingAddress);
  const destCoords = {
    latitude: 'latitude' in rawDest ? rawDest.latitude : (rawDest as any).lat,
    longitude: 'longitude' in rawDest ? rawDest.longitude : (rawDest as any).lng
  };
  const pin = (currentOrder.shippingAddress.pinCode || '').trim();
  const hub = DARK_STORE_HUBS[pin] || DEFAULT_DARK_STORE_HUB;

  const partner = currentOrder.assignedDeliveryPerson?.id 
    ? store.getDeliveryPartnerById(currentOrder.assignedDeliveryPerson.id)
    : undefined;

  const riderLocation = currentOrder.deliveryAssignment?.currentRiderLocation || partner?.currentLocation;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFE7E1]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#721C46] bg-[#FFF0F5] px-2 py-0.5 rounded-full border border-[#E84F87]/20">
              ⚡ 15-Minute Hyperlocal Fulfilment
            </span>
            <span className="text-xs text-[#756D77]">Order #{currentOrder.orderNumber}</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-[#29242A]">
            {isDelivered 
              ? 'Package Delivered Successfully' 
              : isCancelled 
                ? 'Order Cancelled' 
                : isFailed 
                  ? 'Delivery Attempt Failed' 
                  : isEnRoute 
                    ? 'Your Rider is on the Way!' 
                    : 'Preparing Your Beauty Essentials'}
          </h1>
          <p className="text-xs text-[#756D77] mt-0.5">
            Placed on {new Date(currentOrder.createdAt).toLocaleDateString()} at{' '}
            {new Date(currentOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
            isCancelled || isFailed
              ? 'bg-rose-50 text-[#E84F87] border-rose-200' 
              : isDelivered 
                ? 'bg-emerald-50 text-[#267653] border-emerald-200' 
                : 'bg-[#FFF0F5] text-[#721C46] border-[#E84F87]/30'
          }`}>
            {currentOrder.status.replace(/_/g, ' ').toUpperCase()}
          </span>

          {!isCancelled && !isDelivered && !isFailed && currentStep < 5 && (
            <button
              onClick={() => setCancelModalOpen(true)}
              className="text-xs text-[#756D77] hover:text-[#E84F87] font-semibold hover:underline"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* SLA Delivery Countdown Banner */}
      {!isCancelled && !isFailed && !isDelivered && (
        <div className="p-4 rounded-xl border border-[#E84F87]/25 bg-gradient-to-r from-[#FFF0F5] via-[#FFF9F4] to-[#FAF7F4] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#721C46] text-white flex items-center justify-center shadow-sm shrink-0">
              <Clock className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <span className="font-heading font-extrabold text-sm text-[#29242A] block">
                Estimated Arrival: {new Date(currentOrder.estimatedDeliveryTime || Date.now() + 10 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-xs text-[#756D77]">
                Dispatched from {hub.name} in temperature-controlled bag
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-bold text-[#721C46] bg-white/80 px-3 py-1.5 rounded-lg border border-[#EFE7E1]">
            <ShieldCheck className="w-4 h-4 text-[#267653]" />
            <span>Guaranteed 15-Min Express SLA</span>
          </div>
        </div>
      )}

      {/* Main Grid: Interactive Map + Delivery Partner Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Live Map */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl overflow-hidden shadow-card border border-[#EFE7E1] bg-white">
            <div className="p-4 bg-white border-b border-[#EFE7E1] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-[#721C46]" />
                <h3 className="font-heading font-bold text-sm text-[#29242A]">
                  {isEnRoute ? 'Live Road Navigation' : 'Fulfilment Map & Route'}
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-[#756D77]">
                Target: {currentOrder.shippingAddress.area}
              </span>
            </div>

            <LiveTrackingMap
              riderLocation={riderLocation}
              destinationLocation={{
                latitude: destCoords.latitude,
                longitude: destCoords.longitude,
                addressText: currentOrder.shippingAddress.addressLine
              }}
              hubLocation={{
                latitude: hub.coordinates.lat,
                longitude: hub.coordinates.lng,
                name: hub.name
              }}
              routeCoordinates={currentOrder.deliveryAssignment?.routeGeometry}
              distanceRemainingKm={currentOrder.deliveryAssignment?.distanceRemainingKm}
              etaMinutes={currentOrder.deliveryAssignment?.etaMinutes}
              lastUpdated={currentOrder.deliveryAssignment?.lastLocationUpdate}
              isSharingActive={currentOrder.deliveryAssignment?.locationSharingActive !== false}
              orderStatus={currentOrder.status}
              height="380px"
            />
          </div>

          {/* Delivery Address & Instructions */}
          <div className="p-5 rounded-xl border border-[#EFE7E1] bg-white shadow-card space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#756D77] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#721C46]" />
                <span>Delivery Address</span>
              </span>
              <span className="text-[11px] text-[#756D77]">PIN: <strong>{currentOrder.shippingAddress.pinCode}</strong></span>
            </div>
            
            <div className="text-xs space-y-1">
              <p className="font-bold text-[#29242A]">{currentOrder.customerName} ({currentOrder.customerPhone})</p>
              <p className="text-[#756D77] leading-relaxed">
                {currentOrder.shippingAddress.addressLine}, {currentOrder.shippingAddress.apartmentBuilding && `${currentOrder.shippingAddress.apartmentBuilding}, `}
                {currentOrder.shippingAddress.landmark && `Near ${currentOrder.shippingAddress.landmark}, `}
                {currentOrder.shippingAddress.area}, {currentOrder.shippingAddress.city}
              </p>
            </div>

            {currentOrder.shippingAddress.deliveryInstructions && (
              <div className="p-2.5 rounded-lg bg-[#FAF7F4] border border-[#EFE7E1] text-[11px] text-[#29242A] flex items-start gap-2">
                <Info className="w-4 h-4 text-[#721C46] shrink-0 mt-0.5" />
                <span><strong>Special Note for Courier:</strong> {currentOrder.shippingAddress.deliveryInstructions}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Assigned Partner & Order Summary */}
        <div className="space-y-6">
          
          {/* Assigned Delivery Partner Card */}
          {currentOrder.assignedDeliveryPerson ? (
            <div className="p-5 rounded-xl border border-[#EFE7E1] bg-white shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#756D77]">
                  Assigned Delivery Partner
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#267653] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Verified Courier
                </span>
              </div>

              <div className="flex items-center gap-3.5">
                <img
                  src={currentOrder.assignedDeliveryPerson.avatarUrl || partner?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                  alt={currentOrder.assignedDeliveryPerson.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-[#E84F87] shadow-sm shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="font-heading font-extrabold text-sm text-[#29242A] truncate">
                    {currentOrder.assignedDeliveryPerson.name}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-[#756D77] mt-0.5">
                    <span className="flex items-center gap-0.5 font-bold text-amber-600">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{currentOrder.assignedDeliveryPerson.rating || partner?.rating || 4.9}</span>
                    </span>
                    <span>•</span>
                    <span className="text-[11px]">{partner?.vehicleNumber || 'Electric Scooter'}</span>
                  </div>
                  <span className="text-[10px] text-[#756D77] block mt-0.5">
                    {partner?.totalDeliveries || 400}+ completed deliveries
                  </span>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <a
                  href={`tel:${currentOrder.assignedDeliveryPerson.phone}`}
                  className="flex-1 dew-btn-berry !py-2 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Partner</span>
                </a>
                <button
                  onClick={() => alert(`Rider message: "Hello! I am carrying order #${currentOrder.orderNumber} in an insulated cold pouch. Approaching your building soon!"`)}
                  className="dew-btn-secondary !py-2 !px-3 text-xs font-semibold flex items-center gap-1"
                  title="Message Rider"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-xl border border-[#EFE7E1] bg-white shadow-card space-y-3 text-center">
              <div className="w-12 h-12 rounded-full bg-[#FFF0F5] text-[#721C46] flex items-center justify-center mx-auto">
                <Truck className="w-6 h-6" />
              </div>
              <h4 className="font-heading font-bold text-sm text-[#29242A]">Allocating Nearest Courier</h4>
              <p className="text-xs text-[#756D77] leading-relaxed">
                Your order is currently being prepared at {hub.name}. A delivery partner will be automatically assigned upon completion of packaging.
              </p>
            </div>
          )}

          {/* Parcel Items Snapshot */}
          <div className="p-5 rounded-xl border border-[#EFE7E1] bg-white shadow-card space-y-3">
            <h4 className="font-heading font-extrabold text-xs uppercase tracking-wider text-[#29242A] border-b border-neutral-100 pb-2 flex justify-between">
              <span>Items in Express Parcel</span>
              <span>({currentOrder.items.length})</span>
            </h4>

            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {currentOrder.items.map(item => (
                <div key={item.variantId} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="w-10 h-10 rounded-lg object-contain bg-[#FAF7F4] border border-[#EFE7E1] p-0.5 shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="font-bold text-[#29242A] block truncate">{item.productName}</span>
                      <span className="text-[10px] text-[#756D77]">{item.quantity}x • {item.variantName}</span>
                    </div>
                  </div>
                  <span className="font-bold text-[#29242A] shrink-0">₹{item.totalPrice}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs font-extrabold text-[#29242A]">
              <span>Total Paid ({currentOrder.paymentMethod.toUpperCase()})</span>
              <span>₹{currentOrder.totalAmount}</span>
            </div>
          </div>

        </div>

      </div>

      {/* Stepper Timeline */}
      <div className="p-6 rounded-xl border border-[#EFE7E1] bg-white shadow-card space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div>
            <h3 className="font-heading font-extrabold text-base text-[#29242A]">
              Fulfilment Timeline & Checkpoints
            </h3>
            <p className="text-xs text-[#756D77]">Real-time milestone progression audited with actor and timestamp</p>
          </div>
          <span className="text-xs font-mono font-bold text-[#721C46]">
            Step {Math.max(1, currentStep + 1)} of {LIFECYCLE_STEPS.length}
          </span>
        </div>

        {isCancelled ? (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-[#E84F87] text-xs space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              <span>This order has been cancelled</span>
            </p>
            <p className="text-[11px]">Reason: {currentOrder.cancellationReason || 'Cancelled by customer'}</p>
          </div>
        ) : isFailed ? (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-700" />
              <span>Delivery Attempt Unsuccessful</span>
            </p>
            <p className="text-[11px]">Reason: {currentOrder.deliveryAssignment?.failureReason || 'Customer was unavailable'}</p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-7 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#EFE7E1]">
            {LIFECYCLE_STEPS.map((step, idx) => {
              const isPast = idx < currentStep;
              const isCurrent = idx === currentStep;
              const historyItem = currentOrder.statusHistory?.find(h => h.status === step.status);

              return (
                <div key={step.status} className="relative flex items-start gap-4">
                  <div className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isPast 
                      ? 'bg-[#267653] text-white shadow-sm' 
                      : isCurrent 
                        ? 'bg-[#721C46] text-white ring-4 ring-[#E84F87]/30 shadow-md' 
                        : 'bg-neutral-200 text-neutral-500'
                  }`}>
                    {isPast ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                  </div>

                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <h4 className={`text-xs font-bold ${isCurrent ? 'text-[#721C46] font-extrabold' : 'text-[#29242A]'}`}>
                        {step.label}
                      </h4>
                      <p className="text-[11px] text-[#756D77] mt-0.5">{step.desc}</p>
                      {historyItem?.notes && (
                        <p className="text-[10px] text-[#721C46] mt-0.5 italic">
                          ↳ {historyItem.notes}
                        </p>
                      )}
                    </div>

                    {historyItem?.timestamp && (
                      <span className="text-[10px] text-[#756D77] font-mono shrink-0">
                        {new Date(historyItem.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancel Order Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-[#EFE7E1] shadow-2xl p-6 w-full max-w-sm space-y-4">
            <h3 className="font-heading font-extrabold text-base text-[#29242A]">
              Cancel Order #{currentOrder.orderNumber}
            </h3>
            {cancelFeedback ? (
              <p className="text-xs text-[#29242A] leading-relaxed">{cancelFeedback}</p>
            ) : (
              <div className="space-y-3 text-xs">
                <p className="text-[#756D77] leading-relaxed">
                  Are you sure you want to cancel this express beauty order? Hyperlocal packaging proceeds quickly, and cancellation is only available before rider collection.
                </p>
                <div>
                  <label className="block text-[10px] font-bold text-[#756D77] uppercase mb-1">
                    Cancellation Reason (Optional)
                  </label>
                  <input
                    type="text"
                    value={cancelReason}
                    onChange={e => setCancelReason(e.target.value)}
                    placeholder="e.g. Ordered incorrect shade, needed later..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#EFE7E1] bg-white"
                  />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    onClick={() => setCancelModalOpen(false)}
                    className="dew-btn-secondary text-xs !py-2 !px-4 font-semibold"
                  >
                    Keep Order
                  </button>
                  <button
                    onClick={handleCancelOrder}
                    className="dew-btn-berry text-xs !py-2 !px-4 font-bold !bg-[#E84F87] text-white shadow-sm"
                  >
                    Confirm Cancellation
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
