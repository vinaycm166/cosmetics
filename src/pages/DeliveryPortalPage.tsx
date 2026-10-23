import React, { useState, useEffect, useRef } from 'react';
import { 
  Truck, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Clock, 
  Package, 
  ArrowRight, 
  AlertTriangle,
  ShieldCheck,
  User,
  Compass,
  Navigation,
  ExternalLink,
  Power,
  RotateCcw,
  AlertCircle,
  XCircle,
  Eye,
  Check,
  Info,
  ChevronDown,
  ChevronUp,
  Banknote
} from 'lucide-react';
import { store } from '../lib/store';
import { useAuth } from '../context/AuthContext';
import { Order, OrderStatus, DeliveryPartner } from '../types';
import { LiveTrackingMap } from '../components/delivery/LiveTrackingMap';
import { DARK_STORE_HUBS, DEFAULT_DARK_STORE_HUB } from '../lib/routingService';

interface DeliveryPortalPageProps {
  onNavigate: (route: string) => void;
}

export const DeliveryPortalPage: React.FC<DeliveryPortalPageProps> = ({ onNavigate }) => {
  const { user, role, switchRole } = useAuth();
  
  // Delivery partners roster
  const [partners, setPartners] = useState<DeliveryPartner[]>(() => store.getDeliveryPartners());
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>(() => {
    return partners[0]?.id || 'partner-blr-01';
  });

  const activePartner = partners.find(p => p.id === selectedPartnerId) || partners[0];

  // Orders
  const [allOrders, setAllOrders] = useState<Order[]>(() => store.getOrders());
  const [activeTab, setActiveTab] = useState<'assigned' | 'completed'>('assigned');
  const [expandedOrderIds, setExpandedOrderIds] = useState<Record<string, boolean>>({});

  // GPS Tracking State (Real device geolocation watcher - Architecture prepared for Phase 2 Realtime)
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'acquiring' | 'active' | 'denied' | 'unsupported'>('idle');
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsPingCount, setGpsPingCount] = useState<number>(0);
  const [lastPingTime, setLastPingTime] = useState<string>('');
  const [gpsErrorMsg, setGpsErrorMsg] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Failure modal state
  const [failureModalOpen, setFailureModalOpen] = useState(false);
  const [failedOrderId, setFailedOrderId] = useState<string | null>(null);
  const [failedReason, setFailedReason] = useState('Customer phone unreachable after 3 attempts');

  // Sync store changes
  useEffect(() => {
    const sync = () => {
      setPartners(store.getDeliveryPartners());
      setAllOrders(store.getOrders());
    };
    const unsub = store.subscribe(sync);
    return () => {
      unsub();
    };
  }, []);

  // Filter orders assigned to this partner (including Phase 1 'acknowledged' status)
  const assignedOrders = allOrders.filter(
    o => (o.assignedDeliveryPerson?.id === activePartner?.id || o.deliveryAssignment?.partnerId === activePartner?.id) &&
      ['assigned', 'acknowledged', 'picked_up', 'out_for_delivery'].includes(o.status)
  );

  const completedToday = allOrders.filter(
    o => (o.assignedDeliveryPerson?.id === activePartner?.id || o.deliveryAssignment?.partnerId === activePartner?.id) && o.status === 'delivered'
  );

  // Geolocation foreground tracking lifecycle (real device coordinates, no fake simulation)
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsStatus('unsupported');
      return;
    }

    // Only broadcast GPS if partner is online, active, and has an active in-transit assignment
    const hasActiveDelivery = assignedOrders.some(o => ['picked_up', 'out_for_delivery'].includes(o.status));

    if (activePartner?.isOnline && activePartner?.isActive !== false && hasActiveDelivery) {
      setGpsStatus('acquiring');

      const successHandler = (pos: GeolocationPosition) => {
        setGpsStatus('active');
        setGpsAccuracy(Math.round(pos.coords.accuracy));
        setGpsPingCount(prev => prev + 1);
        setLastPingTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        setGpsErrorMsg(null);

        store.updatePartnerLocation(activePartner.id, {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          heading: pos.coords.heading || undefined,
          speed: pos.coords.speed ? pos.coords.speed * 3.6 : undefined, // m/s to km/h
          timestamp: new Date(pos.timestamp).toISOString()
        });
      };

      const errorHandler = (err: GeolocationPositionError) => {
        if (err.code === err.PERMISSION_DENIED) {
          setGpsStatus('denied');
          setGpsErrorMsg('Location permission was denied. Please allow GPS access in your browser settings.');
        } else {
          setGpsStatus('idle');
          setGpsErrorMsg(err.message || 'Unable to retrieve location.');
        }
      };

      // Start watching position
      watchIdRef.current = navigator.geolocation.watchPosition(successHandler, errorHandler, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 4000
      });

      return () => {
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
      };
    } else {
      setGpsStatus('idle');
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    }
  }, [activePartner?.id, activePartner?.isOnline, activePartner?.isActive, assignedOrders.length]);

  const handleToggleOnline = (status: 'available' | 'busy' | 'offline') => {
    if (!activePartner) return;
    if (activePartner.isActive === false) {
      alert('Cannot change status: This partner account is currently suspended or inactive.');
      return;
    }
    store.updatePartnerStatus(activePartner.id, status);
  };

  const handleUpdateStatus = (orderId: string, nextStatus: OrderStatus, note?: string) => {
    if (!activePartner) return;
    if (activePartner.isActive === false) {
      alert('Your account is currently inactive. Contact dispatch supervisor.');
      return;
    }
    const result = store.updateDeliveryProgress(orderId, nextStatus, note, {
      id: activePartner.id,
      name: activePartner.name,
      role: 'delivery_person'
    });
    if (!result) {
      alert('Status transition rejected. Please verify the workflow sequence.');
    }
  };

  const handleReportFailure = () => {
    if (!failedOrderId || !activePartner) return;
    const result = store.updateDeliveryProgress(failedOrderId, 'failed_delivery', failedReason, {
      id: activePartner.id,
      name: activePartner.name,
      role: 'delivery_person'
    });
    if (!result) {
      alert('Failed to report delivery issue. Action rejected.');
    }
    setFailureModalOpen(false);
    setFailedOrderId(null);
  };

  const toggleItemsExpand = (orderId: string) => {
    setExpandedOrderIds(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Account Inactive / Suspended Warning Banner */}
      {activePartner && activePartner.isActive === false && (
        <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 flex items-start gap-3 shadow-sm">
          <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-heading font-extrabold text-sm text-rose-900">
              Account Suspended / Inactive
            </h4>
            <p className="text-xs text-rose-800 leading-relaxed">
              This delivery partner account has been deactivated by administration. You cannot accept new dispatches or update existing order statuses until an admin reactivates your account in the Fleet Roster.
            </p>
          </div>
        </div>
      )}

      {/* Top Rider Profile Bar */}
      <div className="p-6 rounded-2xl border border-[#EFE7E1] bg-white shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={activePartner?.avatarUrl}
              alt={activePartner?.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-[#721C46] shadow-sm"
            />
            <span className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
              activePartner?.isActive === false
                ? 'bg-rose-500'
                : activePartner?.isOnline 
                  ? 'bg-[#267653]' 
                  : 'bg-neutral-400'
            }`} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#721C46] bg-[#FFF0F5] px-2 py-0.5 rounded-full border border-[#E84F87]/20">
                Express Delivery Fleet
              </span>
              <span className="text-xs text-[#756D77] font-semibold">{activePartner?.vehicleNumber}</span>
              {activePartner?.isActive === false ? (
                <span className="text-[10px] font-extrabold uppercase bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                  Suspended
                </span>
              ) : (
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Active Partner
                </span>
              )}
            </div>
            <h1 className="font-heading font-extrabold text-xl text-[#29242A]">
              {activePartner?.name}
            </h1>
            <p className="text-xs text-[#756D77] flex flex-wrap items-center gap-2 mt-0.5">
              <span>★ {activePartner?.rating} Rating</span>
              <span>•</span>
              <span>{activePartner?.totalDeliveries} Completed Runs</span>
              <span>•</span>
              <span className="font-medium text-[#29242A]">
                Capacity: {assignedOrders.length} / {activePartner?.maxActiveOrders || 2} active
              </span>
            </p>
          </div>
        </div>

        {/* Partner Selector & Duty Status */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Partner Switcher Dropdown */}
          <select
            value={selectedPartnerId}
            onChange={e => setSelectedPartnerId(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-lg border border-[#EFE7E1] bg-[#FAF7F4] text-[#29242A] focus:outline-none focus:border-[#721C46]"
          >
            {partners.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} {p.isActive === false ? '[SUSPENDED]' : `(${p.currentStatus.toUpperCase()})`}
              </option>
            ))}
          </select>

          {/* Status Buttons */}
          <div className="inline-flex rounded-lg border border-[#EFE7E1] p-1 bg-[#FAF7F4]">
            <button
              onClick={() => handleToggleOnline('available')}
              disabled={activePartner?.isActive === false}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                activePartner?.currentStatus === 'available'
                  ? 'bg-[#267653] text-white shadow-sm'
                  : 'text-[#756D77] hover:text-[#29242A] disabled:opacity-50'
              }`}
            >
              On Duty
            </button>
            <button
              onClick={() => handleToggleOnline('busy')}
              disabled={activePartner?.isActive === false}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                activePartner?.currentStatus === 'busy'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-[#756D77] hover:text-[#29242A] disabled:opacity-50'
              }`}
            >
              Busy
            </button>
            <button
              onClick={() => handleToggleOnline('offline')}
              disabled={activePartner?.isActive === false}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                activePartner?.currentStatus === 'offline'
                  ? 'bg-neutral-600 text-white shadow-sm'
                  : 'text-[#756D77] hover:text-[#29242A] disabled:opacity-50'
              }`}
            >
              Offline
            </button>
          </div>
        </div>
      </div>

      {/* Geolocation & Phase 2 Architecture Ready Telemetry Bar */}
      <div className="p-4 rounded-xl border border-[#EFE7E1] bg-[#FAF7F4] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white shadow-sm shrink-0 ${
            gpsStatus === 'active' 
              ? 'bg-[#267653]' 
              : gpsStatus === 'denied' 
                ? 'bg-[#E84F87]' 
                : 'bg-neutral-600'
          }`}>
            <Compass className={`w-4 h-4 ${gpsStatus === 'active' ? 'animate-spin-slow' : ''}`} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-heading font-extrabold text-[#29242A]">
                {gpsStatus === 'active' 
                  ? 'Device Geolocation Active' 
                  : gpsStatus === 'acquiring' 
                    ? 'Acquiring Satellite Lock...' 
                    : gpsStatus === 'denied' 
                      ? 'GPS Permission Denied' 
                      : 'GPS Standby (Activates on Road Dispatches)'}
              </span>
              {gpsStatus === 'active' && (
                <span className="text-[10px] font-bold text-[#267653] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  ±{gpsAccuracy || 5}m accuracy
                </span>
              )}
              <span className="text-[10px] font-bold text-[#721C46] bg-[#FFF0F5] px-2 py-0.5 rounded-full border border-[#E84F87]/20">
                Phase 2 Architecture Ready
              </span>
            </div>
            <p className="text-[11px] text-[#756D77] mt-0.5">
              {activePartner?.currentLocation ? (
                <span>
                  Lat: {activePartner.currentLocation.latitude.toFixed(4)}, Lng: {activePartner.currentLocation.longitude.toFixed(4)} • Updates logged: {gpsPingCount} ({lastPingTime || 'Initial sync'})
                </span>
              ) : (
                <span>GPS telemetry broadcaster configured for real-time driver tracking in Phase 2</span>
              )}
            </p>
          </div>
        </div>

        {gpsErrorMsg && (
          <span className="text-[11px] text-[#E84F87] font-semibold bg-rose-50 px-2 py-1 rounded border border-rose-200">
            {gpsErrorMsg}
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#EFE7E1] gap-8 text-xs font-bold">
        <button
          onClick={() => setActiveTab('assigned')}
          className={`pb-3 flex items-center gap-2 transition-colors border-b-2 ${
            activeTab === 'assigned'
              ? 'border-[#721C46] text-[#721C46] font-extrabold'
              : 'border-transparent text-[#756D77] hover:text-[#29242A]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Active Assigned Runs ({assignedOrders.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`pb-3 flex items-center gap-2 transition-colors border-b-2 ${
            activeTab === 'completed'
              ? 'border-[#721C46] text-[#721C46] font-extrabold'
              : 'border-transparent text-[#756D77] hover:text-[#29242A]'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Completed Today ({completedToday.length})</span>
        </button>
      </div>

      {/* Tab 1: Active Dispatches */}
      {activeTab === 'assigned' && (
        <div className="space-y-6">
          {assignedOrders.length === 0 ? (
            <div className="p-12 rounded-2xl border border-[#EFE7E1] bg-white text-center space-y-3 shadow-card">
              <CheckCircle2 className="w-12 h-12 text-[#267653] mx-auto" />
              <h3 className="font-heading font-extrabold text-base text-[#29242A]">No Active Runs Pending</h3>
              <p className="text-xs text-[#756D77] max-w-sm mx-auto">
                You are on standby. Orders dispatched and manually assigned by operations dispatchers will appear here instantly.
              </p>
            </div>
          ) : (
            assignedOrders.map(order => {
              const isJustAssigned = order.status === 'assigned';
              const isAcknowledged = order.status === 'acknowledged';
              const isPicked = order.status === 'picked_up';
              const isOut = order.status === 'out_for_delivery';
              const isCodUnpaid = order.paymentMethod?.toLowerCase() === 'cod' && order.paymentStatus !== 'paid';

              const pin = (order.shippingAddress.pinCode || '').trim();
              const hub = DARK_STORE_HUBS[pin] || DEFAULT_DARK_STORE_HUB;

              return (
                <div
                  key={order.id}
                  className="p-6 rounded-2xl border border-[#EFE7E1] bg-white shadow-card space-y-5"
                >
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono font-extrabold text-base text-[#29242A]">
                        #{order.orderNumber}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        isOut 
                          ? 'bg-emerald-50 text-[#267653] border-emerald-200' 
                          : isPicked
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : isAcknowledged
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-[#FFF0F5] text-[#721C46] border-[#E84F87]/30'
                      }`}>
                        {order.status.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      <span className="text-xs text-[#756D77]">
                        • {order.items.length} items • ₹{order.totalAmount}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onNavigate(`/track-order/${order.orderNumber}`)}
                        className="text-xs font-bold text-[#721C46] hover:underline flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Customer View</span>
                      </button>
                    </div>
                  </div>

                  {/* COD Cash Collection Alert Card */}
                  {isCodUnpaid ? (
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-200/90 flex items-center justify-center font-bold text-amber-900 shrink-0 text-sm">
                          ₹
                        </div>
                        <div>
                          <span className="font-extrabold uppercase tracking-wide text-[10px] text-amber-800 block">
                            💵 Cash on Delivery (COD) Collection Required
                          </span>
                          <span className="text-xs font-semibold text-neutral-800">
                            Collect <strong>₹{order.totalAmount}</strong> in cash or UPI QR prior to parcel handover.
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-amber-200 text-amber-900 shrink-0 self-start sm:self-auto">
                        UNCOLLECTED
                      </span>
                    </div>
                  ) : order.paymentMethod?.toLowerCase() === 'cod' && order.paymentStatus === 'paid' ? (
                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>COD Payment Collected: ₹{order.totalAmount} verified and settled.</span>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-100 text-emerald-800 text-xs flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Prepaid Order (Online Payment Verified): Do not collect money from customer.</span>
                    </div>
                  )}

                  {/* Pick Up & Delivery Waypoints */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Pickup Bay */}
                    <div className="p-3.5 rounded-xl border border-[#EFE7E1] bg-[#FAF7F4] space-y-1">
                      <span className="text-[10px] font-extrabold uppercase text-[#721C46] flex items-center gap-1">
                        <span>🏬 1. Pickup Point</span>
                      </span>
                      <p className="font-bold text-[#29242A]">{hub.name}</p>
                      <p className="text-[11px] text-[#756D77]">{hub.address}</p>
                    </div>

                    {/* Drop Destination */}
                    <div className="p-3.5 rounded-xl border border-[#EFE7E1] bg-[#FAF7F4] space-y-1">
                      <span className="text-[10px] font-extrabold uppercase text-[#267653] flex items-center gap-1">
                        <span>🏠 2. Customer Destination</span>
                      </span>
                      <p className="font-bold text-[#29242A]">{order.customerName} ({order.customerPhone})</p>
                      <p className="text-[11px] text-[#756D77]">
                        {order.shippingAddress.addressLine}, {order.shippingAddress.area} ({order.shippingAddress.pinCode})
                      </p>
                    </div>
                  </div>

                  {/* Customer Instructions if any */}
                  {order.shippingAddress.deliveryInstructions && (
                    <div className="p-3 rounded-lg bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                      <Info className="w-4 h-4 text-amber-700 shrink-0" />
                      <span><strong>Customer Instruction:</strong> {order.shippingAddress.deliveryInstructions}</span>
                    </div>
                  )}

                  {/* Collapsible Order Items Checklist */}
                  <div>
                    <button
                      onClick={() => toggleItemsExpand(order.id)}
                      className="text-xs font-semibold text-[#721C46] hover:underline flex items-center gap-1.5"
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>{expandedOrderIds[order.id] ? 'Hide' : 'Inspect'} Bag Items ({order.items.length})</span>
                      {expandedOrderIds[order.id] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {expandedOrderIds[order.id] && (
                      <div className="mt-2.5 p-3 rounded-xl bg-[#FAF7F4] border border-[#EFE7E1] space-y-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#756D77] block">
                          Cosmetics Package Contents Verification
                        </span>
                        <div className="space-y-1.5">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-neutral-100 last:border-0">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-white border border-[#EFE7E1] flex items-center justify-center font-bold text-[10px] text-[#721C46]">
                                  {item.quantity}×
                                </span>
                                <span className="font-medium text-[#29242A]">{item.productName || item.productId}</span>
                              </div>
                              <span className="font-semibold text-[#756D77]">₹{item.totalPrice || item.unitPrice * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Embedded Live Map for active navigation */}
                  {isOut && order.destinationCoordinates && (
                    <div className="rounded-xl overflow-hidden border border-[#EFE7E1]">
                      <LiveTrackingMap
                        riderLocation={activePartner?.currentLocation}
                        destinationLocation={{
                          latitude: order.destinationCoordinates.latitude,
                          longitude: order.destinationCoordinates.longitude,
                          addressText: order.shippingAddress.addressLine
                        }}
                        hubLocation={{
                          latitude: hub.coordinates.lat,
                          longitude: hub.coordinates.lng,
                          name: hub.name
                        }}
                        routeCoordinates={order.deliveryAssignment?.routeGeometry}
                        distanceRemainingKm={order.deliveryAssignment?.distanceRemainingKm}
                        etaMinutes={order.deliveryAssignment?.etaMinutes}
                        orderStatus={order.status}
                        height="240px"
                      />
                    </div>
                  )}

                  {/* Rider Primary Action Toolbar */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-neutral-100">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* External Map Navigation Link */}
                      {order.destinationCoordinates && (
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${order.destinationCoordinates.latitude},${order.destinationCoordinates.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="dew-btn-secondary !py-2 !px-3 text-xs font-bold flex items-center gap-1.5"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Google Maps</span>
                          <ExternalLink className="w-3 h-3 text-[#756D77]" />
                        </a>
                      )}

                      <a
                        href={`tel:${order.customerPhone}`}
                        className="dew-btn-secondary !py-2 !px-3 text-xs font-bold flex items-center gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call Customer</span>
                      </a>
                    </div>

                    {/* Validated Lifecycle Step Buttons (Phase 1) */}
                    <div className="flex flex-wrap items-center gap-2">
                      {isJustAssigned && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'acknowledged', 'Courier acknowledged assignment')}
                            disabled={activePartner?.isActive === false}
                            className="dew-btn-secondary !py-2 !px-3 text-xs font-bold flex items-center gap-1.5 text-[#721C46] border-[#721C46]/30 hover:bg-[#FFF0F5] disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Acknowledge Run</span>
                          </button>

                          <button
                            onClick={() => handleUpdateStatus(order.id, 'picked_up', 'Parcel collected from dark-store bay')}
                            disabled={activePartner?.isActive === false}
                            className="dew-btn-berry !py-2 !px-4 text-xs font-extrabold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                          >
                            <Package className="w-4 h-4" />
                            <span>Confirm Pickup</span>
                          </button>
                        </>
                      )}

                      {isAcknowledged && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'picked_up', 'Parcel collected from dark-store bay')}
                          disabled={activePartner?.isActive === false}
                          className="dew-btn-berry !py-2 !px-4 text-xs font-extrabold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                        >
                          <Package className="w-4 h-4" />
                          <span>Confirm Dark Store Pickup</span>
                        </button>
                      )}

                      {isPicked && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'out_for_delivery', 'Departed dark store on road to customer')}
                          disabled={activePartner?.isActive === false}
                          className="dew-btn-berry !py-2 !px-4 text-xs font-extrabold flex items-center gap-1.5 !bg-[#267653] text-white shadow-sm disabled:opacity-50"
                        >
                          <Truck className="w-4 h-4" />
                          <span>Start Road Delivery</span>
                        </button>
                      )}

                      {isOut && (
                        <>
                          <button
                            onClick={() => {
                              setFailedOrderId(order.id);
                              setFailureModalOpen(true);
                            }}
                            disabled={activePartner?.isActive === false}
                            className="text-xs text-[#E84F87] hover:underline font-bold px-2 py-1 disabled:opacity-50"
                          >
                            Report Issue
                          </button>

                          <button
                            onClick={() => handleUpdateStatus(order.id, 'delivered', 'Handed over directly to customer')}
                            disabled={activePartner?.isActive === false}
                            className="dew-btn-berry !py-2 !px-5 text-xs font-extrabold !bg-[#267653] text-white shadow-md flex items-center gap-1.5 disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Confirm Handover & Complete</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Completed Today */}
      {activeTab === 'completed' && (
        <div className="p-6 rounded-2xl border border-[#EFE7E1] bg-white shadow-card space-y-4">
          <h3 className="font-heading font-extrabold text-sm text-[#29242A] border-b border-neutral-100 pb-2">
            Completed Fulfilments Today ({completedToday.length})
          </h3>

          {completedToday.length === 0 ? (
            <p className="text-xs text-[#756D77] py-8 text-center">No completed runs recorded yet today.</p>
          ) : (
            <div className="divide-y divide-neutral-100">
              {completedToday.map(order => (
                <div key={order.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-[#29242A]">#{order.orderNumber}</span>
                    <span className="text-[#756D77] block text-[11px]">
                      Delivered to {order.customerName} ({order.shippingAddress.area})
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-[#267653] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Delivered
                    </span>
                    <span className="text-[10px] text-[#756D77] block mt-0.5">
                      {order.actualDeliveryTime ? new Date(order.actualDeliveryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Failed Delivery Modal */}
      {failureModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-[#EFE7E1] shadow-2xl p-6 w-full max-w-sm space-y-4">
            <h3 className="font-heading font-extrabold text-base text-[#29242A]">
              Report Delivery Issue
            </h3>
            <p className="text-xs text-[#756D77]">
              Select the reason why the parcel could not be handed over to the customer:
            </p>

            <div className="space-y-2 text-xs">
              {[
                'Customer phone unreachable after 3 attempts',
                'Customer address incorrect or inaccessible',
                'Customer refused parcel / cancelled at doorstep',
                'Severe weather or road closure preventing access',
                'Damaged packaging requiring dark-store replacement'
              ].map((reason, idx) => (
                <label key={idx} className="flex items-center gap-2 p-2 rounded-lg border border-[#EFE7E1] hover:bg-[#FAF7F4] cursor-pointer">
                  <input
                    type="radio"
                    name="failedReason"
                    checked={failedReason === reason}
                    onChange={() => setFailedReason(reason)}
                    className="accent-[#721C46]"
                  />
                  <span className="text-[#29242A]">{reason}</span>
                </label>
              ))}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setFailureModalOpen(false)}
                className="dew-btn-secondary text-xs !py-2 !px-3 font-semibold"
              >
                Back to Delivery
              </button>
              <button
                onClick={handleReportFailure}
                className="dew-btn-berry text-xs !py-2 !px-4 font-bold !bg-[#E84F87] text-white shadow-sm"
              >
                Confirm Failed Run
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
