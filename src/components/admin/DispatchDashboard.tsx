import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  UserCheck, 
  Search, 
  Filter, 
  RefreshCw, 
  Compass, 
  Phone, 
  Star, 
  ShieldCheck, 
  Zap, 
  Navigation,
  ArrowRight,
  Eye,
  Plus,
  Edit2,
  History,
  X,
  UserX,
  Check,
  AlertCircle,
  Users,
  Shield,
  Bike
} from 'lucide-react';
import { store } from '../../lib/store';
import { Order, OrderStatus, DeliveryPartner, DeliveryAssignment } from '../../types';
import { LiveTrackingMap } from '../delivery/LiveTrackingMap';
import { DARK_STORE_HUBS, DEFAULT_DARK_STORE_HUB } from '../../lib/routingService';

interface DispatchDashboardProps {
  onNavigate: (route: string) => void;
}

export const DispatchDashboard: React.FC<DispatchDashboardProps> = ({ onNavigate }) => {
  const [orders, setOrders] = useState<Order[]>(() => store.getOrders());
  const [partners, setPartners] = useState<DeliveryPartner[]>(() => store.getDeliveryPartners());

  // Main View Switcher: Live Dispatch vs Delivery Partners Roster
  const [activeView, setActiveView] = useState<'dispatch' | 'partners'>('dispatch');

  // Filters & State
  const [stageFilter, setStageFilter] = useState<'all' | 'ready_for_dispatch' | 'unassigned' | 'in_transit' | 'delivered' | 'issues'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Assign / Reassign modal state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [targetOrderId, setTargetOrderId] = useState<string | null>(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');
  const [reassignmentReason, setReassignmentReason] = useState<string>('Operational schedule optimization');

  // Audit / History modal state
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyOrder, setHistoryOrder] = useState<Order | null>(null);

  // Partner Management modal state
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<DeliveryPartner | null>(null);
  const [partnerForm, setPartnerForm] = useState({
    name: '',
    phone: '',
    email: '',
    vehicleType: 'electric_scooter' as 'electric_scooter' | 'bike' | 'bicycle' | 'van',
    vehicleNumber: '',
    maxActiveOrders: 2
  });

  useEffect(() => {
    const sync = () => {
      setOrders(store.getOrders());
      setPartners(store.getDeliveryPartners());
    };
    const unsub = store.subscribe(sync);
    return () => {
      unsub();
    };
  }, []);

  // Filtered orders
  const filteredOrders = orders.filter(o => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.shippingAddress.area.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (stageFilter === 'ready_for_dispatch') {
      return ['packed', 'ready_for_dispatch'].includes(o.status);
    }
    if (stageFilter === 'unassigned') {
      return ['confirmed', 'processing', 'packed', 'ready_for_dispatch'].includes(o.status) && !o.assignedDeliveryPerson;
    }
    if (stageFilter === 'in_transit') {
      return ['assigned', 'acknowledged', 'picked_up', 'out_for_delivery'].includes(o.status);
    }
    if (stageFilter === 'delivered') {
      return o.status === 'delivered';
    }
    if (stageFilter === 'issues') {
      return ['failed_delivery', 'cancelled'].includes(o.status);
    }
    return true;
  });

  // Active in-transit orders for map inspection
  const inTransitOrders = orders.filter(o => ['assigned', 'acknowledged', 'picked_up', 'out_for_delivery'].includes(o.status));
  const readyOrders = orders.filter(o => ['packed', 'ready_for_dispatch'].includes(o.status));
  const activeFocusOrder = inTransitOrders.find(o => o.id === selectedOrderId) || inTransitOrders[0] || orders[0];

  // Delayed orders check (out for delivery > 15 mins or past estimatedDeliveryTime)
  const delayedOrders = orders.filter(o => {
    if (!['assigned', 'acknowledged', 'picked_up', 'out_for_delivery'].includes(o.status)) return false;
    if (o.estimatedDeliveryTime && new Date().getTime() > new Date(o.estimatedDeliveryTime).getTime()) {
      return true;
    }
    return false;
  });

  const onlinePartners = partners.filter(p => p.isOnline);
  const availablePartners = partners.filter(p => p.isOnline && p.currentStatus === 'available' && p.isActive !== false);

  const handleOpenAssignModal = (orderId: string) => {
    setTargetOrderId(orderId);
    const targetOrder = orders.find(o => o.id === orderId);
    const suggested = store.suggestBestPartner(orderId);
    setSelectedPartnerId(suggested?.id || availablePartners[0]?.id || partners.find(p => p.isActive !== false)?.id || '');
    setReassignmentReason(targetOrder?.assignedDeliveryPerson ? 'Rider reassignment requested by dispatch' : '');
    setAssignModalOpen(true);
  };

  const handleConfirmAssign = () => {
    if (!targetOrderId || !selectedPartnerId) return;
    const targetOrder = orders.find(o => o.id === targetOrderId);
    const isReassignment = !!targetOrder?.assignedDeliveryPerson;

    if (isReassignment) {
      store.reassignDeliveryPartner(targetOrderId, selectedPartnerId, reassignmentReason || 'Manual dispatch reassignment', {
        id: 'admin',
        name: 'Admin Dispatch Controller',
        role: 'super_admin'
      });
    } else {
      store.assignDeliveryPartner(targetOrderId, selectedPartnerId, {
        id: 'admin',
        name: 'Admin Dispatch Controller',
        role: 'super_admin'
      });
    }

    setAssignModalOpen(false);
    setTargetOrderId(null);
  };

  const handleAutoAssign = (orderId: string) => {
    const best = store.suggestBestPartner(orderId);
    if (best) {
      store.assignDeliveryPartner(orderId, best.id, {
        id: 'admin-auto',
        name: 'Smart Dispatch AI Engine',
        role: 'system'
      });
    } else {
      alert('No available online delivery partners currently nearby or under workload capacity.');
    }
  };

  const handleOpenHistoryModal = (order: Order) => {
    setHistoryOrder(order);
    setHistoryModalOpen(true);
  };

  // Partner Form Actions
  const handleOpenNewPartnerModal = () => {
    setEditingPartner(null);
    setPartnerForm({
      name: '',
      phone: '',
      email: '',
      vehicleType: 'electric_scooter',
      vehicleNumber: '',
      maxActiveOrders: 2
    });
    setPartnerModalOpen(true);
  };

  const handleOpenEditPartnerModal = (p: DeliveryPartner) => {
    setEditingPartner(p);
    setPartnerForm({
      name: p.name,
      phone: p.phone,
      email: p.email || '',
      vehicleType: p.vehicleType,
      vehicleNumber: p.vehicleNumber,
      maxActiveOrders: p.maxActiveOrders || 2
    });
    setPartnerModalOpen(true);
  };

  const handleSavePartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerForm.name.trim() || !partnerForm.phone.trim() || !partnerForm.vehicleNumber.trim()) {
      alert('Please fill all required partner fields.');
      return;
    }

    if (editingPartner) {
      store.updateDeliveryPartner(editingPartner.id, {
        name: partnerForm.name.trim(),
        phone: partnerForm.phone.trim(),
        email: partnerForm.email.trim(),
        vehicleType: partnerForm.vehicleType,
        vehicleNumber: partnerForm.vehicleNumber.trim(),
        maxActiveOrders: partnerForm.maxActiveOrders
      });
    } else {
      store.createDeliveryPartner({
        name: partnerForm.name.trim(),
        phone: partnerForm.phone.trim(),
        email: partnerForm.email.trim(),
        vehicleType: partnerForm.vehicleType,
        vehicleNumber: partnerForm.vehicleNumber.trim(),
        maxActiveOrders: partnerForm.maxActiveOrders
      });
    }

    setPartnerModalOpen(false);
    setEditingPartner(null);
  };

  const handleTogglePartnerActive = (partner: DeliveryPartner) => {
    const nextActive = partner.isActive === false;
    store.togglePartnerActive(partner.id, nextActive);
  };

  const activeFocusPartner = activeFocusOrder?.assignedDeliveryPerson?.id
    ? store.getDeliveryPartnerById(activeFocusOrder.assignedDeliveryPerson.id)
    : undefined;

  const activePin = (activeFocusOrder?.shippingAddress?.pinCode || '').trim();
  const activeHub = DARK_STORE_HUBS[activePin] || DEFAULT_DARK_STORE_HUB;

  const targetOrderObj = orders.find(o => o.id === targetOrderId);
  const isTargetAlreadyAssigned = !!targetOrderObj?.assignedDeliveryPerson;

  return (
    <div className="space-y-6">
      
      {/* Top Header & Sub-Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFE7E1]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#721C46] bg-[#FFF0F5] px-2 py-0.5 rounded-full border border-[#E84F87]/20">
              Phase 1 Hyperlocal Live Delivery
            </span>
          </div>
          <h2 className="font-heading font-extrabold text-xl text-[#29242A]">
            Hyperlocal Delivery Dispatch & Fleet Control
          </h2>
          <p className="text-xs text-[#756D77]">
            Manual partner allocation, conflict-free reassignment, and SLA fulfillment tracking
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Sub-tab view buttons */}
          <div className="inline-flex rounded-lg border border-[#EFE7E1] p-1 bg-[#FAF7F4]">
            <button
              onClick={() => setActiveView('dispatch')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
                activeView === 'dispatch'
                  ? 'bg-[#721C46] text-white shadow-sm'
                  : 'text-[#756D77] hover:text-[#29242A]'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Dispatch Board</span>
            </button>
            <button
              onClick={() => setActiveView('partners')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
                activeView === 'partners'
                  ? 'bg-[#721C46] text-white shadow-sm'
                  : 'text-[#756D77] hover:text-[#29242A]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Courier Roster ({partners.length})</span>
            </button>
          </div>

          <button
            onClick={() => onNavigate('/delivery')}
            className="dew-btn-secondary !py-2 !px-3.5 text-xs font-bold flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Rider App</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: LIVE DISPATCH BOARD */}
      {activeView === 'dispatch' && (
        <div className="space-y-6">
          {/* SLA Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-[#EFE7E1] bg-white shadow-card">
              <span className="text-[10px] font-extrabold text-[#756D77] uppercase tracking-wider block">
                Active Dispatches
              </span>
              <span className="font-heading font-extrabold text-2xl text-[#721C46] block mt-1">
                {inTransitOrders.length}
              </span>
              <span className="text-[11px] text-[#756D77]">Riders on road</span>
            </div>

            <div className="p-4 rounded-xl border border-[#EFE7E1] bg-white shadow-card">
              <span className="text-[10px] font-extrabold text-[#756D77] uppercase tracking-wider block">
                Ready for Dispatch
              </span>
              <span className="font-heading font-extrabold text-2xl text-[#E84F87] block mt-1">
                {readyOrders.length}
              </span>
              <span className="text-[11px] text-[#756D77]">Packed in warehouse</span>
            </div>

            <div className="p-4 rounded-xl border border-[#EFE7E1] bg-white shadow-card">
              <span className="text-[10px] font-extrabold text-[#756D77] uppercase tracking-wider block">
                Online Couriers
              </span>
              <span className="font-heading font-extrabold text-2xl text-[#267653] block mt-1">
                {onlinePartners.length} / {partners.length}
              </span>
              <span className="text-[11px] text-[#267653] font-bold">
                {availablePartners.length} available now
              </span>
            </div>

            <div className="p-4 rounded-xl border border-[#EFE7E1] bg-white shadow-card">
              <span className="text-[10px] font-extrabold text-[#756D77] uppercase tracking-wider block">
                SLA Compliance Rate
              </span>
              <span className="font-heading font-extrabold text-2xl text-[#267653] block mt-1">
                98.9%
              </span>
              <span className="text-[11px] text-[#756D77]">15-min delivery promise</span>
            </div>
          </div>

          {/* Delayed Delivery SLA Alerts */}
          {delayedOrders.length > 0 && (
            <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
                <h4 className="font-heading font-bold text-xs uppercase tracking-wider">
                  Delayed Delivery Alerts ({delayedOrders.length})
                </h4>
              </div>
              <p className="text-xs">
                The following in-transit orders have exceeded the estimated arrival window. Please review rider GPS telemetry or reassign:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {delayedOrders.map(o => (
                  <div key={o.id} className="p-2 rounded-lg bg-white border border-amber-200 text-xs flex items-center gap-3">
                    <span className="font-mono font-bold text-[#721C46]">#{o.orderNumber}</span>
                    <span className="text-[#756D77]">Rider: {o.assignedDeliveryPerson?.name || 'Unassigned'}</span>
                    <button
                      onClick={() => handleOpenAssignModal(o.id)}
                      className="text-[11px] font-bold text-[#E84F87] hover:underline"
                    >
                      Reassign
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Live Fleet Map & Active Order Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Map Column */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-sm text-[#29242A] flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-[#721C46]" />
                  <span>Live Active Fleet Telemetry</span>
                </h3>
                {activeFocusOrder && (
                  <span className="text-xs text-[#756D77]">
                    Inspecting: <strong className="font-mono text-[#721C46]">#{activeFocusOrder.orderNumber}</strong> ({activeFocusOrder.status})
                  </span>
                )}
              </div>

              {activeFocusOrder?.destinationCoordinates ? (
                <div className="rounded-xl overflow-hidden border border-[#EFE7E1]">
                  <LiveTrackingMap
                    riderLocation={activeFocusPartner?.currentLocation}
                    destinationLocation={{
                      latitude: activeFocusOrder.destinationCoordinates.latitude,
                      longitude: activeFocusOrder.destinationCoordinates.longitude,
                      addressText: `${activeFocusOrder.shippingAddress.addressLine}, ${activeFocusOrder.shippingAddress.area}`
                    }}
                    hubLocation={{
                      latitude: activeHub.coordinates.lat,
                      longitude: activeHub.coordinates.lng,
                      name: activeHub.name
                    }}
                    routeCoordinates={activeFocusOrder.deliveryAssignment?.routeGeometry}
                    distanceRemainingKm={activeFocusOrder.deliveryAssignment?.distanceRemainingKm}
                    etaMinutes={activeFocusOrder.deliveryAssignment?.etaMinutes}
                    orderStatus={activeFocusOrder.status}
                    height="380px"
                  />
                </div>
              ) : (
                <div className="p-12 text-center border border-[#EFE7E1] rounded-xl bg-white text-xs text-[#756D77]">
                  No active in-transit delivery selected for map projection.
                </div>
              )}
            </div>

            {/* In-Transit Orders List Column */}
            <div className="space-y-3">
              <h3 className="font-heading font-bold text-sm text-[#29242A] flex items-center justify-between">
                <span>Active Couriers on Road ({inTransitOrders.length})</span>
                <span className="text-xs font-normal text-[#267653] font-bold">Live Pings</span>
              </h3>

              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {inTransitOrders.length === 0 ? (
                  <div className="p-6 text-center border border-[#EFE7E1] rounded-xl bg-white text-xs text-[#756D77]">
                    No couriers currently in transit.
                  </div>
                ) : (
                  inTransitOrders.map(order => {
                    const isSelected = activeFocusOrder?.id === order.id;
                    return (
                      <div
                        key={order.id}
                        onClick={() => setSelectedOrderId(order.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#721C46] bg-[#FFF0F5]/50 ring-2 ring-[#721C46]/20'
                            : 'border-[#EFE7E1] bg-white hover:bg-[#FAF7F4]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-xs text-[#721C46]">
                            #{order.orderNumber}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#267653] border border-emerald-200">
                            {order.status.replace(/_/g, ' ').toUpperCase()}
                          </span>
                        </div>

                        <div className="mt-2 text-xs">
                          <p className="font-bold text-[#29242A]">{order.assignedDeliveryPerson?.name || 'Courier'}</p>
                          <p className="text-[11px] text-[#756D77]">{order.shippingAddress.area}</p>
                        </div>

                        {order.deliveryAssignment && (
                          <div className="mt-2 pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px]">
                            <span className="font-bold text-[#267653]">
                              ~{order.deliveryAssignment.etaMinutes || 8} mins
                            </span>
                            <span className="text-[#756D77]">
                              {order.deliveryAssignment.distanceRemainingKm || 1.2} km left
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

          {/* Orders Dispatch Queue Table */}
          <div className="p-5 rounded-xl border border-[#EFE7E1] bg-white shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
              <div>
                <h3 className="font-heading font-extrabold text-sm text-[#29242A]">
                  Live Order Fulfilment Queue
                </h3>
                <p className="text-xs text-[#756D77]">Allocate couriers, view dispatch readiness, and track delivery progress</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search order #, customer..."
                  className="px-3 py-1.5 text-xs rounded-lg border border-[#EFE7E1] bg-[#FAF7F4]"
                />

                <div className="inline-flex rounded-lg border border-[#EFE7E1] p-0.5 bg-[#FAF7F4] text-xs">
                  <button
                    onClick={() => setStageFilter('all')}
                    className={`px-2.5 py-1 rounded-md font-bold ${stageFilter === 'all' ? 'bg-[#721C46] text-white' : 'text-[#756D77]'}`}
                  >
                    All ({orders.length})
                  </button>
                  <button
                    onClick={() => setStageFilter('ready_for_dispatch')}
                    className={`px-2.5 py-1 rounded-md font-bold ${stageFilter === 'ready_for_dispatch' ? 'bg-[#721C46] text-white' : 'text-[#756D77]'}`}
                    title="Orders packed and ready for rider dispatch"
                  >
                    ⚡ Ready ({readyOrders.length})
                  </button>
                  <button
                    onClick={() => setStageFilter('unassigned')}
                    className={`px-2.5 py-1 rounded-md font-bold ${stageFilter === 'unassigned' ? 'bg-[#721C46] text-white' : 'text-[#756D77]'}`}
                  >
                    Unassigned
                  </button>
                  <button
                    onClick={() => setStageFilter('in_transit')}
                    className={`px-2.5 py-1 rounded-md font-bold ${stageFilter === 'in_transit' ? 'bg-[#721C46] text-white' : 'text-[#756D77]'}`}
                  >
                    On Road ({inTransitOrders.length})
                  </button>
                  <button
                    onClick={() => setStageFilter('delivered')}
                    className={`px-2.5 py-1 rounded-md font-bold ${stageFilter === 'delivered' ? 'bg-[#721C46] text-white' : 'text-[#756D77]'}`}
                  >
                    Delivered
                  </button>
                  <button
                    onClick={() => setStageFilter('issues')}
                    className={`px-2.5 py-1 rounded-md font-bold ${stageFilter === 'issues' ? 'bg-[#721C46] text-white' : 'text-[#756D77]'}`}
                  >
                    Issues
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF7F4] text-[#756D77] font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Order</th>
                    <th className="p-3">Customer & Area</th>
                    <th className="p-3">Dispatch Status</th>
                    <th className="p-3">Assigned Partner</th>
                    <th className="p-3">ETA / SLA</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-[#756D77]">
                        No orders match the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map(order => {
                      const isInTransit = ['assigned', 'acknowledged', 'picked_up', 'out_for_delivery'].includes(order.status);
                      const isDelivered = order.status === 'delivered';
                      const isReady = ['packed', 'ready_for_dispatch'].includes(order.status);
                      const isAwaiting = ['confirmed', 'processing', 'packed', 'ready_for_dispatch'].includes(order.status) && !order.assignedDeliveryPerson;

                      return (
                        <tr
                          key={order.id}
                          className={`hover:bg-[#FAF7F4] transition-colors ${
                            activeFocusOrder?.id === order.id ? 'bg-[#FFF0F5]/50' : ''
                          }`}
                        >
                          <td className="p-3 font-mono font-bold text-[#29242A]">
                            #{order.orderNumber}
                            {isReady && (
                              <span className="block text-[9px] font-sans font-extrabold text-[#721C46] bg-[#FFF0F5] px-1.5 py-0.2 rounded w-fit mt-0.5 border border-[#E84F87]/20">
                                ⚡ READY TO DISPATCH
                              </span>
                            )}
                          </td>

                          <td className="p-3">
                            <span className="font-bold text-[#29242A] block">{order.customerName}</span>
                            <span className="text-[11px] text-[#756D77]">{order.shippingAddress.area} ({order.shippingAddress.pinCode})</span>
                          </td>

                          <td className="p-3">
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                              isInTransit
                                ? 'bg-emerald-50 text-[#267653] border-emerald-200'
                                : isDelivered
                                  ? 'bg-neutral-100 text-[#756D77] border-neutral-200'
                                  : isReady
                                    ? 'bg-[#FFF0F5] text-[#721C46] border-[#E84F87]/30'
                                    : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}>
                              {order.status.replace(/_/g, ' ').toUpperCase()}
                            </span>
                          </td>

                          <td className="p-3">
                            {order.assignedDeliveryPerson ? (
                              <div>
                                <span className="font-bold text-[#29242A] block">{order.assignedDeliveryPerson.name}</span>
                                <span className="text-[10px] text-[#756D77]">{order.assignedDeliveryPerson.phone} • {order.assignedDeliveryPerson.vehicleNumber}</span>
                              </div>
                            ) : (
                              <span className="text-[#E84F87] font-semibold italic">Unassigned</span>
                            )}
                          </td>

                          <td className="p-3">
                            {order.deliveryAssignment?.etaMinutes ? (
                              <span className="font-bold text-[#267653]">
                                ~{order.deliveryAssignment.etaMinutes} mins ({order.deliveryAssignment.distanceRemainingKm} km)
                              </span>
                            ) : isDelivered ? (
                              <span className="text-[11px] text-[#756D77]">Completed</span>
                            ) : (
                              <span className="text-[11px] text-[#756D77]">15-min SLA</span>
                            )}
                          </td>

                          <td className="p-3 font-bold text-[#29242A]">
                            ₹{order.totalAmount}
                            {order.paymentMethod === 'cod' && (
                              <span className="block text-[9px] text-amber-700 font-bold uppercase">COD</span>
                            )}
                          </td>

                          <td className="p-3 text-right space-x-2">
                            {isAwaiting && (
                              <>
                                <button
                                  onClick={() => handleAutoAssign(order.id)}
                                  className="text-[11px] font-bold text-[#721C46] bg-[#FFF0F5] px-2 py-1 rounded border border-[#E84F87]/25 hover:bg-[#E84F87] hover:text-white transition-colors"
                                  title="Auto-Assign Nearest Partner"
                                >
                                  ⚡ Auto-Assign
                                </button>
                                <button
                                  onClick={() => handleOpenAssignModal(order.id)}
                                  className="text-[11px] font-bold text-[#29242A] bg-white px-2 py-1 rounded border border-[#EFE7E1] hover:bg-[#FAF7F4]"
                                >
                                  Assign
                                </button>
                              </>
                            )}

                            {isInTransit && (
                              <>
                                <button
                                  onClick={() => setSelectedOrderId(order.id)}
                                  className="text-[11px] font-bold text-[#721C46] hover:underline"
                                >
                                  Inspect GPS
                                </button>
                                <button
                                  onClick={() => handleOpenAssignModal(order.id)}
                                  className="text-[11px] font-bold text-[#756D77] bg-white px-2 py-1 rounded border border-[#EFE7E1] hover:bg-[#FAF7F4]"
                                  title="Reassign to another courier"
                                >
                                  Reassign
                                </button>
                              </>
                            )}

                            <button
                              onClick={() => handleOpenHistoryModal(order)}
                              className="text-[11px] font-bold text-[#756D77] hover:underline"
                              title="View assignment & status history"
                            >
                              History
                            </button>

                            <button
                              onClick={() => onNavigate(`/track-order/${order.orderNumber}`)}
                              className="text-[11px] font-bold text-[#721C46] hover:underline"
                            >
                              Customer View
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: DELIVERY PARTNERS & ROSTER MANAGEMENT */}
      {activeView === 'partners' && (
        <div className="space-y-6">
          {/* Top Actions & Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-[#EFE7E1] bg-white shadow-card">
            <div>
              <h3 className="font-heading font-extrabold text-base text-[#29242A]">
                Fleet Roster & Accounts Control
              </h3>
              <p className="text-xs text-[#756D77]">
                Manage courier accounts, enable/suspend rider permissions, and inspect current order loads
              </p>
            </div>

            <button
              onClick={handleOpenNewPartnerModal}
              className="dew-btn-berry !py-2.5 !px-4 text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Delivery Partner</span>
            </button>
          </div>

          {/* Partner Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {partners.map(p => {
              const isActive = p.isActive !== false;
              const isOffline = p.currentStatus === 'offline' || !isActive;
              const loadPercent = Math.min(100, Math.round(((p.assignedOrdersCount || 0) / (p.maxActiveOrders || 2)) * 100));

              return (
                <div
                  key={p.id}
                  className={`p-5 rounded-2xl border bg-white shadow-card space-y-4 transition-all ${
                    !isActive ? 'opacity-70 border-neutral-300 bg-neutral-50/50' : 'border-[#EFE7E1]'
                  }`}
                >
                  {/* Header: Avatar, Name, Active Toggle */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={p.avatarUrl}
                          alt={p.name}
                          className="w-12 h-12 rounded-full object-cover border border-[#EFE7E1]"
                        />
                        <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                          !isActive ? 'bg-neutral-400' : p.isOnline ? 'bg-[#267653]' : 'bg-neutral-400'
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-heading font-extrabold text-sm text-[#29242A]">
                          {p.name}
                        </h4>
                        <p className="text-[11px] text-[#756D77] flex items-center gap-1">
                          <Bike className="w-3 h-3 text-[#721C46]" />
                          <span>{p.vehicleNumber} ({p.vehicleType.replace('_', ' ')})</span>
                        </p>
                      </div>
                    </div>

                    {/* Account Status Badge */}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isActive 
                        ? 'bg-emerald-50 text-[#267653] border-emerald-200' 
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}>
                      {isActive ? 'ACTIVE ACCOUNT' : 'SUSPENDED'}
                    </span>
                  </div>

                  {/* Contact Info & Stats */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-neutral-100">
                    <div>
                      <span className="text-[10px] text-[#756D77] block">Phone</span>
                      <a href={`tel:${p.phone}`} className="font-semibold text-[#721C46] hover:underline">
                        {p.phone}
                      </a>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#756D77] block">Rating & Runs</span>
                      <span className="font-bold text-[#29242A]">★ {p.rating} ({p.totalDeliveries} runs)</span>
                    </div>
                  </div>

                  {/* Workload Capacity Meter */}
                  <div className="space-y-1.5 pt-2 border-t border-neutral-100 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#756D77] font-semibold">Active Workload Capacity</span>
                      <span className="font-bold text-[#29242A]">
                        {p.assignedOrdersCount || 0} / {p.maxActiveOrders || 2} Active Runs
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          (p.assignedOrdersCount || 0) >= (p.maxActiveOrders || 2)
                            ? 'bg-amber-600'
                            : 'bg-[#267653]'
                        }`}
                        style={{ width: `${loadPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center justify-between gap-2 border-t border-neutral-100">
                    <button
                      onClick={() => handleTogglePartnerActive(p)}
                      className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-colors ${
                        isActive
                          ? 'border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100'
                          : 'border-emerald-200 text-[#267653] bg-emerald-50 hover:bg-emerald-100'
                      }`}
                    >
                      {isActive ? 'Suspend Account' : 'Activate Account'}
                    </button>

                    <button
                      onClick={() => handleOpenEditPartnerModal(p)}
                      className="text-[11px] font-bold text-[#29242A] hover:bg-[#FAF7F4] px-3 py-1.5 rounded-lg border border-[#EFE7E1] flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Courier Assignment & Reassignment Modal */}
      {assignModalOpen && targetOrderObj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-[#EFE7E1] shadow-2xl p-6 w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <h3 className="font-heading font-extrabold text-base text-[#29242A]">
                {isTargetAlreadyAssigned ? 'Reassign Delivery Partner' : 'Allocate Delivery Partner'}
              </h3>
              <button onClick={() => setAssignModalOpen(false)} className="text-[#756D77] hover:text-[#29242A]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-2">
              <p className="text-[#756D77]">
                Order <strong className="font-mono text-[#721C46]">#{targetOrderObj.orderNumber}</strong> ({targetOrderObj.customerName}, {targetOrderObj.shippingAddress.area}):
              </p>

              {isTargetAlreadyAssigned && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    <span>Currently Assigned to: {targetOrderObj.assignedDeliveryPerson?.name}</span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    Reassigning will formally archive this assignment and allocate the delivery run to the selected replacement partner.
                  </p>
                </div>
              )}
            </div>

            {/* Reassignment Reason Input */}
            {isTargetAlreadyAssigned && (
              <div>
                <label className="block text-[11px] font-bold uppercase text-[#756D77] mb-1">
                  Reason for Reassignment *
                </label>
                <input
                  type="text"
                  required
                  value={reassignmentReason}
                  onChange={e => setReassignmentReason(e.target.value)}
                  placeholder="e.g. Courier vehicle puncture, heavy rainfall delay, priority dispatch"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#EFE7E1] bg-[#FAF7F4]"
                />
              </div>
            )}

            {/* Courier Selection List */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {partners.map(p => {
                const isSuspended = p.isActive === false;
                const isAtCapacity = (p.assignedOrdersCount || 0) >= (p.maxActiveOrders || 2);
                const isSelected = selectedPartnerId === p.id;
                const isCurrentPartner = targetOrderObj.assignedDeliveryPerson?.id === p.id;

                return (
                  <label
                    key={p.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isSuspended || isAtCapacity
                        ? 'opacity-50 cursor-not-allowed bg-neutral-50 border-neutral-200'
                        : isSelected
                          ? 'border-[#721C46] bg-[#FFF0F5]/60 ring-2 ring-[#721C46]/20 cursor-pointer'
                          : 'border-[#EFE7E1] hover:bg-[#FAF7F4] cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="partnerId"
                        disabled={isSuspended || isAtCapacity}
                        value={p.id}
                        checked={isSelected}
                        onChange={() => setSelectedPartnerId(p.id)}
                        className="accent-[#721C46]"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-[#29242A]">{p.name}</span>
                          {isCurrentPartner && (
                            <span className="text-[9px] font-bold text-[#721C46] bg-[#FFF0F5] px-1.5 py-0.2 rounded border border-[#E84F87]/20">
                              CURRENT
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#756D77]">
                          {p.vehicleNumber} • Load: {p.assignedOrdersCount || 0}/{p.maxActiveOrders || 2} orders
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isSuspended ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                          SUSPENDED
                        </span>
                      ) : isAtCapacity ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                          AT CAPACITY
                        </span>
                      ) : (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          p.currentStatus === 'available'
                            ? 'bg-emerald-50 text-[#267653] border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {p.currentStatus.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-neutral-100">
              <button
                onClick={() => setAssignModalOpen(false)}
                className="dew-btn-secondary text-xs !py-2 !px-3 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAssign}
                disabled={!selectedPartnerId}
                className="dew-btn-berry text-xs !py-2 !px-5 font-bold shadow-sm disabled:opacity-50"
              >
                {isTargetAlreadyAssigned ? 'Confirm Reassignment' : 'Confirm Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit & Assignment History Modal */}
      {historyModalOpen && historyOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-[#EFE7E1] shadow-2xl p-6 w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <div>
                <h3 className="font-heading font-extrabold text-base text-[#29242A]">
                  Order Fulfillment & Assignment Audit
                </h3>
                <p className="text-xs text-[#756D77] font-mono">
                  #{historyOrder.orderNumber} • {historyOrder.customerName}
                </p>
              </div>
              <button onClick={() => setHistoryModalOpen(false)} className="text-[#756D77] hover:text-[#29242A]">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Assignment History Section */}
            <div className="space-y-2">
              <h4 className="font-heading font-bold text-xs uppercase text-[#721C46] flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" />
                <span>Courier Assignment History</span>
              </h4>

              {(!historyOrder.assignmentHistory || historyOrder.assignmentHistory.length === 0) && !historyOrder.deliveryAssignment ? (
                <p className="text-xs text-[#756D77] italic">No delivery partners assigned yet.</p>
              ) : (
                <div className="space-y-2 text-xs">
                  {/* Archived assignments */}
                  {historyOrder.assignmentHistory?.map((asgn, i) => (
                    <div key={i} className="p-3 rounded-xl border border-neutral-200 bg-neutral-50/60 space-y-1">
                      <div className="flex items-center justify-between font-bold text-[#29242A]">
                        <span>{asgn.partnerName} ({asgn.vehicleNumber})</span>
                        <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 px-2 py-0.2 rounded border border-amber-200">
                          {asgn.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#756D77]">
                        Assigned: {new Date(asgn.assignedAt).toLocaleTimeString()} by {asgn.assignedBy?.name || 'Admin'}
                      </p>
                      {asgn.reassignmentReason && (
                        <p className="text-[11px] text-[#721C46]">
                          <strong>Reason:</strong> {asgn.reassignmentReason}
                        </p>
                      )}
                    </div>
                  ))}

                  {/* Active assignment */}
                  {historyOrder.deliveryAssignment && (
                    <div className="p-3 rounded-xl border border-[#267653]/30 bg-emerald-50/40 space-y-1">
                      <div className="flex items-center justify-between font-bold text-[#267653]">
                        <span>{historyOrder.deliveryAssignment.partnerName} ({historyOrder.deliveryAssignment.vehicleNumber})</span>
                        <span className="text-[10px] uppercase font-bold text-[#267653] bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200">
                          ACTIVE RUN
                        </span>
                      </div>
                      <p className="text-[11px] text-[#756D77]">
                        Assigned: {new Date(historyOrder.deliveryAssignment.assignedAt).toLocaleTimeString()} by {historyOrder.deliveryAssignment.assignedBy?.name || 'Admin'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Status History Timeline */}
            <div className="space-y-2 pt-2 border-t border-neutral-100">
              <h4 className="font-heading font-bold text-xs uppercase text-[#721C46] flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" />
                <span>Verified Status Transition Timeline</span>
              </h4>

              <div className="space-y-2 max-h-48 overflow-y-auto text-xs pr-1">
                {historyOrder.statusHistory?.map((h, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-2 rounded-lg bg-[#FAF7F4] border border-[#EFE7E1]">
                    <div className="w-2 h-2 rounded-full bg-[#721C46] mt-1.5 shrink-0" />
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#29242A] uppercase text-[10px]">
                          {h.status.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] text-[#756D77]">
                          {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#756D77]">Actor: {h.actor.name} ({h.actor.role})</p>
                      {h.notes && <p className="text-[11px] text-[#29242A] italic">{h.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end border-t border-neutral-100">
              <button
                onClick={() => setHistoryModalOpen(false)}
                className="dew-btn-secondary text-xs !py-2 !px-4 font-bold"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Partner Create / Edit Modal */}
      {partnerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-[#EFE7E1] shadow-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <h3 className="font-heading font-extrabold text-base text-[#29242A]">
                {editingPartner ? 'Edit Delivery Partner' : 'Register New Delivery Partner'}
              </h3>
              <button onClick={() => setPartnerModalOpen(false)} className="text-[#756D77] hover:text-[#29242A]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePartner} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#756D77] uppercase text-[10px] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={partnerForm.name}
                  onChange={e => setPartnerForm({ ...partnerForm, name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#EFE7E1] bg-[#FAF7F4]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#756D77] uppercase text-[10px] mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={partnerForm.phone}
                    onChange={e => setPartnerForm({ ...partnerForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#EFE7E1] bg-[#FAF7F4]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#756D77] uppercase text-[10px] mb-1">Email</label>
                  <input
                    type="email"
                    value={partnerForm.email}
                    onChange={e => setPartnerForm({ ...partnerForm, email: e.target.value })}
                    placeholder="rider@dewandgo.com"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#EFE7E1] bg-[#FAF7F4]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#756D77] uppercase text-[10px] mb-1">Vehicle Type</label>
                  <select
                    value={partnerForm.vehicleType}
                    onChange={e => setPartnerForm({ ...partnerForm, vehicleType: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#EFE7E1] bg-[#FAF7F4]"
                  >
                    <option value="electric_scooter">Electric Scooter</option>
                    <option value="bike">Motorcycle / Bike</option>
                    <option value="bicycle">Bicycle</option>
                    <option value="van">Delivery Van</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#756D77] uppercase text-[10px] mb-1">Vehicle Plate # *</label>
                  <input
                    type="text"
                    required
                    value={partnerForm.vehicleNumber}
                    onChange={e => setPartnerForm({ ...partnerForm, vehicleNumber: e.target.value.toUpperCase() })}
                    placeholder="KA 01 EQ 4421"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#EFE7E1] bg-[#FAF7F4] uppercase font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#756D77] uppercase text-[10px] mb-1">
                  Max Active Concurrent Orders Capacity
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={partnerForm.maxActiveOrders}
                  onChange={e => setPartnerForm({ ...partnerForm, maxActiveOrders: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#EFE7E1] bg-[#FAF7F4]"
                />
                <span className="text-[10px] text-[#756D77]">Standard default is 2 orders for 15-minute quick-commerce guarantee</span>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setPartnerModalOpen(false)}
                  className="dew-btn-secondary text-xs !py-2 !px-3 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="dew-btn-berry text-xs !py-2 !px-5 font-bold shadow-sm"
                >
                  {editingPartner ? 'Save Changes' : 'Create Courier Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
