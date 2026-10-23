import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface PaymentFailedPageProps {
  reason?: string;
  onNavigate: (route: string) => void;
}

export const PaymentFailedPage: React.FC<PaymentFailedPageProps> = ({ reason, onNavigate }) => {
  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
      <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 text-sale flex items-center justify-center mx-auto">
        <AlertCircle className="w-8 h-8" />
      </div>

      <div className="space-y-1.5">
        <h1 className="font-heading font-bold text-2xl text-charcoal-900">
          Payment Was Not Completed
        </h1>
        <p className="text-xs text-muted leading-relaxed">
          {reason || 'The transaction was cancelled or declined. No funds have been deducted from your account.'}
        </p>
      </div>

      <div className="p-4 rounded-md bg-[#FAF7F4] border border-neutral-border text-xs text-muted text-left space-y-1">
        <strong className="font-semibold text-charcoal-900 block">Your items are safe</strong>
        <p>Your bag items and promo codes remain preserved. You can safely retry checkout using UPI, Card, or Cash on Delivery.</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={() => onNavigate('/checkout')}
          className="w-full sm:w-auto dew-btn-primary text-xs font-semibold flex items-center justify-center gap-2 !py-2.5 !px-5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retry Payment</span>
        </button>
        <button
          onClick={() => onNavigate('/cart')}
          className="w-full sm:w-auto dew-btn-secondary text-xs !py-2.5 !px-5 font-semibold"
        >
          Review Bag
        </button>
      </div>
    </div>
  );
};
