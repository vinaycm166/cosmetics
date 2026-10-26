import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  RotateCcw, 
  CreditCard, 
  Zap, 
  Bike, 
  Check, 
  Sparkles, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Heart, 
  Droplets, 
  Layers, 
  ShoppingBag, 
  ChevronRight, 
  Eye, 
  SlidersHorizontal,
  Calendar,
  Send,
  Info
} from 'lucide-react';
import { ProductCard } from '../components/common/ProductCard';
import { ProductImage } from '../components/common/ProductImage';
import { store } from '../lib/store';
import { usePublishedProducts } from '../lib/useStore';
import { useLocation } from '../context/LocationContext';
import { useCart } from '../context/CartContext';
import { Product } from '../types';
import { useTilt } from '../hooks/useTilt';
import { useScrollParallax } from '../hooks/useScrollParallax';

interface HomePageProps {
  onNavigate: (route: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { selectedArea, selectedPinCode, openLocationModal } = useLocation();
  const { addToCart } = useCart();
  const allProducts = usePublishedProducts();
  const scrollY = useScrollParallax();

  // Video Ref & Playback state for Google Flow Hero Video
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState<boolean>(false);
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
      if (e.matches && videoRef.current) {
        videoRef.current.pause();
      } else if (!e.matches && videoRef.current) {
        videoRef.current.play().catch(() => {});
      }
    };

    mediaQuery.addEventListener('change', handleMotionChange);
    return () => mediaQuery.removeEventListener('change', handleMotionChange);
  }, []);

  useEffect(() => {
    if (videoRef.current && !isReducedMotion) {
      videoRef.current.play().catch(() => {});
    }
  }, [isReducedMotion]);

  // 3D Tilt for Spotlight Card
  const { ref: spotlightRef, style: spotlightTiltStyle } = useTilt<HTMLDivElement>({
    max: 10,
    scale: 1.01,
    perspective: 1200
  });

  // Spotlight quantity & added state
  const [spotlightQuantity, setSpotlightQuantity] = useState<number>(1);
  const [spotlightAdded, setSpotlightAdded] = useState<boolean>(false);

  // Drag-to-reveal comparison slider state (Scene 03)
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const comparisonContainerRef = useRef<HTMLDivElement>(null);

  const handleSliderMove = useCallback((clientX: number) => {
    if (!comparisonContainerRef.current) return;
    const rect = comparisonContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    handleSliderMove(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    if (e.touches[0]) {
      handleSliderMove(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleSliderMove(e.clientX);
      }
    };
    const handleWindowTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches[0]) {
        handleSliderMove(e.touches[0].clientX);
      }
    };
    const handleWindowMouseUp = () => {
      if (isDragging) setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleWindowMouseMove);
      window.addEventListener('mouseup', handleWindowMouseUp);
      window.addEventListener('touchmove', handleWindowTouchMove);
      window.addEventListener('touchend', handleWindowMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
      window.removeEventListener('touchmove', handleWindowTouchMove);
      window.removeEventListener('touchend', handleWindowMouseUp);
    };
  }, [isDragging, handleSliderMove]);

  // Keyboard accessibility for slider
  const handleSliderKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setSliderPos(prev => Math.max(0, prev - 5));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setSliderPos(prev => Math.min(100, prev + 5));
    }
  };

  // Scene 04: The Beauty Index active product index
  const [activeSpecIndex, setActiveSpecIndex] = useState<number>(0);
  const [indexAddedId, setIndexAddedId] = useState<string | null>(null);

  // Scene 05: Bestsellers category filter state
  const [activeBestsellerCategory, setActiveBestsellerCategory] = useState<string>('all');

  // Scene 07: Private Viewing Form state
  const [viewingForm, setViewingForm] = useState({
    fullName: '',
    phone: '',
    skinTarget: 'Barrier Repair & Deep Hydration',
    sessionFormat: 'Private In-Hub Viewing at Gokulam Hub',
    preferredSlot: 'Evening (18:00 – 20:00)'
  });
  const [isSubmittingViewing, setIsSubmittingViewing] = useState<boolean>(false);
  const [viewingSuccess, setViewingSuccess] = useState<boolean>(false);

  const handleViewingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingForm.fullName.trim() || !viewingForm.phone.trim()) {
      alert('Please provide your name and phone number for the private invitation.');
      return;
    }
    setIsSubmittingViewing(true);
    setTimeout(() => {
      setIsSubmittingViewing(false);
      setViewingSuccess(true);
    }, 800);
  };

  // Star Product for Scene 03 (strictly guarded with verified fallbacks)
  const starProduct = useMemo<Product | undefined>(() => {
    return allProducts.find(p => p.id === 'prod-cerave-hydrating') ||
           allProducts.find(p => p.isBestseller) ||
           allProducts.find(p => p.isFeatured) ||
           allProducts[0] ||
           store.getProductById('prod-cerave-hydrating') ||
           store.getProducts()[0];
  }, [allProducts]);

  // Scene 04: 3 Real Verified Products for the Beauty Index
  const specProducts = useMemo(() => {
    const list: Product[] = [];
    const p1 = allProducts.find(p => p.id === 'prod-cerave-hydrating') || store.getProductById('prod-cerave-hydrating');
    const p2 = allProducts.find(p => p.id === 'prod-minimalist-nia') || store.getProductById('prod-minimalist-nia');
    const p3 = allProducts.find(p => p.id === 'prod-ordinary-ha') || store.getProductById('prod-ordinary-ha');

    if (p1) list.push(p1);
    if (p2) list.push(p2);
    if (p3) list.push(p3);

    // If any are missing, fill from catalogue
    for (const p of allProducts) {
      if (list.length >= 3) break;
      if (!list.some(item => item.id === p.id)) {
        list.push(p);
      }
    }
    return list;
  }, [allProducts]);

  // Scene 05: Curated Catalogue List
  const flagshipBestsellers = useMemo<Product[]>(() => {
    const preferredIds = [
      'prod-cerave-hydrating',
      'prod-minimalist-nia',
      'prod-loreal-revitalift',
      'prod-maybelline-skyhigh',
      'prod-ordinary-ha'
    ];
    const picked: Product[] = [];
    for (const id of preferredIds) {
      const match = allProducts.find(p => p.id === id);
      if (match && !picked.some(p => p.id === match.id)) {
        picked.push(match);
      }
    }
    for (const p of allProducts) {
      if (picked.length >= 5) break;
      if (!picked.some(item => item.id === p.id)) {
        picked.push(p);
      }
    }
    if (picked.length === 0) {
      return store.getProducts().slice(0, 5);
    }
    return picked;
  }, [allProducts]);

  const filteredBestsellers = useMemo<Product[]>(() => {
    if (activeBestsellerCategory === 'all') return flagshipBestsellers;
    const matches = allProducts.filter(p => {
      const cat = p.category?.toLowerCase() || '';
      if (activeBestsellerCategory === 'skincare') return cat.includes('skin') || cat.includes('serum') || cat.includes('cream');
      if (activeBestsellerCategory === 'makeup') return cat.includes('make') || cat.includes('lip') || cat.includes('tint');
      if (activeBestsellerCategory === 'haircare') return cat.includes('hair') || cat.includes('scalp');
      if (activeBestsellerCategory === 'offers') return (p.defaultDiscount && p.defaultDiscount >= 15) || (p.mrp && p.defaultPrice && p.mrp > p.defaultPrice);
      return true;
    }).slice(0, 5);

    return matches.length > 0 ? matches : flagshipBestsellers;
  }, [allProducts, activeBestsellerCategory, flagshipBestsellers]);

  // Scene 06: Cinematic Image-Led Department Panels
  const editorialDepartments = [
    {
      code: 'DEPT 01',
      name: 'Skincare',
      subtitle: 'Barrier Creams, Ceramides & Pure Retinols',
      count: '24 Active Formulations',
      route: '/category/skincare',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=85',
      note: 'Stored at 18–22°C'
    },
    {
      code: 'DEPT 02',
      name: 'Makeup',
      subtitle: 'Dewy Skin Tints, Lip Oils & Velvet Blushes',
      count: '18 Active Formulations',
      route: '/category/makeup',
      image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=900&q=85',
      note: 'Breathable Clean Pigments'
    },
    {
      code: 'DEPT 03',
      name: 'Haircare',
      subtitle: 'Rosemary Density Oils & Clarifying Scalp Peels',
      count: '12 Active Formulations',
      route: '/category/haircare',
      image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=900&q=85',
      note: 'Follicle-Nutrient Infused'
    },
    {
      code: 'DEPT 04',
      name: 'Fragrance',
      subtitle: 'Artisanal Eau de Parfums & Golden Ambers',
      count: '10 Active Formulations',
      route: '/category/fragrance',
      image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=900&q=85',
      note: 'Long-Sillage Parfumerie'
    },
    {
      code: 'DEPT 05',
      name: 'Bath & Body',
      subtitle: 'Whipped Shea Butters & Smoothing Lactic Lotions',
      count: '14 Active Formulations',
      route: '/category/bath-body',
      image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=900&q=85',
      note: 'Dermal Moisture Barrier'
    },
    {
      code: 'DEPT 06',
      name: 'Beauty Tools',
      subtitle: 'Rose Quartz Rollers & Precision Velvet Applicators',
      count: '8 Active Formulations',
      route: '/category/beauty-tools',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=85',
      note: 'Sculpting & Lymphatic Flow'
    },
  ];

  return (
    <div className="w-full bg-[#080205] text-[#FAF5F0] overflow-x-hidden selection:bg-[#982245] selection:text-white">
      
      {/* ========================================================
          SCENE 01 — THE CAMPAIGN
          (Full Desktop Viewport Opening Scene with Google Flow Video)
      ======================================================== */}
      <section className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden bg-[#0A0205]">
        
        {/* Full-Bleed Video Background Container */}
        <div className="absolute inset-0 w-full h-full overflow-hidden z-0 select-none pointer-events-none">
          <video
            ref={videoRef}
            src="/videos/Skincare_products_in_beauty_studio_20261025182559.mp4"
            poster="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=2000&q=90"
            autoPlay={!isReducedMotion}
            muted
            loop
            playsInline
            preload="auto"
            onLoadedData={() => setIsVideoLoaded(true)}
            className={`w-full h-full object-cover object-center filter brightness-[0.88] contrast-[1.08] saturate-[1.05] transition-opacity duration-1000 ${
              isVideoLoaded ? 'opacity-100' : 'opacity-80'
            }`}
          >
            <source src="/videos/Skincare_products_in_beauty_studio_20261025182559.mp4" type="video/mp4" />
          </video>

          {/* Luxury Deep Burgundy & Near-Black Cherry Overlays for Text Contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#080205]/95 via-[#080205]/65 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080205] via-[#080205]/40 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#080205]/80 via-transparent to-[#080205] pointer-events-none" />
          
          {/* Subtle Radial Warm Glow */}
          <div className="absolute -left-20 top-1/4 w-[500px] h-[500px] rounded-full bg-burgundy/20 blur-[140px] pointer-events-none" />
        </div>

        {/* Top Campaign Eyebrow Labels */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 shadow-2xl">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              <span className="text-[10px] sm:text-xs font-mono font-bold tracking-[0.25em] text-rose-200 uppercase">
                SCENE 01 // CINEMATIC CAMPAIGN • SPRING 2026
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-4 text-xs font-mono text-white/70">
              <span className="flex items-center gap-1.5">
                <Bike className="w-3.5 h-3.5 text-rose-300" />
                <span>Gokulam, Mysuru Express Drop</span>
              </span>
              <span className="text-white/30">•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>18–22°C Climate Stored</span>
              </span>
            </div>
          </div>
        </div>

        {/* Monumental Editorial Headline & Shopping Action */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 lg:py-20 flex-1 flex flex-col justify-center">
          <div className="max-w-3xl space-y-6 sm:space-y-8 text-left">
            
            {/* Minimal Brand Identifier */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-rose-200">
                <svg className="w-4 h-4 fill-rose-300" viewBox="0 0 24 24">
                  <path d="M12 2C13.5 5 15.5 6.5 18.5 8C15.5 9.5 13.5 11 12 14C10.5 11 8.5 9.5 5.5 8C8.5 6.5 10.5 5 12 2Z" />
                  <circle cx="12" cy="18" r="2" />
                  <path d="M7 16C8 14 10 13.5 12 14C14 13.5 16 14 17 16C15 17 14 18.5 12 18.5C10 18.5 9 17 7 16Z" opacity="0.6" />
                </svg>
              </div>
              <span className="text-xs font-mono tracking-[0.3em] uppercase text-rose-300/90 font-semibold">
                DEW & GO CURATED COSMETICS
              </span>
            </div>

            {/* Exact Required Headline */}
            <h1 className="font-editorial text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-8.5xl font-bold tracking-tight text-[#FAF5F0] leading-[0.94] drop-shadow-lg">
              THE ART OF <br />
              <span className="italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-[#F7D6D0] to-amber-200">
                EVERYDAY
              </span> <br />
              GLOW.
            </h1>

            {/* Exact Required Supporting Text */}
            <p className="text-sm sm:text-lg lg:text-xl text-[#FAF5F0]/85 max-w-xl font-sans leading-relaxed">
              Discover the textures, formulations and rituals behind your next beauty essential.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2 max-w-md">
              <button
                onClick={() => {
                  const target = document.getElementById('scene-collection');
                  if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    onNavigate('/shop');
                  }
                }}
                className="px-8 py-4 rounded-full bg-gradient-to-r from-[#8B1E3F] via-burgundy to-[#A52A4A] hover:from-[#A52A4A] hover:to-[#8B1E3F] text-white text-xs sm:text-sm font-bold tracking-[0.15em] uppercase transition-all shadow-xl hover:shadow-2xl hover:scale-102 flex items-center justify-center gap-3 cursor-pointer group active:scale-95 border border-white/20"
              >
                <span>EXPLORE THE COLLECTION</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </button>

              <button
                onClick={() => {
                  const target = document.getElementById('scene-texture');
                  target?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-4 rounded-full bg-white/10 hover:bg-white/20 text-[#FAF5F0] border border-white/20 backdrop-blur-md text-xs font-bold tracking-[0.15em] uppercase transition-all cursor-pointer text-center"
              >
                DISCOVER THE TEXTURE ↓
              </button>
            </div>

          </div>
        </div>

        {/* Bottom Scroll Indicator & Trust Seal Bar */}
        <div className="relative z-10 w-full border-t border-white/10 bg-[#0A0205]/70 backdrop-blur-md py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center gap-3 text-xs text-[#FAF5F0]/70 font-mono tracking-wider">
              <div className="w-5 h-8 rounded-full border border-white/30 flex items-start justify-center p-1">
                <span className="w-1.5 h-2 bg-rose-300 rounded-full animate-bounce" />
              </div>
              <span className="uppercase text-[10px] tracking-[0.2em]">SCROLL TO DISCOVER SCENES</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 text-left text-xs">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-rose-300 shrink-0" />
                <span className="text-[11px] text-white/90">30–45 Mins Gokulam Drop</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-rose-300 shrink-0" />
                <span className="text-[11px] text-white/90">100% Lab Authenticity</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-rose-300 shrink-0" />
                <span className="text-[11px] text-white/90">Doorstep Rider Return</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-rose-300 shrink-0" />
                <span className="text-[11px] text-white/90">Razorpay Protected</span>
              </div>
            </div>

          </div>
        </div>

      </section>


      {/* ========================================================
          CURVED SECTION MASK BOUNDARY
          (Transitioning from Scene 01 into Scene 02)
      ======================================================== */}
      <div className="w-full overflow-hidden leading-none -mt-1 relative z-20 pointer-events-none select-none">
        <svg 
          className="w-full h-12 sm:h-20 lg:h-24 fill-[#100308] text-[#100308]" 
          viewBox="0 0 1440 120" 
          preserveAspectRatio="none"
        >
          <path d="M0,0 C360,90 1080,90 1440,0 L1440,120 L0,120 Z" />
        </svg>
      </div>


      {/* ========================================================
          SCENE 02 — THE TEXTURE
          (Curved Mask Boundary + Beauty Macro Photography & Manifesto)
      ======================================================== */}
      <section id="scene-texture" className="relative w-full bg-[#100308] py-20 lg:py-32 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Texture Philosophy & Cold-Chain Manifesto */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-rose-300 font-mono text-[10px] tracking-[0.2em] uppercase">
                <Droplets className="w-3.5 h-3.5 text-rose-300" />
                <span>SCENE 02 // SENSORIAL FORMULATION ARCHITECTURE</span>
              </div>

              <h2 className="font-editorial text-3xl sm:text-5xl lg:text-6xl font-bold text-[#FAF5F0] leading-[1.05]">
                ARCHITECTURAL VISCOSITY &amp; CELLULAR AFFINITY.
              </h2>

              <p className="text-sm sm:text-base text-[#FAF5F0]/80 leading-relaxed font-sans">
                Active cosmetic molecules — pure ascorbic acid, multi-chain ceramides, and stabilized peptides — are exquisitely sensitive to thermal oxidation. National distribution routes subject formulas to 45°C shipping container trucks over 5 to 7 days, degrading molecular potency before the bottle ever reaches your vanity.
              </p>

              <p className="text-xs sm:text-sm text-[#FAF5F0]/70 leading-relaxed font-sans">
                Dew &amp; Go preserves raw potency through cold-chain logistics. Our Gokulam hub maintains steady 18–22°C climate conditioning and dispatches with insulated rapid riders within 30 to 45 minutes of formulation selection.
              </p>

              {/* 3 Technical Viscosity Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] font-mono uppercase text-rose-300/80 block">01 / SUSPENSION</span>
                  <span className="text-sm font-bold text-white block mt-1">&lt; 0.18 µm</span>
                  <span className="text-[10px] text-white/60 block mt-0.5">Micro-Emulsion Droplets</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] font-mono uppercase text-rose-300/80 block">02 / COLD-STORAGE</span>
                  <span className="text-sm font-bold text-white block mt-1">18–22°C</span>
                  <span className="text-[10px] text-white/60 block mt-0.5">Regulated Mysuru Hub</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] font-mono uppercase text-rose-300/80 block">03 / PENETRATION</span>
                  <span className="text-sm font-bold text-white block mt-1">&lt; 40 Sec</span>
                  <span className="text-[10px] text-white/60 block mt-0.5">Zero Film Residue</span>
                </div>
              </div>

            </div>

            {/* Right Column: Macro Beauty Photography with Parallax */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-[#19050E]">
                <img
                  src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=85"
                  alt="Dew & Go Botanical Macro Texture and Micro-Emulsion"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105 filter brightness-105 contrast-105"
                />
                
                {/* Visual Atmospheric Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0C0206] via-transparent to-black/20 pointer-events-none" />

                {/* Floating Technical Inspection Badge */}
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 p-4 rounded-2xl bg-[#0C0206]/85 backdrop-blur-md border border-white/15 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">Bioactive Serum Micro-Emulsion</span>
                    <span className="text-[10px] text-rose-200/80 font-mono block">Direct Lab Batch Sourced for Mysuru</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold font-mono">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>BIO-ACTIVE</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* ========================================================
          SCENE 03 — THE FORMULA
          (Featured Product with 3D Depth & Interactive Drag-to-Reveal Comparison)
      ======================================================== */}
      <section id="scene-formula" className="relative w-full py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-[#0D0307] border-b border-white/5">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[10px] font-mono uppercase font-bold tracking-[0.25em] text-rose-300 block">
              SCENE 03 // THE FORMULA &amp; SURFACE FINISH
            </span>
            <h2 className="font-editorial text-3xl sm:text-5xl lg:text-6xl font-bold text-[#FAF5F0]">
              The Star Barrier Formula
            </h2>
            <p className="text-xs sm:text-sm text-[#FAF5F0]/70 font-sans">
              Interact with the drag-to-reveal slider to compare raw concentrated emulsion viscosity against bare hydrated radiant skin finish.
            </p>
          </div>

          {/* Interactive Drag-to-Reveal Comparison Container */}
          <div className="rounded-3xl bg-[#14040B] border border-white/15 p-4 sm:p-8 lg:p-10 shadow-2xl space-y-8">
            
            {/* Split Comparison Slider (Mouse, Touch, and Keyboard Accessible) */}
            <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden select-none border border-white/20">
              
              <div 
                ref={comparisonContainerRef}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onKeyDown={handleSliderKeyDown}
                tabIndex={0}
                role="slider"
                aria-label="Drag to reveal formula texture vs radiant dewy finish"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(sliderPos)}
                className="relative w-full h-full cursor-ew-resize focus:outline-none focus:ring-2 focus:ring-rose-400"
              >
                {/* Background Side B: Luminous Dewy Skin Finish */}
                <img
                  src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1800&q=85"
                  alt="Dewy Radiant Skin Finish"
                  className="absolute inset-0 w-full h-full object-cover filter brightness-[0.95] contrast-[1.05]"
                />
                <div className="absolute top-4 right-4 bg-[#0A0205]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 text-[10px] sm:text-xs font-mono font-bold text-rose-200">
                  02 / RADIANT DEWY FINISH
                </div>

                {/* Foreground Side A: Formula Texture (Clipped by slider position) */}
                <div 
                  className="absolute inset-0 overflow-hidden"
                  style={{
                    clipPath: `inset(0 calc(100% - ${sliderPos}%) 0 0)`
                  }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1800&q=85"
                    alt="Raw Bioactive Cleanser Emulsion Texture"
                    className="absolute inset-0 w-full h-full object-cover filter brightness-[1.02] contrast-[1.1]"
                  />
                  <div className="absolute top-4 left-4 bg-[#0A0205]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 text-[10px] sm:text-xs font-mono font-bold text-rose-200">
                    01 / RAW FORMULA TEXTURE
                  </div>
                </div>

                {/* Vertical Divider Line with Draggable Halo */}
                <div 
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl pointer-events-none"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-burgundy border-2 border-white flex items-center justify-center text-white shadow-2xl text-xs font-bold">
                    ⇄
                  </div>
                </div>

              </div>

              {/* Interaction Hint */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#0A0205]/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[9px] sm:text-[10px] font-mono text-white/70 pointer-events-none">
                DRAG OR USE ARROW KEYS TO REVEAL
              </div>

            </div>

            {/* Featured Product Real Specifications & Direct Add-to-Bag */}
            {starProduct && (
              <div 
                ref={spotlightRef}
                style={spotlightTiltStyle}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4"
              >
                {/* Product Image Column */}
                <div className="lg:col-span-4 flex items-center justify-center">
                  <div className="relative w-full max-w-[260px] aspect-square rounded-2xl bg-white/5 border border-white/10 p-6 flex items-center justify-center shadow-inner">
                    <ProductImage
                      src={starProduct.images?.[0] || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80'}
                      alt={starProduct.name}
                      brand={starProduct.brand}
                      category={starProduct.category}
                      className="w-full h-full object-contain filter drop-shadow-2xl hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-3 left-3 bg-[#FEF3EB] text-[#C25E1A] px-2 py-0.5 rounded text-[9px] font-bold tracking-wide">
                      ★ Mysore's #1 Bestseller
                    </span>
                  </div>
                </div>

                {/* Product Dossier Column */}
                <div className="lg:col-span-8 space-y-4 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] sm:text-xs font-bold text-rose-300 uppercase tracking-wider bg-rose-500/10 px-2.5 py-1 rounded-md border border-rose-500/20">
                      {starProduct.brand}
                    </span>
                    <span className="text-xs font-semibold text-white/60">
                      {starProduct.category}
                    </span>
                  </div>

                  <h3 className="font-editorial text-2xl sm:text-4xl font-bold text-white">
                    {starProduct.name}
                  </h3>

                  <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-xl">
                    {starProduct.description}
                  </p>

                  {/* Verified Actives Profile */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-mono uppercase font-bold text-rose-300/80 tracking-wider block">
                      Verified Actives Profile:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        '3 Essential Ceramides (1, 3, 6-II)',
                        'Pure Hyaluronic Acid',
                        'MVE Controlled Delivery',
                        'Non-Comedogenic & Fragrance Free'
                      ].map((ing, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] sm:text-xs font-medium text-white/90"
                        >
                          <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>{ing}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pricing, Quantity Stepper, & Action Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/10">
                    <div>
                      <span className="text-[10px] text-white/50 block uppercase font-mono">Special Selling Price</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-white">₹{starProduct.defaultPrice}</span>
                        {starProduct.defaultOriginalPrice && starProduct.defaultOriginalPrice > starProduct.defaultPrice && (
                          <span className="text-sm text-white/40 line-through">₹{starProduct.defaultOriginalPrice}</span>
                        )}
                        {starProduct.defaultDiscount && (
                          <span className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold px-1.5 py-0.5 rounded">
                            {starProduct.defaultDiscount}% OFF
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Stepper & Add to Bag */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-white/20 rounded-full px-2 py-1 bg-white/5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setSpotlightQuantity(prev => Math.max(1, prev - 1))}
                          disabled={spotlightQuantity <= 1}
                          className="w-7 h-7 flex items-center justify-center text-white hover:text-rose-300 font-bold text-sm disabled:opacity-40"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-white">
                          {spotlightQuantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const maxStock = starProduct.variants?.[0]?.stockQuantity ?? 10;
                            setSpotlightQuantity(prev => Math.min(maxStock, prev + 1));
                          }}
                          className="w-7 h-7 flex items-center justify-center text-white hover:text-rose-300 font-bold text-sm"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          const primaryVariant = starProduct.variants?.[0] || {
                            id: `${starProduct.id}-default`,
                            variantName: 'Standard',
                            price: starProduct.defaultPrice || 399,
                            sku: starProduct.id,
                            stockQuantity: 15
                          };
                          const res = addToCart(starProduct, primaryVariant, spotlightQuantity);
                          if (res.success) {
                            setSpotlightAdded(true);
                            setTimeout(() => setSpotlightAdded(false), 2000);
                          }
                        }}
                        className={`px-6 py-3 rounded-full text-xs font-bold tracking-wider uppercase transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95 ${
                          spotlightAdded
                            ? 'bg-emerald-600 text-white'
                            : 'bg-burgundy hover:bg-rose-700 text-white border border-white/20'
                        }`}
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>{spotlightAdded ? 'Added to Bag!' : 'Add to Bag'}</span>
                      </button>

                      <button
                        onClick={() => onNavigate(`/product/${starProduct.slug}`)}
                        className="px-4 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition-colors"
                      >
                        Details
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>

        </div>
      </section>


      {/* ========================================================
          SCENE 04 — THE BEAUTY INDEX
          (Specification-Inspired Editorial Dossier with Real Verified Product Attributes)
      ======================================================== */}
      <section id="scene-index" className="relative w-full py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-[#090206] border-b border-white/5">
        <div className="max-w-7xl mx-auto space-y-10">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6 text-left">
            <div>
              <span className="text-[10px] font-mono uppercase font-bold tracking-[0.25em] text-rose-300 block">
                SCENE 04 // TECHNICAL SPECIFICATION MATRIX
              </span>
              <h2 className="font-editorial text-3xl sm:text-5xl font-bold text-white tracking-tight mt-1">
                The Beauty Index
              </h2>
            </div>

            {/* 3 Real Product Switcher Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {specProducts.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => setActiveSpecIndex(idx)}
                  className={`px-4 py-2 rounded-full text-xs font-mono tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                    activeSpecIndex === idx
                      ? 'bg-rose-500/20 text-rose-200 border border-rose-400 shadow-md'
                      : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {p.brand}: {p.name.slice(0, 18)}...
                </button>
              ))}
            </div>
          </div>

          {/* Active Product Specification Matrix */}
          {specProducts[activeSpecIndex] && (() => {
            const current = specProducts[activeSpecIndex];
            return (
              <div className="rounded-3xl bg-[#12040A] border border-white/15 p-6 sm:p-10 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Left Column: Product Crop & Real Price */}
                <div className="lg:col-span-4 flex flex-col items-center text-center space-y-4">
                  <div className="relative w-full max-w-[240px] aspect-square rounded-2xl bg-white/5 border border-white/10 p-6 flex items-center justify-center">
                    <ProductImage
                      src={current.images?.[0] || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80'}
                      alt={current.name}
                      brand={current.brand}
                      category={current.category}
                      className="w-full h-full object-contain filter drop-shadow-xl"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-rose-300 block">{current.brand}</span>
                    <h4 className="font-editorial text-xl font-bold text-white mt-0.5">{current.name}</h4>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <span className="text-xl font-bold text-white">₹{current.defaultPrice}</span>
                      {current.defaultOriginalPrice && (
                        <span className="text-xs text-white/40 line-through">₹{current.defaultOriginalPrice}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full max-w-[240px]">
                    <button
                      onClick={() => {
                        const primaryVariant = current.variants?.[0] || {
                          id: `${current.id}-default`,
                          variantName: 'Standard',
                          price: current.defaultPrice || 399,
                          sku: current.id,
                          stockQuantity: 15
                        };
                        const res = addToCart(current, primaryVariant, 1);
                        if (res.success) {
                          setIndexAddedId(current.id);
                          setTimeout(() => setIndexAddedId(null), 2000);
                        }
                      }}
                      className="flex-1 py-2.5 rounded-full bg-burgundy hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{indexAddedId === current.id ? 'Added!' : 'Add to Bag'}</span>
                    </button>
                    <button
                      onClick={() => onNavigate(`/product/${current.slug}`)}
                      className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 cursor-pointer"
                      title="Inspect Product"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Right Column: Clean Technical Specification Matrix */}
                <div className="lg:col-span-8 divide-y divide-white/10 font-mono text-xs">
                  
                  <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-white/50 uppercase tracking-widest text-[10px]">01 / CATALOGUE ID &amp; SKU</span>
                    <span className="text-rose-200 font-bold">{current.id}</span>
                  </div>

                  <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-white/50 uppercase tracking-widest text-[10px]">02 / BRAND &amp; PARENT LAB</span>
                    <span className="text-white font-semibold">{current.brand}</span>
                  </div>

                  <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-white/50 uppercase tracking-widest text-[10px]">03 / FORMULATION CATEGORY</span>
                    <span className="text-white font-semibold">{current.category}</span>
                  </div>

                  <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-white/50 uppercase tracking-widest text-[10px]">04 / NET VOLUME &amp; PACKAGING</span>
                    <span className="text-white font-semibold">{current.variants?.[0]?.variantName || 'Standard Bottle'}</span>
                  </div>

                  <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-white/50 uppercase tracking-widest text-[10px]">05 / KEY DECLARED ACTIVES</span>
                    <span className="text-emerald-400 font-semibold max-w-md text-left sm:text-right">
                      {current.skinConcern?.join(', ') || 'Ceramides, Hyaluronic Acid, Barrier Actives'}
                    </span>
                  </div>

                  <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-white/50 uppercase tracking-widest text-[10px]">06 / CLIMATE STORAGE ENVIRONMENT</span>
                    <span className="text-white font-semibold">18–22°C Regulated Mysuru Storage</span>
                  </div>

                  <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-white/50 uppercase tracking-widest text-[10px]">07 / DISPATCH &amp; TRANSIT WINDOW</span>
                    <span className="text-rose-300 font-semibold">30–45 Mins Hyperlocal Courier</span>
                  </div>

                  <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-white/50 uppercase tracking-widest text-[10px]">08 / INVENTORY AVAILABILITY</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>IN STOCK • VERIFIED BATCH</span>
                    </span>
                  </div>

                </div>

              </div>
            );
          })()}

        </div>
      </section>


      {/* ========================================================
          SCENE 05 — THE COLLECTION
          (Real Published Product Catalogue with Category Filters & Cart Integration)
      ======================================================== */}
      <section id="scene-collection" className="relative w-full py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-[#0B0206] border-b border-white/5">
        <div className="max-w-7xl mx-auto space-y-10">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6 text-left">
            <div>
              <span className="text-[10px] font-mono uppercase font-bold tracking-[0.25em] text-rose-300 block">
                SCENE 05 // THE PERMANENT COLLECTION
              </span>
              <h2 className="font-editorial text-3xl sm:text-5xl font-bold text-white tracking-tight mt-1">
                Published Catalogue
              </h2>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {[
                { id: 'all', label: 'All Formulations' },
                { id: 'skincare', label: 'Skincare' },
                { id: 'makeup', label: 'Makeup' },
                { id: 'haircare', label: 'Haircare' },
                { id: 'offers', label: 'High-Value Deals' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveBestsellerCategory(tab.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeBestsellerCategory === tab.id
                      ? 'bg-burgundy text-white shadow-lg border border-white/30'
                      : 'bg-white/5 text-white/80 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* 5-Column Responsive Product Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-5">
            {filteredBestsellers.map(product => (
              <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
            ))}
          </div>

          {/* Full Catalogue Navigation Trigger */}
          <div className="pt-4 text-center">
            <button
              onClick={() => onNavigate('/shop')}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-bold tracking-[0.2em] uppercase transition-all shadow-md hover:shadow-xl cursor-pointer"
            >
              <span>VIEW FULL CATALOGUE ({allProducts.length} FORMULATIONS)</span>
              <ArrowRight className="w-4 h-4 text-rose-300" />
            </button>
          </div>

        </div>
      </section>


      {/* ========================================================
          SCENE 06 — THE DEPARTMENTS
          (Cinematic Image-Led Department Panels with Hover Motion)
      ======================================================== */}
      <section id="scene-departments" className="relative w-full py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-[#080205] border-b border-white/5">
        <div className="max-w-7xl mx-auto space-y-10">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-white/10 pb-6 gap-2 text-left">
            <div>
              <span className="text-[10px] font-mono uppercase font-bold tracking-[0.25em] text-rose-300 block">
                SCENE 06 // CURATED BEAUTY DISCIPLINES
              </span>
              <h2 className="font-editorial text-3xl sm:text-5xl font-bold text-white tracking-tight mt-1">
                The Departments
              </h2>
            </div>
            <button
              onClick={() => onNavigate('/shop')}
              className="text-xs font-mono font-bold text-rose-300 hover:text-white flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
            >
              <span>Explore All Categories</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 6 Large Cinematic Department Panels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {editorialDepartments.map((dept, idx) => (
              <div
                key={idx}
                onClick={() => onNavigate(dept.route)}
                className="group relative rounded-3xl overflow-hidden bg-[#12040A] border border-white/15 shadow-2xl hover:shadow-card cursor-pointer transition-all duration-500 flex flex-col justify-between h-96"
              >
                {/* Background Photography with Zoom & Lighting Transition */}
                <div className="absolute inset-0 z-0 overflow-hidden bg-gradient-to-br from-[#4A1020] via-[#2A0812] to-[#140308]">
                  <img
                    src={dept.image}
                    alt={dept.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out opacity-85 group-hover:opacity-100 filter brightness-[0.95]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080205] via-[#080205]/45 to-transparent" />
                </div>

                {/* Top Code Pill & Arrow Trigger */}
                <div className="relative z-10 p-6 flex justify-between items-center text-white">
                  <span className="font-mono text-xs font-bold tracking-widest px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-rose-200">
                    {dept.code}
                  </span>
                  <span className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-burgundy group-hover:border-transparent transition-all">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>

                {/* Bottom Content & Meta */}
                <div className="relative z-10 p-6 space-y-1.5 text-left">
                  <span className="text-[10px] font-mono uppercase text-rose-300 font-bold tracking-widest block">
                    {dept.note}
                  </span>
                  <h3 className="font-editorial text-3xl font-bold text-white group-hover:text-rose-200 transition-colors">
                    {dept.name}
                  </h3>
                  <p className="text-xs text-white/80 font-sans">
                    {dept.subtitle}
                  </p>
                  <span className="text-[11px] font-mono text-white/60 block pt-1">
                    {dept.count}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* ========================================================
          SCENE 07 — THE FINAL INVITATION
          (Private Beauty Viewing & Bespoke Routine Consultation Booking Form)
      ======================================================== */}
      <section id="scene-invitation" className="relative w-full py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#080205] via-[#15040B] to-[#0A0205]">
        <div className="max-w-7xl mx-auto">
          
          <div className="rounded-3xl bg-gradient-to-br from-[#1C0510] via-[#14030B] to-[#0D0207] border border-white/20 p-8 sm:p-12 lg:p-16 shadow-2xl relative overflow-hidden">
            
            {/* Background Ambient Glows */}
            <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-burgundy/20 blur-[130px] pointer-events-none" />
            <div className="absolute left-10 -top-20 w-80 h-80 rounded-full bg-rose-500/10 blur-[120px] pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
              
              {/* Left Column: Invitation Manifesto */}
              <div className="lg:col-span-6 space-y-6 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-rose-200 font-mono text-[10px] tracking-[0.2em] uppercase">
                  <Calendar className="w-3.5 h-3.5 text-rose-300" />
                  <span>SCENE 07 // PRIVATE VIEWING &amp; CONSULTATION</span>
                </div>

                <h2 className="font-editorial text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                  Bespoke Routine Consultation &amp; Private Viewing.
                </h2>

                <p className="text-xs sm:text-base text-white/80 leading-relaxed font-sans">
                  Experience formulations firsthand in an intimate, private setting. Reserve a consultation with our licensed cosmetic specialists at the Gokulam hub, or book a 1-on-1 virtual formulation concierge session tailored to your skin’s barrier history.
                </p>

                <div className="space-y-3 pt-2 text-xs text-white/90 font-mono">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Complimentary micro-patch sensitivity analysis</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Curated routine pairing across our 750+ published formulations</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Express dispatch from Gokulam Hub directly to your doorstep</span>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => onNavigate('/shop')}
                    className="px-8 py-4 rounded-full bg-white text-charcoal hover:bg-rose-50 text-xs font-bold uppercase tracking-[0.15em] transition-all shadow-xl hover:shadow-2xl cursor-pointer active:scale-95 inline-flex items-center gap-2.5"
                  >
                    <span>EXPLORE THE FULL CATALOGUE</span>
                    <ArrowRight className="w-4 h-4 text-burgundy" />
                  </button>
                </div>
              </div>

              {/* Right Column: Private Viewing Booking Form */}
              <div className="lg:col-span-6">
                <div className="rounded-2xl bg-[#0B0206]/85 backdrop-blur-md border border-white/20 p-6 sm:p-8 shadow-2xl text-left">
                  
                  {viewingSuccess ? (
                    <div className="space-y-4 py-8 text-center animate-fade-in">
                      <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center mx-auto">
                        <Check className="w-7 h-7" />
                      </div>
                      <h4 className="font-editorial text-2xl font-bold text-white">
                        Invitation Requested
                      </h4>
                      <p className="text-xs sm:text-sm text-white/80 max-w-sm mx-auto font-sans leading-relaxed">
                        Thank you, <strong className="text-rose-200">{viewingForm.fullName}</strong>. Our Gokulam hub concierge will contact you on WhatsApp at <strong className="text-rose-200">{viewingForm.phone}</strong> to confirm your slot.
                      </p>
                      <button
                        onClick={() => {
                          setViewingSuccess(false);
                          setViewingForm({
                            fullName: '',
                            phone: '',
                            skinTarget: 'Barrier Repair & Deep Hydration',
                            sessionFormat: 'Private In-Hub Viewing at Gokulam Hub',
                            preferredSlot: 'Evening (18:00 – 20:00)'
                          });
                        }}
                        className="text-xs font-mono text-rose-300 hover:underline pt-2 inline-block cursor-pointer"
                      >
                        Book another appointment →
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleViewingSubmit} className="space-y-4">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-rose-300 block mb-1">
                          RESERVE AN APPOINTMENT
                        </span>
                        <h4 className="font-editorial text-xl sm:text-2xl font-bold text-white">
                          Private Routine Viewing
                        </h4>
                      </div>

                      {/* Guest Name */}
                      <div>
                        <label className="block text-[11px] font-mono text-white/70 uppercase tracking-wider mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={viewingForm.fullName}
                          onChange={(e) => setViewingForm({ ...viewingForm, fullName: e.target.value })}
                          placeholder="e.g. Ananya Rao"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder:text-white/40 focus:bg-white/15 focus:outline-none focus:border-rose-400 transition-all font-sans"
                        />
                      </div>

                      {/* Phone / WhatsApp */}
                      <div>
                        <label className="block text-[11px] font-mono text-white/70 uppercase tracking-wider mb-1">
                          Mobile / WhatsApp Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={viewingForm.phone}
                          onChange={(e) => setViewingForm({ ...viewingForm, phone: e.target.value })}
                          placeholder="e.g. +91 98765 43210"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder:text-white/40 focus:bg-white/15 focus:outline-none focus:border-rose-400 transition-all font-sans"
                        />
                      </div>

                      {/* Skin Focus Target */}
                      <div>
                        <label className="block text-[11px] font-mono text-white/70 uppercase tracking-wider mb-1">
                          Primary Skin Target
                        </label>
                        <select
                          value={viewingForm.skinTarget}
                          onChange={(e) => setViewingForm({ ...viewingForm, skinTarget: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#1A050E] border border-white/20 text-xs text-white focus:outline-none focus:border-rose-400 font-sans"
                        >
                          <option value="Barrier Repair & Deep Hydration">Barrier Repair &amp; Deep Hydration</option>
                          <option value="Cellular Radiance & Tone Correction">Cellular Radiance &amp; Tone Correction</option>
                          <option value="Scalp Density & Follicle Care">Scalp Density &amp; Follicle Care</option>
                          <option value="Artisanal Parfumerie & Signature Sillage">Artisanal Parfumerie &amp; Signature Sillage</option>
                        </select>
                      </div>

                      {/* Session Format */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-mono text-white/70 uppercase tracking-wider mb-1">
                            Session Format
                          </label>
                          <select
                            value={viewingForm.sessionFormat}
                            onChange={(e) => setViewingForm({ ...viewingForm, sessionFormat: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-xl bg-[#1A050E] border border-white/20 text-xs text-white focus:outline-none focus:border-rose-400 font-sans"
                          >
                            <option value="Private In-Hub Viewing at Gokulam Hub">Gokulam Hub Viewing</option>
                            <option value="1-on-1 Virtual Skin Concierge">Virtual Concierge</option>
                            <option value="WhatsApp Direct Curation">WhatsApp Curation</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono text-white/70 uppercase tracking-wider mb-1">
                            Preferred Slot
                          </label>
                          <select
                            value={viewingForm.preferredSlot}
                            onChange={(e) => setViewingForm({ ...viewingForm, preferredSlot: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-xl bg-[#1A050E] border border-white/20 text-xs text-white focus:outline-none focus:border-rose-400 font-sans"
                          >
                            <option value="Morning (10:00 – 12:00)">Morning (10:00–12:00)</option>
                            <option value="Afternoon (14:00 – 16:00)">Afternoon (14:00–16:00)</option>
                            <option value="Evening (18:00 – 20:00)">Evening (18:00–20:00)</option>
                          </select>
                        </div>
                      </div>

                      {/* Submit Action */}
                      <button
                        type="submit"
                        disabled={isSubmittingViewing}
                        className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-burgundy via-[#9E2045] to-[#B32750] hover:from-[#B32750] hover:to-burgundy text-white text-xs font-bold uppercase tracking-[0.15em] transition-all shadow-lg hover:shadow-2xl cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 border border-white/20"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSubmittingViewing ? 'Submitting Reservation...' : 'REQUEST PRIVATE INVITATION'}</span>
                      </button>
                    </form>
                  )}

                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

    </div>
  );
};
