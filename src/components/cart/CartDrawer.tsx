import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Tag, 
  CheckCircle2, 
  AlertCircle,
  Truck
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useLocation } from '../../context/LocationContext';

interface CartDrawerProps {
  onNavigate: (route: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onNavigate }) => {
  const {
    items,
    itemCount,
    subtotal,
    deliveryFee,
    discount,
    tax,
    total,
    freeDeliveryThreshold,
    amountNeededForFreeDelivery,
    appliedCoupon,
    couponError,
    isCartDrawerOpen,
    closeCartDrawer,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon
  } = useCart();

  const { isServiceable, estimatedDeliveryMinutes } = useLocation();
  const [couponInput, setCouponInput] = useState('');

  if (!isCartDrawerOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponInput.trim()) {
      applyCoupon(couponInput.trim());
      setCouponInput('');
    }
  };

  const handleProceedToCheckout = () => {
    closeCartDrawer();
    onNavigate('/checkout');
  };

  const freeDeliveryPercent = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={closeCartDrawer} 
        className="absolute inset-0 bg-[#292323]/50 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-200"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-8">
        <div className="w-screen max-w-md bg-white border-l border-neutral-border shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          
          {/* Drawer Header */}
          <div className="px-5 py-4 border-b border-neutral-border flex items-center justify-between bg-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-brand-50 border border-brand-100 text-brand-600 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-base text-charcoal-900 leading-tight">Shopping Bag</h2>
                <span className="text-xs text-muted font-medium">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>
            <button
              onClick={closeCartDrawer}
              className="p-1.5 rounded-md hover:bg-neutral-100 text-muted hover:text-charcoal-900 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Hyperlocal Free Delivery Progress Banner */}
          <div className="px-5 py-3 bg-[#FAF7F4] border-b border-neutral-border">
            {amountNeededForFreeDelivery > 0 ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-charcoal-900">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                    <span>Add <strong className="font-semibold text-charcoal-900">₹{amountNeededForFreeDelivery}</strong> more for free delivery</span>
                  </span>
                  <span className="text-[11px] font-semibold text-brand-600">{freeDeliveryPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-500 rounded-full transition-all duration-300"
                    style={{ width: `${freeDeliveryPercent}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-semibold text-mint-500">
                <CheckCircle2 className="w-4 h-4 text-mint-500 shrink-0" />
                <span>You unlocked free {isServiceable ? `${estimatedDeliveryMinutes}-min` : ''} delivery!</span>
              </div>
            )}
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-14 h-14 rounded-full bg-neutral-100 border border-neutral-border flex items-center justify-center text-muted">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-charcoal-900">Your bag is empty</h3>
                  <p className="text-xs text-muted mt-1 max-w-xs">
                    Explore our curated skincare, makeup, and beauty bestsellers.
                  </p>
                </div>
                <button
                  onClick={() => { closeCartDrawer(); onNavigate('/shop'); }}
                  className="dew-btn-primary text-xs mt-2"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div 
                  key={item.variantId} 
                  className="flex gap-3.5 p-3 rounded-md border border-neutral-border bg-white hover:border-neutral-300 transition-colors"
                >
                  {/* Real packshot thumbnail with light neutral background */}
                  <div className="w-16 h-16 rounded-md bg-[#FAF7F4] border border-neutral-border/60 p-1 flex items-center justify-center shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0 pr-1">
                          <span className="text-[10px] font-semibold tracking-wider text-muted uppercase block truncate">
                            {item.brand}
                          </span>
                          <h4 className="font-heading font-semibold text-xs text-charcoal-900 truncate">
                            {item.name}
                          </h4>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.variantId)}
                          className="text-muted hover:text-sale p-1 transition-colors shrink-0"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="text-[11px] text-muted block mt-0.5">
                        {item.variantName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-100">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs font-bold text-charcoal-900">
                          ₹{item.price * item.quantity}
                        </span>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span className="text-[10px] text-muted line-through">
                            ₹{item.originalPrice * item.quantity}
                          </span>
                        )}
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center rounded-md border border-neutral-border bg-neutral-50 p-0.5">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="w-5 h-5 rounded flex items-center justify-center text-charcoal-900 hover:bg-white transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-semibold text-charcoal-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          disabled={item.quantity >= item.availableStock}
                          className="w-5 h-5 rounded flex items-center justify-center text-charcoal-900 hover:bg-white disabled:opacity-30 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer with Bill Details & Checkout */}
          {items.length > 0 && (
            <div className="p-5 border-t border-neutral-border bg-white space-y-3.5">
              
              {/* Promo Code Box */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 rounded-md bg-mint-50 border border-mint-200 text-xs">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-mint-500 shrink-0" />
                      <div>
                        <span className="font-bold text-charcoal-900 uppercase">{appliedCoupon.code}</span>
                        <span className="text-[11px] text-mint-500 font-semibold block">Saved ₹{discount}</span>
                      </div>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs font-semibold text-sale hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Coupon code (e.g. DEWGLOW20)"
                      className="flex-1 px-3 py-1.5 text-xs rounded-md border border-neutral-border uppercase placeholder:normal-case focus:outline-none focus:border-brand-500 bg-white"
                    />
                    <button
                      type="submit"
                      className="dew-btn-secondary text-xs !px-3.5 !py-1.5 font-semibold"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponError && (
                  <p className="mt-1.5 text-[11px] text-sale flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{couponError}</span>
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-muted pt-2 border-t border-neutral-100">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-charcoal-900">₹{subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-brand-600 font-medium">
                    <span>Discount</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className="font-semibold text-charcoal-900">
                    {deliveryFee === 0 ? <span className="text-mint-500 font-bold">FREE</span> : `₹${deliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes (5% GST)</span>
                  <span className="font-semibold text-charcoal-900">₹{tax}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-charcoal-900 pt-2 border-t border-neutral-border">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>

              {/* Checkout CTA Button */}
              <button
                onClick={handleProceedToCheckout}
                className="w-full dew-btn-primary !py-3 text-xs font-bold flex items-center justify-between group"
              >
                <span>Proceed to Checkout</span>
                <span className="flex items-center gap-1">
                  <span>₹{total}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
