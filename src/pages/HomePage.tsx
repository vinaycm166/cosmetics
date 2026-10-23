import React from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  RotateCcw, 
  CreditCard, 
  Zap, 
  Bike, 
  Check, 
  Percent,
  Sparkles
} from 'lucide-react';
import { ProductCard } from '../components/common/ProductCard';
import { store } from '../lib/store';
import { useLocation } from '../context/LocationContext';

interface HomePageProps {
  onNavigate: (route: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { selectedArea, openLocationModal } = useLocation();
  const allProducts = store.getPublishedProducts();

  // The 5 flagship bestsellers matching reference image
  const flagshipBestsellers = [
    allProducts.find(p => p.id === 'prod-cerave-hydrating') || allProducts[0],
    allProducts.find(p => p.id === 'prod-minimalist-nia') || allProducts[1],
    allProducts.find(p => p.id === 'prod-loreal-revitalift') || allProducts[2],
    allProducts.find(p => p.id === 'prod-maybelline-skyhigh') || allProducts[3],
    allProducts.find(p => p.id === 'prod-ordinary-ha') || allProducts[4],
  ].filter(Boolean);

  // 8 Circular Categories matching reference image
  const categoryCircles = [
    {
      name: 'Skincare',
      route: '/category/skincare',
      image: 'https://images.unsplash.com/photo-1556228722-d0b5de731748?auto=format&fit=crop&w=200&q=80',
    },
    {
      name: 'Makeup',
      route: '/category/makeup',
      image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=200&q=80',
    },
    {
      name: 'Haircare',
      route: '/category/haircare',
      image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=200&q=80',
    },
    {
      name: 'Fragrance',
      route: '/category/fragrance',
      image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=200&q=80',
    },
    {
      name: 'Bath & Body',
      route: '/category/bath-body',
      image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=200&q=80',
    },
    {
      name: 'Beauty Tools',
      route: '/category/beauty-tools',
      image: 'https://images.unsplash.com/photo-1608248597359-00a4025a4980?auto=format&fit=crop&w=200&q=80',
    },
    {
      name: 'New Arrivals',
      route: '/shop',
      image: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&w=200&q=80',
    },
    {
      name: 'Offers',
      route: '/offers',
      isOfferBadge: true,
    },
  ];

  return (
    <div className="space-y-12 sm:space-y-16 pb-20 overflow-x-hidden bg-[#FCFAF9]">
      
      {/* ========================================================
          1. HERO SECTION (MATCHING REFERENCE IMAGE)
      ======================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#FAF5F2] via-[#FDF7F5] to-[#F5ECE8] border-b border-[#F0EAE8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Editorial Headline & Actions */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <h1 className="font-editorial text-5xl sm:text-6xl lg:text-7xl font-bold text-charcoal leading-[1.04] tracking-tight">
                Glow <br />
                Confidently <br />
                Everyday
              </h1>
              
              <p className="text-sm sm:text-base text-charcoal/75 max-w-md font-sans leading-relaxed">
                Authentic beauty products at your doorstep in Gokulam, Mysuru.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                <button
                  onClick={() => onNavigate('/shop')}
                  className="px-7 py-3 rounded-full bg-burgundy hover:bg-burgundy-dark text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 group active:scale-95"
                >
                  <span>Shop Now</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
                <button
                  onClick={() => onNavigate('/shop')}
                  className="px-6 py-3 rounded-full bg-white hover:bg-[#FAF8F6] text-charcoal border border-[#EFE7E1] text-xs font-bold transition-colors shadow-2xs"
                >
                  Explore Categories
                </button>
              </div>

              {/* 4 Horizontal Trust Seals */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-[#EFE7E1]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white border border-[#F0EAE8] flex items-center justify-center text-burgundy shadow-2xs shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div className="leading-tight">
                    <span className="font-bold text-charcoal text-[11px] block">Fast Delivery</span>
                    <span className="text-[10px] text-muted">in Gokulam, Mysuru</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white border border-[#F0EAE8] flex items-center justify-center text-burgundy shadow-2xs shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="leading-tight">
                    <span className="font-bold text-charcoal text-[11px] block">100% Authentic</span>
                    <span className="text-[10px] text-muted">Products</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white border border-[#F0EAE8] flex items-center justify-center text-burgundy shadow-2xs shrink-0">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <div className="leading-tight">
                    <span className="font-bold text-charcoal text-[11px] block">Easy Returns</span>
                    <span className="text-[10px] text-muted">& Support</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white border border-[#F0EAE8] flex items-center justify-center text-burgundy shadow-2xs shrink-0">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div className="leading-tight">
                    <span className="font-bold text-charcoal text-[11px] block">Secure Payments</span>
                    <span className="text-[10px] text-muted">Razorpay Protected</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Authentic Cosmetics Flatlay (Estée Lauder, Laneige, Clinique) */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              <div className="relative w-full max-w-[520px] aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-[#FFF5F2] to-[#FBECE6] border border-[#F0EAE8] shadow-card p-4 flex items-center justify-center">
                
                {/* Genuine Product Composition Banner */}
                <img
                  src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1000&q=85"
                  alt="Dew & Go Premium Cosmetics - Estée Lauder, Laneige, Clinique"
                  className="w-full h-full object-cover rounded-xl"
                />

                {/* Subtle Decorative Floral Accent */}
                <div className="absolute -bottom-4 -right-4 w-28 h-28 bg-rose-100/60 rounded-full blur-2xl pointer-events-none" />
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* ========================================================
          2. 8 CIRCULAR CATEGORY NAVIGATION (MATCHING IMAGE)
      ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-4 sm:gap-6 text-center">
          {categoryCircles.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => onNavigate(cat.route)}
              className="flex flex-col items-center gap-2 group cursor-pointer focus:outline-none"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#FCEFEB] border border-[#F5E0D8] p-1.5 flex items-center justify-center shadow-2xs group-hover:scale-105 group-hover:border-burgundy/40 transition-all duration-200 overflow-hidden">
                {cat.isOfferBadge ? (
                  <div className="w-full h-full rounded-full bg-[#E57A82] flex items-center justify-center text-white">
                    <span className="font-editorial text-2xl font-bold">%</span>
                  </div>
                ) : (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                )}
              </div>
              <span className="text-xs font-semibold text-charcoal group-hover:text-burgundy transition-colors">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>


      {/* ========================================================
          3. BESTSELLERS SECTION (5 COLUMNS MATCHING IMAGE)
      ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-[#F0EAE8]">
          <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-charcoal tracking-tight">
            Bestsellers
          </h2>
          <button
            onClick={() => onNavigate('/shop')}
            className="text-xs font-bold text-burgundy hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <span>→</span>
          </button>
        </div>

        {/* 5-Column Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {flagshipBestsellers.map(product => (
            <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
          ))}
        </div>
      </section>


      {/* ========================================================
          4. DUAL EDITORIAL PROMOTIONAL BANNERS (MATCHING IMAGE)
      ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Left Banner: Skincare Essentials */}
          <div className="relative rounded-2xl overflow-hidden bg-[#EAEFEA] border border-[#E0E7E0] p-8 sm:p-10 flex flex-col justify-between min-h-[220px] shadow-subtle group">
            <div className="relative z-10 max-w-sm space-y-3">
              <h3 className="font-editorial text-3xl sm:text-4xl text-charcoal font-bold leading-tight">
                Skincare Essentials <br />
                for Healthy, Radiant Skin
              </h3>
              <div className="pt-2">
                <button
                  onClick={() => onNavigate('/category/skincare')}
                  className="px-5 py-2.5 rounded-lg bg-burgundy hover:bg-burgundy-dark text-white text-xs font-bold transition-all shadow-sm inline-flex items-center gap-1.5"
                >
                  <span>Shop Skincare</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            {/* Botanical Packshot Photography */}
            <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-90 pointer-events-none overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1556228722-d0b5de731748?auto=format&fit=crop&w=600&q=80"
                alt="Skincare Essentials"
                className="w-full h-full object-cover object-left group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          {/* Right Banner: Same-Day Delivery in Gokulam, Mysuru */}
          <div className="relative rounded-2xl overflow-hidden bg-burgundy text-white p-8 sm:p-10 flex flex-col justify-between min-h-[220px] shadow-card group">
            
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white">
                  <Bike className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-editorial text-2xl sm:text-3xl font-bold leading-snug">
                    Same-Day Delivery in Gokulam, Mysuru
                  </h3>
                </div>
              </div>

              {/* 3 Checkmarks */}
              <div className="space-y-2 text-xs font-medium text-white/90 pt-1">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-rose-300 stroke-[3]" />
                  <span>Authentic Products</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-rose-300 stroke-[3]" />
                  <span>Carefully Packed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-rose-300 stroke-[3]" />
                  <span>Fast & Reliable</span>
                </div>
              </div>
            </div>

            {/* Mysuru Palace Watermark / Architectural Graphic */}
            <div className="absolute right-3 bottom-0 opacity-15 pointer-events-none select-none">
              <svg className="w-48 h-32 fill-white" viewBox="0 0 100 60">
                <path d="M10 50 L15 30 L20 30 L25 20 L30 30 L35 30 L40 50 Z M45 50 L48 25 L52 10 L56 25 L60 50 Z M65 50 L70 30 L75 30 L80 20 L85 30 L90 50 Z" />
                <rect x="5" y="50" width="90" height="8" rx="2" />
              </svg>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
};
