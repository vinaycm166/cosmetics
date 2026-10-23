import React, { useEffect } from 'react';
import { CheckCircle2, Clock, MapPin, ArrowRight, PackageCheck, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { store } from '../lib/store';

interface PaymentSuccessPageProps {
  orderNumber?: string;
  onNavigate: (route: string) => void;
}

export const PaymentSuccessPage: React.FC<PaymentSuccessPageProps> = ({ orderNumber, onNavigate }) => {
  const order = orderNumber ? store.getOrderByIdOrNumber(orderNumber) : store.getOrders()[0];

  useEffect(() => {
    // Fire celebratory beauty confetti
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#D95F7D', '#F8E7EB', '#267653', '#FAF7F4']
      });
    } catch {}
  }, []);

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <CheckCircle2 className="w-12 h-12 text-mint-500 mx-auto" />
        <h2 className="font-heading font-bold text-2xl text-charcoal-900">Payment Confirmed</h2>
        <p className="text-xs text-muted">Your beauty essentials have been received and are being prepared.</p>
        <button onClick={() => onNavigate('/account/orders')} className="dew-btn-primary text-xs mt-2">
          View My Orders
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Confirmation Card */}
      <div className="p-8 sm:p-10 rounded-md border border-neutral-border bg-white shadow-card text-center space-y-6">
        <div className="w-14 h-14 rounded-full bg-mint-50 border border-mint-200 text-mint-500 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-mint-500 bg-mint-50 px-2.5 py-0.5 rounded border border-mint-200 inline-block">
            Order Verified & Confirmed
          </span>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-charcoal-900">
            Thank You for Your Order!
          </h1>
          <p className="text-xs sm:text-sm text-muted max-w-md mx-auto">
            Order <strong className="font-mono text-charcoal-900">#{order.orderNumber}</strong> has been received by our local micro-fulfillment center.
          </p>
        </div>

        {/* 15-Minute Delivery ETA Badge */}
        <div className="p-4 rounded-md bg-[#FAF7F4] border border-neutral-border max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-left">
            <Clock className="w-4 h-4 text-brand-500 shrink-0" />
            <div>
              <span className="text-xs font-semibold text-charcoal-900 block">Estimated Delivery Arrival</span>
              <span className="text-[11px] text-muted">
                12 to 15 minutes to {order.shippingAddress.area}
              </span>
            </div>
          </div>
          <span className="text-xs font-bold text-mint-500 bg-white px-2 py-0.5 rounded border border-mint-200">
            ⚡ Express
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigate(`/track-order/${order.orderNumber}`)}
            className="w-full sm:w-auto dew-btn-primary !px-5 !py-2.5 text-xs font-bold flex items-center justify-center gap-2"
          >
            <span>Live Order Tracking</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onNavigate('/shop')}
            className="w-full sm:w-auto dew-btn-secondary !px-5 !py-2.5 text-xs font-semibold"
          >
            Continue Shopping
          </button>
        </div>
      </div>

      {/* Snapshot of Items & Delivery Address */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Shipping Snapshot */}
        <div className="p-6 rounded-md border border-neutral-border bg-white shadow-card space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-charcoal-900 uppercase tracking-wider border-b border-neutral-100 pb-2">
            <MapPin className="w-4 h-4 text-brand-500" />
            <span>Delivery Destination</span>
          </div>
          <p className="text-xs font-semibold text-charcoal-900">{order.customerName}</p>
          <p className="text-xs text-muted leading-relaxed">
            {order.shippingAddress.addressLine}, {order.shippingAddress.apartmentBuilding && `${order.shippingAddress.apartmentBuilding}, `}
            {order.shippingAddress.area}, {order.shippingAddress.city} — <strong>{order.shippingAddress.pinCode}</strong>
          </p>
          <span className="text-[11px] text-muted block mt-1">Phone: {order.customerPhone}</span>
        </div>

        {/* Payment Snapshot */}
        <div className="p-6 rounded-md border border-neutral-border bg-white shadow-card space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-charcoal-900 uppercase tracking-wider border-b border-neutral-100 pb-2">
            <ShieldCheck className="w-4 h-4 text-mint-500" />
            <span>Payment Summary</span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted">Payment Method:</span>
              <span className="font-semibold text-charcoal-900 uppercase">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Payment Status:</span>
              <span className="font-semibold text-mint-500 uppercase">{order.paymentStatus}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Items Purchased:</span>
              <span className="font-semibold text-charcoal-900">{order.items.length} items</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-neutral-100 text-sm font-bold text-charcoal-900">
              <span>Total Paid:</span>
              <span>₹{order.totalAmount}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
