import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  Tag, 
  CheckCircle2, 
  Truck, 
  ShieldCheck,
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLocation } from '../context/LocationContext';

interface CartPageProps {
  onNavigate: (route: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onNavigate }) => {
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
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon
  } = useCart();

  const { isServiceable, estimatedDeliveryMinutes, selectedArea } = useLocation();
  const [couponInput, setCouponInput] = useState('');

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponInput.trim()) {
      applyCoupon(couponInput.trim());
      setCouponInput('');
    }
  };

  const freeDeliveryPercent = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-28 text-center space-y-5">
        <div className="w-20 h-20 rounded-full bg-berry/10 border border-berry/20 flex items-center justify-center text-berry mx-auto shadow-subtle">
          <ShoppingBag className="w-9 h-9 stroke-[1.5]" />
        </div>
        <h1 className="font-editorial text-4xl sm:text-5xl text-charcoal">Your Shopping Bag is Empty</h1>
        <p className="text-xs sm:text-sm text-muted max-w-sm mx-auto font-sans">
          Discover bioactive cleansers, cold-pack ceramides, and peptide lip glazes ready for 15-minute dispatch.
        </p>
        <button
          onClick={() => onNavigate('/shop')}
          className="dew-btn-berry text-xs !px-8 !py-3.5 mt-2 uppercase tracking-widest font-black"
        >
          Explore Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header Matching Reference Image */}
      <div className="border-b border-[#F0EAE8] pb-4 flex items-baseline justify-between">
        <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-charcoal">
          Your Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
        </h1>
        <button
          onClick={() => onNavigate('/shop')}
          className="text-xs font-semibold text-burgundy hover:underline hidden sm:block"
        >
          Continue Shopping →
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left: Cart Items List */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* Free Shipping Tracker */}
          <div className="p-5 rounded-3xl bg-[#FAF7F4] border border-[#EFE7E1] shadow-subtle">
            {amountNeededForFreeDelivery > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-charcoal font-semibold">
                  <span className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-berry" />
                    <span>Add <strong className="font-extrabold text-berry">₹{amountNeededForFreeDelivery}</strong> more for complimentary delivery</span>
                  </span>
                  <span className="text-berry font-extrabold">{freeDeliveryPercent}%</span>
                </div>
                <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                  <div className="h-full bg-berry rounded-full transition-all duration-500" style={{ width: `${freeDeliveryPercent}%` }} />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>You unlocked complimentary {isServiceable ? `${estimatedDeliveryMinutes}-minute` : ''} climate-controlled delivery to {selectedArea}!</span>
              </div>
            )}
          </div>

          {/* Items Container */}
          <div className="space-y-3.5">
            {items.map((item) => (
              <div
                key={item.variantId}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-3xl border border-[#EFE7E1] bg-white shadow-card gap-5 transition-all hover:shadow-3d-float"
              >
                <div className="flex items-center gap-5 min-w-0">
                  <div className="w-20 h-20 rounded-2xl bg-[#FAF7F4] border border-[#EFE7E1] p-2 flex items-center justify-center shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-black text-berry uppercase tracking-widest block">
                      {item.brand}
                    </span>
                    <h3 className="font-heading font-extrabold text-sm text-charcoal truncate">
                      {item.name}
                    </h3>
                    <span className="text-xs text-muted block mt-0.5">
                      {item.variantName} • SKU: {item.sku}
                    </span>
                    <div className="flex items-baseline gap-2 mt-1 sm:hidden">
                      <span className="text-sm font-black text-charcoal">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto sm:gap-6 shrink-0">
                  {/* Stepper */}
                  <div className="flex items-center rounded-xl border border-[#EFE7E1] bg-[#FAF7F4] p-0.5 shadow-subtle">
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white text-charcoal transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-black text-charcoal">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      disabled={item.quantity >= item.availableStock}
                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white text-charcoal disabled:opacity-30 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="hidden sm:block text-right">
                    <span className="text-base font-black text-charcoal block">
                      ₹{item.price * item.quantity}
                    </span>
                    {item.originalPrice && item.originalPrice > item.price && (
                      <span className="text-xs text-muted line-through">
                        ₹{item.originalPrice * item.quantity}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => removeFromCart(item.variantId)}
                    className="p-2 text-muted hover:text-sale rounded-lg hover:bg-rose/10 transition-colors"
                    title="Remove formulation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Right: Bill Summary & Checkout */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Coupon Code Block */}
          <div className="p-6 rounded-3xl border border-[#EFE7E1] bg-white shadow-card space-y-3">
            <h3 className="font-heading font-extrabold text-xs uppercase tracking-widest text-charcoal">
              Redeem Beauty Voucher
            </h3>
            {appliedCoupon ? (
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-700" />
                  <div>
                    <span className="font-extrabold text-charcoal uppercase">{appliedCoupon.code}</span>
                    <span className="text-[11px] text-emerald-700 font-bold block">₹{discount} promotional savings applied</span>
                  </div>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs font-bold text-sale hover:underline"
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
                  placeholder="DEWGLOW20"
                  className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-[#EFE7E1] uppercase placeholder:normal-case focus:outline-none focus:border-berry bg-[#FAF7F4]"
                />
                <button
                  type="submit"
                  className="dew-btn-berry text-xs !px-4 !py-2.5 font-bold"
                >
                  Apply
                </button>
              </form>
            )}
            {couponError && (
              <p className="text-[11px] text-sale flex items-center gap-1 font-semibold">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{couponError}</span>
              </p>
            )}
          </div>

          {/* Price Breakdown */}
          {/* Order Summary (Matching Reference Image) */}
          <div className="p-6 rounded-2xl border border-[#F0EAE8] bg-white shadow-2xs space-y-4">
            <h3 className="font-heading font-bold text-sm text-charcoal border-b border-[#F0EAE8] pb-3">
              Order Summary
            </h3>

            <div className="space-y-2.5 text-xs text-charcoal/80">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-charcoal">₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-semibold text-emerald-700">
                  {deliveryFee === 0 ? 'Free (Gokulam)' : `₹${deliveryFee}`}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-burgundy font-semibold">
                  <span>Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-charcoal pt-3 border-t border-[#F0EAE8]">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('/checkout')}
              className="w-full py-3 px-4 rounded-lg bg-burgundy hover:bg-burgundy-dark text-white text-xs font-bold transition-all shadow-sm active:scale-98"
            >
              Proceed to Checkout
            </button>

            {/* Free Delivery Pill Badge */}
            <div className="p-3 rounded-lg bg-[#E8F7EE] text-xs text-[#137333] flex items-center gap-2">
              <span>🚚</span>
              <span className="text-[11px] font-medium leading-tight">
                You are eligible for free delivery in Gokulam, Mysuru
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
