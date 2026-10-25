import React, { useState } from 'react';
import { Tag, Copy, Check, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { store } from '../lib/store';
import { usePublishedProducts } from '../lib/useStore';
import { ProductCard } from '../components/common/ProductCard';

interface OffersPageProps {
  onNavigate: (route: string) => void;
}

export const OffersPage: React.FC<OffersPageProps> = ({ onNavigate }) => {
  const coupons = store.getCoupons();
  const allProducts = usePublishedProducts();
  const discountedProducts = allProducts.filter(p => (p.defaultDiscount || 0) >= 10);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Luxury Editorial Campaign Hero */}
      <div className="relative rounded-3xl overflow-hidden bg-[#29242A] text-white min-h-[300px] flex items-center border border-white/10 shadow-3d-float">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1600&q=80"
            alt="Beauty Shelf Luxury Edit"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#29242A] via-[#29242A]/85 to-transparent" />
        </div>

        <div className="relative z-10 p-8 sm:p-14 max-w-2xl space-y-4 text-left">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-champagne-300 block">
            Special Value & Curated Privileges
          </span>
          <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight">
            Your beauty shelf deserves an upgrade.
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans max-w-lg">
            Explore authentic formulations, direct brand promotions, and verified vouchers. Every product stored in cold conditions and dispatched in 15 minutes.
          </p>
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => onNavigate('/shop')}
              className="dew-btn-berry !px-7 !py-3.5 text-xs font-black tracking-widest uppercase shadow-subtle"
            >
              Shop All Offers
            </button>
          </div>
        </div>
      </div>

      {/* Verified Promo Codes Section */}
      <section className="space-y-6">
        <div className="border-b border-[#EFE7E1] pb-4">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-berry">
            Verified Store Codes
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl text-charcoal mt-0.5">
            Active Community Vouchers
          </h2>
          <p className="text-xs text-muted font-sans mt-1">
            Apply these genuine coupons at checkout to unlock direct cart reductions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {coupons.map((coupon) => (
            <div
              key={coupon.code}
              className="p-6 rounded-3xl border border-[#EFE7E1] bg-white shadow-card flex flex-col justify-between space-y-4 hover:shadow-3d-float transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-berry bg-berry/10 px-2.5 py-1 rounded-full border border-berry/15">
                    {coupon.discountType === 'percentage' ? `${coupon.discountValue}% SAVINGS` : `₹${coupon.discountValue} OFF`}
                  </span>
                  <Tag className="w-4 h-4 text-berry" />
                </div>
                <h3 className="font-mono text-xl font-black text-charcoal tracking-wide pt-1">
                  {coupon.code}
                </h3>
                <p className="text-xs text-muted leading-relaxed font-sans">
                  {coupon.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#EFE7E1] flex items-center justify-between">
                <span className="text-[10px] text-muted font-semibold">
                  Min. Order: ₹{coupon.minOrderValue}
                </span>
                <button
                  onClick={() => handleCopy(coupon.code)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#EFE7E1] hover:border-berry text-xs font-bold text-charcoal transition-all bg-[#FAF7F4]"
                >
                  {copiedCode === coupon.code ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-extrabold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Discounted Formulations Showcase */}
      {discountedProducts.length > 0 && (
        <section className="space-y-6 pt-4">
          <div className="border-b border-[#EFE7E1] pb-4 flex items-baseline justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-berry">
                Instant Value
              </span>
              <h2 className="font-editorial text-3xl sm:text-4xl text-charcoal mt-0.5">
                Special Value Formulations
              </h2>
            </div>
            <button onClick={() => onNavigate('/shop')} className="text-xs font-bold text-berry hover:underline">
              View All Formulations →
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {discountedProducts.slice(0, 8).map(prod => (
              <ProductCard key={prod.id} product={prod} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
