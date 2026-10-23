import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  Star, 
  ChevronRight,
  ChevronLeft,
  Check,
  Flame,
  Zap,
  ShoppingBag,
  Award,
  Layers,
  Droplets,
  Sun
} from 'lucide-react';
import { ProductCard } from '../components/common/ProductCard';
import { ThreeHeroCosmeticsScene } from '../components/3d/ThreeHeroCosmeticsScene';
import { store } from '../lib/store';
import { useLocation } from '../context/LocationContext';
import { useCart } from '../context/CartContext';
import { Product } from '../types';

interface HomePageProps {
  onNavigate: (route: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { isServiceable, estimatedDeliveryMinutes, selectedArea, openLocationModal } = useLocation();
  const { addToCart } = useCart();

  const allProducts = store.getPublishedProducts();
  const categories = store.getCategories();

  // Curated collections from real catalog
  const bestsellers = allProducts.filter(p => p.isBestseller);
  const trendingProducts = allProducts.filter(p => p.isTrending || p.isBestseller);
  const newArrivals = allProducts.filter(p => p.isNewArrival);

  // Active Category Filter for Bestsellers Section
  const [bestsellerCategory, setBestsellerCategory] = useState<string>('all');

  // Filtered bestsellers based on tab
  const displayedBestsellers = bestsellers.filter(p => {
    if (bestsellerCategory === 'all') return true;
    return p.category.toLowerCase().includes(bestsellerCategory.toLowerCase());
  }).slice(0, 8);

  // Hero Routine Preset Switcher State
  const [heroRoutine, setHeroRoutine] = useState<number>(0);
  const heroRoutines = [
    {
      title: 'The Barrier Recovery Edit',
      subtitle: '5 Biomimetic Ceramides, Oat Beta-Glucan & Peptides to rebuild stressed skin barrier in 24 hours.',
      badge: 'Clinically Proven Actives',
      tag: 'Morning & Night Protocol',
      route: '/category/skincare',
      accent: '#721C46'
    },
    {
      title: 'The High-Shine Peptide Glaze',
      subtitle: 'Effortless liquid color tints and cushioning lip oils infused with botanical antioxidants for all-day luminous skin.',
      badge: 'Clean & Cruelty-Free',
      tag: 'Glass Skin Signature',
      route: '/category/makeup',
      accent: '#E84F87'
    },
    {
      title: 'Cellular Radiance Lift',
      subtitle: 'Pure 10% Niacinamide + Zinc PCA with weightless Hyaluronic matrix for pore refining and deep glow.',
      badge: 'Cold-Dispatched Potency',
      tag: 'Active Skin Defense',
      route: '/category/skincare',
      accent: '#D4AF37'
    }
  ];

  // Routine Step Builder State (Cleanse -> Treat -> Hydrate -> Protect)
  const [activeRoutineStep, setActiveRoutineStep] = useState<number>(0);
  const routineSteps = [
    {
      step: '01',
      name: 'Cleanse & Reset',
      desc: 'Gentle amino-acid foaming gel that cleanses impurities without stripping the protective moisture barrier.',
      categoryMatch: 'Cleansers',
      heroProd: allProducts.find(p => p.category.toLowerCase().includes('cleanse')) || allProducts[0]
    },
    {
      step: '02',
      name: 'Targeted Serum',
      desc: 'Concentrated 10% Niacinamide + 1% Zinc to normalize sebum production and brighten stubborn hyperpigmentation.',
      categoryMatch: 'Serums',
      heroProd: allProducts.find(p => p.category.toLowerCase().includes('serum')) || allProducts[1] || allProducts[0]
    },
    {
      step: '03',
      name: 'Ceramide Seal',
      desc: 'Deep lipid infusion with 5 essential ceramides and plant squalane to lock in hydration for up to 48 hours.',
      categoryMatch: 'Moisturizers',
      heroProd: allProducts.find(p => p.category.toLowerCase().includes('cream') || p.category.toLowerCase().includes('moistur')) || allProducts[2] || allProducts[0]
    },
    {
      step: '04',
      name: 'Aqueous UV Shield',
      desc: 'Broad spectrum PA++++ SPF 50 fluid with ultra-light texture, zero white cast and sweat resistance.',
      categoryMatch: 'Sunscreen',
      heroProd: allProducts.find(p => p.category.toLowerCase().includes('sun')) || allProducts[3] || allProducts[0]
    }
  ];

  // Trending Horizontal Scroll Ref
  const trendingScrollRef = useRef<HTMLDivElement>(null);

  const scrollTrending = (direction: 'left' | 'right') => {
    if (trendingScrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      trendingScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Step Add to Cart feedback
  const [stepAdded, setStepAdded] = useState(false);
  const handleAddStepProduct = (prod: Product) => {
    const variant = prod.variants.find(v => v.isDefault) || prod.variants[0];
    const res = addToCart(prod, variant, 1);
    if (res.success) {
      setStepAdded(true);
      setTimeout(() => setStepAdded(false), 1600);
    }
  };

  return (
    <div className="space-y-20 sm:space-y-32 pb-24 overflow-x-hidden">
      
      {/* ========================================================
          1. CINEMATIC 3D HERO SECTION (LUXURY EDITORIAL)
      ======================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FCFAF7] via-[#FFF9F4] to-white border-b border-[#EFE7E1] pt-4 lg:pt-8">
        
        {/* Ambient atmospheric luxury glow */}
        <div className="absolute top-12 left-1/4 w-[600px] h-[600px] rounded-full bg-blush/80 blur-[130px] pointer-events-none" />
        <div className="absolute top-48 right-10 w-[500px] h-[500px] rounded-full bg-champagne-100/50 blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            
            {/* Left: High-Fashion Editorial Typography & CTAs */}
            <div className="lg:col-span-6 space-y-6 text-left">
              
              {/* Delivery Serviceability Pill */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-pill text-xs text-charcoal shadow-subtle">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-extrabold text-berry tracking-wider uppercase text-[10px]">
                  {isServiceable ? `15-Min Delivery • ~${estimatedDeliveryMinutes} mins:` : 'Express Dispatch:'}
                </span>
                <button
                  onClick={openLocationModal}
                  className="text-rose font-bold hover:underline flex items-center gap-0.5"
                >
                  <span>{selectedArea}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Editorial Headline */}
              <div className="space-y-3">
                <span className="text-[11px] font-black uppercase tracking-[0.25em] text-berry/80 block">
                  Haute Skincare & Cosmetics • Cold-Chain Express
                </span>
                <h1 className="font-editorial text-5xl sm:text-6xl lg:text-7xl text-charcoal leading-[1.02] tracking-tight">
                  The Architecture of <br />
                  <span className="font-editorial-italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-berry via-rose to-champagne-500">
                    Luminous Skin.
                  </span>
                </h1>
                <p className="text-sm sm:text-base text-charcoal/70 max-w-lg leading-relaxed font-sans font-normal pt-1">
                  Active biomimetic ceramides, pure botanical elixirs, and dermatologically verified cosmetics. Formulated for high efficacy and delivered fresh to your door in 15 minutes.
                </p>
              </div>

              {/* Routine Preset Pills */}
              <div className="space-y-2 pt-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted block">
                  Explore Curated Protocols:
                </span>
                <div className="flex flex-wrap gap-2">
                  {heroRoutines.map((routine, idx) => (
                    <button
                      key={idx}
                      onClick={() => setHeroRoutine(idx)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        heroRoutine === idx
                          ? 'border-berry bg-berry text-white shadow-subtle font-bold'
                          : 'glass-pill text-charcoal/80 hover:border-berry/40'
                      }`}
                    >
                      {routine.title.split(' ')[1] || routine.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-3">
                <button
                  onClick={() => onNavigate(heroRoutines[heroRoutine].route)}
                  className="dew-btn-berry !px-8 !py-4 text-xs tracking-widest uppercase font-black shadow-3d-float hover:scale-102 transition-transform flex items-center gap-2 group"
                >
                  <span>Shop Routine</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => onNavigate('/shop')}
                  className="glass-pill hover:bg-white text-charcoal !px-7 !py-4 rounded-xl text-xs tracking-widest uppercase font-bold border border-[#EFE7E1] shadow-subtle hover:border-berry transition-all"
                >
                  Explore Catalog
                </button>
              </div>

              {/* Three Editorial Trust Seals */}
              <div className="pt-6 border-t border-[#EFE7E1] grid grid-cols-3 gap-4 text-xs text-muted">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-berry shrink-0 stroke-[1.5]" />
                  <div>
                    <span className="font-bold text-charcoal text-[11px] block">100% Verified</span>
                    <span className="text-[10px] text-muted">Authentic Formulations</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-5 h-5 text-berry shrink-0 stroke-[1.5]" />
                  <div>
                    <span className="font-bold text-charcoal text-[11px] block">15-Min Arrival</span>
                    <span className="text-[10px] text-muted">Cold-Chain Dispatch</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Star className="w-5 h-5 text-champagne-500 fill-champagne-500 shrink-0" />
                  <div>
                    <span className="font-bold text-charcoal text-[11px] block">4.9/5 Rating</span>
                    <span className="text-[10px] text-muted">Over 12,000 Routines</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right: Three.js Interactive 3D Cosmetic Scene */}
            <div className="lg:col-span-6 relative">
              <div className="relative aspect-square max-w-[560px] mx-auto rounded-3xl overflow-hidden glass-pill border border-[#EFE7E1] shadow-3d-float p-2">
                
                {/* 3D WebGL Canvas */}
                <ThreeHeroCosmeticsScene className="w-full h-full rounded-2xl" />

                {/* Floating Routine Information Card */}
                <div className="absolute top-6 left-6 max-w-[280px] glass-pill p-3.5 rounded-2xl shadow-subtle border border-white/80 pointer-events-none select-none">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-rose animate-ping" />
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-berry">
                      {heroRoutines[heroRoutine].tag}
                    </span>
                  </div>
                  <h4 className="font-heading font-extrabold text-xs text-charcoal">
                    {heroRoutines[heroRoutine].title}
                  </h4>
                  <p className="text-[10px] text-muted mt-1 line-clamp-2 leading-relaxed">
                    {heroRoutines[heroRoutine].subtitle}
                  </p>
                </div>

                {/* Floating Rating Pill */}
                <div className="absolute bottom-6 left-6 glass-pill-dark px-3.5 py-2 rounded-xl border border-white/10 shadow-lg text-white pointer-events-none select-none flex items-center gap-2.5">
                  <div className="flex items-center gap-0.5 text-champagne-300">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-champagne-300" />
                    ))}
                  </div>
                  <span className="text-[11px] font-bold">Cold Pack Fresh</span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>


      {/* ========================================================
          2. INFINITE LUXURY EDITORIAL MARQUEE
      ======================================================== */}
      <div className="bg-[#29242A] py-3.5 overflow-hidden text-white border-y border-white/10 -mt-20 sm:-mt-32 relative z-20">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-8 text-xs uppercase tracking-[0.25em] font-bold">
          <span>• CLINICALLY PROVEN ACTIVES</span>
          <span className="text-champagne-400">★ COLD-CHAIN DISPATCHED IN 15 MINS</span>
          <span>• 100% DERMATOLOGICALLY VERIFIED</span>
          <span className="text-rose">★ ZERO CRUELTY • PURE BOTANICAL FORMULATIONS</span>
          <span>• INDIRANAGAR & KORAMANGALA EXPRESS HUBS</span>
          <span className="text-champagne-400">★ 5 BIOMIMETIC CERAMIDES</span>
          <span>• HYPERLOCAL FRESH PACKAGING</span>
          <span className="text-rose">★ HAUTE QUICK-COMMERCE</span>
          <span>• CLINICALLY PROVEN ACTIVES</span>
          <span className="text-champagne-400">★ COLD-CHAIN DISPATCHED IN 15 MINS</span>
          <span>• 100% DERMATOLOGICALLY VERIFIED</span>
        </div>
      </div>


      {/* ========================================================
          3. 4-STEP SKINCARE ARCHITECTURE ROUTINE BUILDER
      ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-berry">
            The Methodical Ritual
          </span>
          <h2 className="font-editorial text-4xl sm:text-5xl text-charcoal tracking-tight">
            The 4-Step Daily Routine
          </h2>
          <p className="text-xs sm:text-sm text-muted font-sans leading-relaxed">
            Every step formulated to layer seamlessly without pilling or heavy residue. Click any phase to inspect the formulation.
          </p>
        </div>

        {/* Step Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {routineSteps.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setActiveRoutineStep(idx)}
              className={`p-4 rounded-2xl text-left border transition-all duration-300 ${
                activeRoutineStep === idx
                  ? 'border-berry bg-white shadow-3d-float -translate-y-1'
                  : 'glass-pill border-[#EFE7E1] hover:border-berry/40 text-charcoal/70'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-black font-mono ${activeRoutineStep === idx ? 'text-berry' : 'text-muted'}`}>
                  STEP {s.step}
                </span>
                <span className={`w-2 h-2 rounded-full ${activeRoutineStep === idx ? 'bg-berry' : 'bg-transparent'}`} />
              </div>
              <h4 className="font-heading font-extrabold text-sm text-charcoal">
                {s.name}
              </h4>
              <p className="text-[11px] text-muted mt-1 line-clamp-2">
                {s.desc}
              </p>
            </button>
          ))}
        </div>

        {/* Highlighted Step Feature Banner */}
        {routineSteps[activeRoutineStep].heroProd && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#EFE7E1] shadow-card grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-5 aspect-square max-w-sm mx-auto bg-[#FAF7F4] rounded-2xl p-6 flex items-center justify-center border border-[#EFE7E1]">
              <img
                src={routineSteps[activeRoutineStep].heroProd.images[0] || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80'}
                alt={routineSteps[activeRoutineStep].heroProd.name}
                className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
              />
            </div>

            <div className="md:col-span-7 space-y-4 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-berry/5 text-berry text-[10px] font-extrabold uppercase tracking-widest border border-berry/15">
                <span>Phase {routineSteps[activeRoutineStep].step} Spotlight</span>
                <span>•</span>
                <span>{routineSteps[activeRoutineStep].categoryMatch}</span>
              </div>

              <h3 className="font-editorial text-3xl sm:text-4xl text-charcoal">
                {routineSteps[activeRoutineStep].heroProd.name}
              </h3>

              <p className="text-xs sm:text-sm text-muted leading-relaxed font-sans max-w-xl">
                {routineSteps[activeRoutineStep].heroProd.shortDescription || routineSteps[activeRoutineStep].heroProd.description}
              </p>

              <div className="flex items-baseline gap-3 pt-2">
                <span className="text-2xl font-black text-charcoal">
                  ₹{routineSteps[activeRoutineStep].heroProd.defaultPrice}
                </span>
                {routineSteps[activeRoutineStep].heroProd.defaultOriginalPrice && (
                  <span className="text-sm text-muted line-through font-medium">
                    ₹{routineSteps[activeRoutineStep].heroProd.defaultOriginalPrice}
                  </span>
                )}
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Ready for 15-Min Cold Dispatch
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-4">
                <button
                  onClick={() => handleAddStepProduct(routineSteps[activeRoutineStep].heroProd)}
                  className="dew-btn-berry !py-3 !px-7 text-xs font-black tracking-wider uppercase flex items-center gap-2 shadow-subtle"
                >
                  {stepAdded ? (
                    <>
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Added to Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add Step {routineSteps[activeRoutineStep].step} to Bag</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => onNavigate(`/product/${routineSteps[activeRoutineStep].heroProd.slug}`)}
                  className="px-5 py-3 rounded-xl border border-[#EFE7E1] hover:border-berry text-charcoal text-xs font-bold transition-colors"
                >
                  View Full Formula
                </button>
              </div>
            </div>
          </div>
        )}
      </section>


      {/* ========================================================
          4. BESTSELLERS SHOWCASE WITH 3D TACTILE CARDS
      ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-berry">
              Proven Formulations
            </span>
            <h2 className="font-editorial text-4xl sm:text-5xl text-charcoal tracking-tight mt-1">
              Cult Bestsellers
            </h2>
            <p className="text-xs text-muted mt-1 font-sans">
              The everyday skincare and clean color formulations our community re-orders most.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 glass-pill p-1.5 rounded-full shadow-subtle">
            {['all', 'serum', 'cream', 'cleanse', 'makeup', 'sun'].map((catKey) => (
              <button
                key={catKey}
                onClick={() => setBestsellerCategory(catKey)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all capitalize ${
                  bestsellerCategory === catKey
                    ? 'bg-berry text-white shadow-subtle'
                    : 'text-charcoal/70 hover:text-charcoal'
                }`}
              >
                {catKey === 'all' ? 'All Formulations' : catKey}
              </button>
            ))}
          </div>
        </div>

        {/* 3D Tactile Product Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {displayedBestsellers.map(product => (
            <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
          ))}
        </div>
      </section>


      {/* ========================================================
          5. EDITORIAL SPLIT SPREAD: COLD-CHAIN DISPATCH
      ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FAF7F4] rounded-4xl p-8 sm:p-14 border border-[#EFE7E1] relative overflow-hidden shadow-card">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            <div className="lg:col-span-6 space-y-5 text-left">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-champagne-600 bg-champagne-50 px-3 py-1 rounded-full border border-champagne-200">
                The Science of Fresh Potency
              </span>
              <h2 className="font-editorial text-4xl sm:text-5xl text-charcoal leading-tight">
                Why 15-Minute Cold Delivery Matters for Active Skincare.
              </h2>
              <p className="text-xs sm:text-sm text-charcoal/70 leading-relaxed font-sans font-normal">
                Active vitamins (like L-Ascorbic Acid) and bio-peptides degrade when sitting in transit warehouses for days. Dew & Go operates temperature-monitored dark stores across Bengaluru, dispatching within 2 minutes of checkout.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="glass-pill p-4 rounded-2xl border border-white/80 space-y-1">
                  <span className="font-mono text-2xl font-black text-berry block">0%</span>
                  <span className="text-xs font-bold text-charcoal block">Heat Oxidation</span>
                  <p className="text-[10px] text-muted">Cold-pack protected delivery from hub to doorstep.</p>
                </div>
                <div className="glass-pill p-4 rounded-2xl border border-white/80 space-y-1">
                  <span className="font-mono text-2xl font-black text-champagne-600 block">15m</span>
                  <span className="text-xs font-bold text-charcoal block">Average Delivery</span>
                  <p className="text-[10px] text-muted">Dedicated electric fleet across Indiranagar & Koramangala.</p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('/shop')}
                  className="dew-btn-berry !px-7 !py-3.5 text-xs font-black tracking-widest uppercase shadow-subtle"
                >
                  Shop Cold-Dispatched Formulations
                </button>
              </div>
            </div>

            <div className="lg:col-span-6 relative">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-3d-float border border-white/60 relative">
                <img
                  src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80"
                  alt="Dew & Go Formulation Inspection"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent flex items-end p-6">
                  <span className="font-editorial text-xl text-white italic">
                    Precision Formulated • Hyperlocal Delivery
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* ========================================================
          6. TRENDING NOW (TACTILE HORIZONTAL SCROLL)
      ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-coral">
              <Flame className="w-4 h-4 fill-coral" />
              <span>Right Now in Beauty</span>
            </div>
            <h2 className="font-editorial text-4xl text-charcoal tracking-tight mt-1">
              Trending Formulations
            </h2>
          </div>
          
          {/* Scroll Navigation Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollTrending('left')}
              aria-label="Scroll left"
              className="w-9 h-9 rounded-full border border-[#EFE7E1] bg-white hover:bg-warmcream text-charcoal flex items-center justify-center transition-colors shadow-subtle"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollTrending('right')}
              aria-label="Scroll right"
              className="w-9 h-9 rounded-full border border-[#EFE7E1] bg-white hover:bg-warmcream text-charcoal flex items-center justify-center transition-colors shadow-subtle"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Row with 3D tactile cards */}
        <div 
          ref={trendingScrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {trendingProducts.map(prod => (
            <div key={prod.id} className="min-w-[260px] sm:min-w-[290px] max-w-[290px] shrink-0 snap-start">
              <ProductCard product={prod} onNavigate={onNavigate} />
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
