import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  RotateCcw, 
  CreditCard, 
  Zap, 
  Bike, 
  Check, 
  Percent,
  Sparkles,
  Star,
  Clock,
  MapPin,
  CheckCircle2,
  Heart,
  Droplets,
  Layers,
  Sun,
  Flame,
  ShoppingBag,
  ChevronRight,
  Eye,
  SlidersHorizontal
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
  const { selectedArea, selectedPinCode, isServiceable, estimatedDeliveryMinutes, openLocationModal } = useLocation();
  const { addToCart } = useCart();
  const allProducts = usePublishedProducts();
  const scrollY = useScrollParallax();
  const [heroImgSrc, setHeroImgSrc] = useState<string>('https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=2000&q=90');

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
    max: 12,
    scale: 1.02,
    perspective: 1200
  });

  // Spotlight quantity state
  const [spotlightQuantity, setSpotlightQuantity] = useState<number>(1);
  const [spotlightAdded, setSpotlightAdded] = useState<boolean>(false);

  // Bestsellers category filter state
  const [activeBestsellerCategory, setActiveBestsellerCategory] = useState<string>('all');
  
  // 4-Step Dewy Routine active step
  const [activeRoutineStep, setActiveRoutineStep] = useState<number>(0);
  const [routineAddedNotification, setRoutineAddedNotification] = useState<string | null>(null);

  // Live Pincode Checker state for Gokulam banner
  const [pincodeInput, setPincodeInput] = useState<string>(selectedPinCode || '570002');
  const [pincodeResult, setPincodeResult] = useState<{
    tested: boolean;
    valid: boolean;
    message: string;
    speed: string;
  }>({
    tested: true,
    valid: true,
    message: 'Hyperlocal Hub: Gokulam 3rd Stage, Mysuru',
    speed: '30–45 Mins Delivery'
  });

  const handleTestPincode = (e: React.FormEvent) => {
    e.preventDefault();
    const pin = pincodeInput.trim();
    if (['570002', '570020', '570012', '570001', '570005', '570006'].includes(pin)) {
      setPincodeResult({
        tested: true,
        valid: true,
        message: pin === '570002' ? 'Gokulam Central: Priority Express Hub' : 'Mysuru Urban: Standard Express Hub',
        speed: pin === '570002' ? '30–45 Mins' : '45–60 Mins'
      });
    } else if (pin.length === 6) {
      setPincodeResult({
        tested: true,
        valid: true,
        message: 'Greater Mysuru Delivery Route',
        speed: 'Same-Day Evening Delivery'
      });
    } else {
      setPincodeResult({
        tested: true,
        valid: false,
        message: 'Please enter a valid 6-digit PIN code',
        speed: '—'
      });
    }
  };

  // Flagship bestsellers matching actual catalogue with safe fallbacks
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
    // Fill remaining slots up to 5 from published products
    for (const p of allProducts) {
      if (picked.length >= 5) break;
      if (!picked.some(item => item.id === p.id)) {
        picked.push(p);
      }
    }
    // If published products are temporarily empty, fallback to store products
    if (picked.length === 0) {
      const storeProds = store.getProducts();
      return storeProds.slice(0, 5);
    }
    return picked;
  }, [allProducts]);

  // Filtered bestsellers based on user tab selection
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

  // Crown Star Product for 3D Dimensional Spotlight (strictly guarded)
  const starProduct = useMemo<Product | undefined>(() => {
    return allProducts.find(p => p.id === 'prod-cerave-hydrating') ||
           allProducts.find(p => p.isBestseller) ||
           allProducts.find(p => p.isFeatured) ||
           allProducts[0] ||
           store.getProductById('prod-cerave-hydrating') ||
           store.getProducts()[0];
  }, [allProducts]);

  // Large Image-Led Editorial Category Gallery
  const editorialDepartments = [
    {
      code: '01',
      name: 'Skincare',
      subtitle: 'Barrier Creams & Targeted Serums',
      count: '24 Formulations',
      route: '/category/skincare',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=85',
    },
    {
      code: '02',
      name: 'Makeup',
      subtitle: 'Dewy Skin Tints & Lip Glazes',
      count: '18 Formulations',
      route: '/category/makeup',
      image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=85',
    },
    {
      code: '03',
      name: 'Haircare',
      subtitle: 'Rosemary Scalp Oils & Clarifiers',
      count: '12 Formulations',
      route: '/category/haircare',
      image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=85',
    },
    {
      code: '04',
      name: 'Fragrance',
      subtitle: 'Artisanal Eau de Parfums',
      count: '10 Formulations',
      route: '/category/fragrance',
      image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=85',
    },
    {
      code: '05',
      name: 'Bath & Body',
      subtitle: 'Whipped Shea & Smoothing Lotions',
      count: '14 Formulations',
      route: '/category/bath-body',
      image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=800&q=85',
    },
    {
      code: '06',
      name: 'Beauty Tools',
      subtitle: 'Rose Quartz Rollers & Velvet Brushes',
      count: '8 Formulations',
      route: '/category/beauty-tools',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=85',
    },
  ];

  return (
    <div className="space-y-20 sm:space-y-32 pb-32 overflow-x-hidden bg-[#FCFAF8] text-charcoal">
      
      {/* ========================================================
          SCENE 1: CINEMATIC BEAUTY CAMPAIGN HERO
          (Dominant Full-Bleed 62% Campaign Visual + Layered Typography)
      ======================================================== */}
      <section className="relative w-full min-h-[92vh] lg:min-h-[95vh] flex items-center overflow-hidden bg-[#FAF5F0] border-b border-[#EAE0D6]">
        
        {/* DOMINANT FULL-HEIGHT BEAUTY CAMPAIGN PHOTOGRAPH (OCCUPIES 62% ON DESKTOP) */}
        <div className="absolute right-0 top-0 bottom-0 w-full lg:w-[62%] h-full overflow-hidden select-none z-0 bg-gradient-to-br from-[#F7ECE4] via-[#F3E5DB] to-[#EDE0D4]">
          <div 
            className="w-full h-full relative"
            style={{
              transform: `translate3d(0, ${scrollY * 0.08}px, 0) scale(${1 + scrollY * 0.00015})`,
              willChange: 'transform'
            }}
          >
            {/* Cinematic Google Flow Studio Video */}
            <video
              ref={videoRef}
              src="/videos/Skincare_products_in_beauty_studio_20261025182559.mp4"
              poster={heroImgSrc}
              autoPlay={!isReducedMotion}
              muted
              loop
              playsInline
              preload="metadata"
              onLoadedData={() => setIsVideoLoaded(true)}
              className={`w-full h-full object-cover object-[center_35%] lg:object-center filter brightness-[1.02] contrast-[1.03] transition-opacity duration-700 ${
                isVideoLoaded ? 'opacity-100' : 'opacity-90'
              }`}
            >
              <source src="/videos/Skincare_products_in_beauty_studio_20261025182559.mp4" type="video/mp4" />
              {/* Fallback image if video is not supported */}
              <img
                src={heroImgSrc}
                alt="Dew & Go Curated Cosmetics - Skincare Products in Beauty Studio"
                className="w-full h-full object-cover"
              />
            </video>

            {/* Seamless Left Edge Gradient Fade into Typography on Desktop */}
            <div className="absolute inset-y-0 left-0 w-40 sm:w-72 bg-gradient-to-r from-[#FAF5F0] via-[#FAF5F0]/85 to-transparent pointer-events-none hidden lg:block" />
            
            {/* Soft Ivory/Blush Readability Overlay on Mobile so typography and buttons pop */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#FAF5F0]/88 via-[#FAF5F0]/75 to-[#FAF5F0]/55 lg:hidden pointer-events-none" />

            {/* Top & Bottom Cinematic Edge Vignettes */}
            <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#FAF5F0] via-[#FAF5F0]/60 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-black/5 lg:bg-transparent pointer-events-none" />
          </div>

          {/* Floating Highlight Badge 1: Gokulam Express Drop */}
          <div className="absolute top-8 right-8 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 border border-[#EFE7E1] shadow-card hidden sm:flex items-center gap-3 z-10 max-w-[230px] animate-fade-in">
            <div className="w-10 h-10 rounded-full bg-burgundy/10 flex items-center justify-center text-burgundy shrink-0">
              <Bike className="w-5 h-5 text-burgundy" />
            </div>
            <div className="text-left">
              <span className="text-[11px] font-bold text-charcoal block leading-tight">
                Gokulam Express
              </span>
              <span className="text-[10px] text-muted block mt-0.5">
                30–45 Mins Hyperlocal Drop
              </span>
            </div>
          </div>

          {/* Floating Highlight Badge 2: 18-22°C Climate Stored */}
          <div className="absolute bottom-16 right-8 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 border border-[#EFE7E1] shadow-card hidden md:flex items-center gap-3 z-10 max-w-[250px] animate-fade-in">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-left">
              <span className="text-[11px] font-bold text-charcoal block leading-tight">
                18–22°C Cold Stored
              </span>
              <span className="text-[10px] text-muted block mt-0.5">
                Protects Active Retinol & Peptides
              </span>
            </div>
          </div>
        </div>

        {/* OVERLAPPING EDITORIAL TYPOGRAPHY & INTERFACE (LEFT 45-50%) */}
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 pb-32 sm:pt-12 sm:pb-24 lg:py-20 relative z-20">
          <div className="max-w-2xl space-y-5 sm:space-y-6 text-left">
            
            {/* Campaign Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white/95 border border-[#EBDCD3] shadow-xs backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-burgundy animate-ping" />
              <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] text-burgundy uppercase font-mono">
                GOKULAM, MYSURU • SPRING 2026 EDIT
              </span>
            </div>

            {/* Monumental Editorial Headline (fluid responsive scaling) */}
            <h1 className="font-editorial text-3xl xs:text-4xl sm:text-6xl md:text-7xl lg:text-7.5xl xl:text-8xl font-bold text-charcoal leading-[0.98] sm:leading-[0.94] tracking-tight drop-shadow-xs break-words">
              PURE ACTIVES. <br />
              <span className="italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-burgundy via-[#8B263E] to-[#E76F51]">
                UNFILTERED
              </span><br />
              GLOW.
            </h1>
            
            <p className="text-xs sm:text-base lg:text-lg text-charcoal/85 max-w-md font-sans leading-relaxed">
              Dermatologist-formulated barrier care, dewy clean makeup & luxury fragrance. Stored at 18–22°C in Gokulam and hand-delivered in 30–45 minutes.
            </p>

            {/* Action Buttons (stacked on mobile, inline on desktop) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 w-full max-w-md">
              <button
                onClick={() => onNavigate('/shop')}
                className="w-full sm:w-auto px-7 py-3.5 sm:px-8 sm:py-4 rounded-full bg-burgundy hover:bg-burgundy-dark text-white text-xs font-bold tracking-wider uppercase transition-all shadow-md hover:shadow-2xl hover:scale-102 flex items-center justify-center gap-3 cursor-pointer group active:scale-95"
              >
                <span>Shop The Collection</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById('scene-crown-spotlight');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-5 py-3.5 sm:px-6 sm:py-4 rounded-full bg-white/95 backdrop-blur-md hover:bg-white text-charcoal border border-[#E2D5CC] text-xs font-bold tracking-wider uppercase transition-all shadow-xs hover:border-burgundy/40 cursor-pointer text-center"
              >
                Discover Crown Formula ↓
              </button>
            </div>

            {/* Verified Shopper Proof */}
            <div className="flex items-center gap-2.5 sm:gap-3 pt-2">
              <div className="flex -space-x-2 overflow-hidden shrink-0">
                {[
                  { name: 'Pooja R.', initials: 'PR', bg: 'bg-[#982245]', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80' },
                  { name: 'Ananya N.', initials: 'AN', bg: 'bg-[#E76F51]', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80' },
                  { name: 'Dr. Shruti K.', initials: 'SK', bg: 'bg-[#2A9D8F]', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80' }
                ].map((shopper, i) => (
                  <div key={i} className="relative inline-block h-7 w-7 sm:h-8 sm:w-8 rounded-full ring-2 ring-white overflow-hidden shadow-2xs">
                    <div className={`w-full h-full ${shopper.bg} text-white flex items-center justify-center text-[9px] sm:text-[10px] font-bold select-none`}>
                      {shopper.initials}
                    </div>
                    <img
                      className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
                      src={shopper.img}
                      alt={shopper.name}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                ))}
              </div>
              <div className="text-xs leading-tight">
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <span>★★★★★</span>
                  <span className="text-charcoal text-[10px] sm:text-[11px] font-semibold">4.9 / 5.0</span>
                </div>
                <span className="text-[9px] sm:text-[10px] text-muted block truncate max-w-[210px] sm:max-w-none">2,400+ Verified Gokulam & Mysuru Orders</span>
              </div>
            </div>

          </div>
        </div>

        {/* 4 Bottom Trust Seals Bar */}
        <div className="absolute inset-x-0 bottom-0 bg-[#FAF5F0]/95 backdrop-blur-md border-t border-[#EAE0D6]/80 py-2.5 sm:py-3 z-20">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 text-left">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white border border-[#EBE1D8] flex items-center justify-center text-burgundy shadow-2xs shrink-0">
                <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-burgundy" />
              </div>
              <div className="leading-tight min-w-0">
                <span className="font-bold text-charcoal text-[10px] sm:text-[11px] block truncate">30–45 Mins</span>
                <span className="text-[9px] sm:text-[10px] text-muted block truncate">Gokulam Express Drop</span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white border border-[#EBE1D8] flex items-center justify-center text-burgundy shadow-2xs shrink-0">
                <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-burgundy" />
              </div>
              <div className="leading-tight min-w-0">
                <span className="font-bold text-charcoal text-[10px] sm:text-[11px] block truncate">100% Authentic</span>
                <span className="text-[9px] sm:text-[10px] text-muted block truncate">Direct Lab Sourcing</span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white border border-[#EBE1D8] flex items-center justify-center text-burgundy shadow-2xs shrink-0">
                <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-burgundy" />
              </div>
              <div className="leading-tight min-w-0">
                <span className="font-bold text-charcoal text-[10px] sm:text-[11px] block truncate">7-Day Return</span>
                <span className="text-[9px] sm:text-[10px] text-muted block truncate">Doorstep Rider Pickup</span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white border border-[#EBE1D8] flex items-center justify-center text-burgundy shadow-2xs shrink-0">
                <CreditCard className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-burgundy" />
              </div>
              <div className="leading-tight min-w-0">
                <span className="font-bold text-charcoal text-[10px] sm:text-[11px] block truncate">UPI & COD</span>
                <span className="text-[9px] sm:text-[10px] text-muted block truncate">Razorpay Protected</span>
              </div>
            </div>
          </div>
        </div>

      </section>


      {/* ========================================================
          SCENE 2: IMMERSIVE SCROLL TRANSITION & MANIFESTO SPREAD
      ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-[#FAF2EC] via-[#FDF7F3] to-[#F5E8E0] border border-[#EADBD1] p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-subtle">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left: Editorial Statement */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <span className="text-[10px] font-mono uppercase font-bold tracking-[0.25em] text-burgundy block">
                MANIFESTO // 01 • ZERO TRANSIT DEGRADATION
              </span>
              <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal leading-[1.08]">
                "Cosmetics lose potency in long transit. We engineered a fresh, local supply chain for Mysuru."
              </h2>
              <p className="text-xs sm:text-sm text-charcoal/80 leading-relaxed max-w-xl">
                Traditional national e-commerce shuttles active skincare across state borders in uninsulated 45°C shipping trucks for 4 to 7 days, degrading delicate vitamin C, retinol, and peptide bonds. Dew & Go receives direct cold shipments into our Gokulam climate-controlled hub and hand-delivers in under 45 minutes.
              </p>
              
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold text-charcoal">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>18–22°C Regulated Hub</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-charcoal">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>100% Brand-Direct Batch Transparency</span>
                </div>
              </div>
            </div>

            {/* Right: Layered Photographic Showcase */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-[#E8DAD0] shadow-card bg-[#FAF7F4]">
                <img
                  src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1000&q=85"
                  alt="Dew & Go Laboratory Preserved Cosmetics"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-xl p-3 border border-[#E8DAD0] shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-charcoal block">Lab Batch #DG-2026-MYS</span>
                    <span className="text-[10px] text-muted block">Direct Delivery from Gokulam Hub</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* ========================================================
          SCENE 3: 3D DIMENSIONAL FEATURED COSMETICS SHOWCASE
          (The Crown Formula with True 3D Cursor Tilt & Depth Layering)
      ======================================================== */}
      <section id="scene-crown-spotlight" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-1.5">
          <span className="text-[10px] font-mono uppercase font-bold tracking-[0.25em] text-burgundy block">
            CROWN SPOTLIGHT // 02
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal">
            The Golden Standard Formula
          </h2>
          <p className="text-xs sm:text-sm text-charcoal/70">
            Hover and move your cursor across the card to inspect our highest-rated barrier repair cleanser in 3D perspective.
          </p>
        </div>

        {/* 3D Tilt Stage Container */}
        {starProduct && (
          <div 
            ref={spotlightRef}
            style={{
              ...spotlightTiltStyle,
              transformStyle: 'preserve-3d'
            }}
            className="relative rounded-3xl bg-white border border-[#EAE0D6] p-5 sm:p-8 lg:p-12 shadow-card grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center cursor-default transition-shadow duration-300 hover:shadow-2xl"
          >
            {/* Left Column: Product Image with 3D Depth Layering (translateZ: 50px) */}
            <div className="lg:col-span-5 flex items-center justify-center relative" style={{ transformStyle: 'preserve-3d' }}>
              <div 
                style={{ transform: 'translateZ(50px)' }}
                className="relative w-full max-w-[240px] sm:max-w-[280px] lg:max-w-[340px] aspect-square rounded-2xl bg-gradient-to-b from-[#FBF6F2] to-[#F5ECE5] border border-[#EAE0D6] p-4 sm:p-6 flex items-center justify-center shadow-inner overflow-hidden"
              >
                <ProductImage
                  src={starProduct.images?.[0] || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80'}
                  alt={starProduct.name}
                  brand={starProduct.brand}
                  category={starProduct.category}
                  className="w-full h-full object-contain filter drop-shadow-2xl hover:scale-106 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-[#FEF3EB] text-[#C25E1A] px-2 sm:px-2.5 py-0.5 sm:py-1 rounded text-[9px] sm:text-[10px] font-bold tracking-wide shadow-2xs z-10">
                  ★ Mysuru's #1 Bestseller
                </span>
              </div>
            </div>

            {/* Right Column: Active Ingredients & Direct Buy (translateZ: 25px) */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-5 text-left" style={{ transform: 'translateZ(25px)' }}>
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-[11px] font-bold text-burgundy uppercase tracking-wider bg-burgundy/5 px-2.5 py-1 rounded-md">
                  {starProduct.brand}
                </span>
                <span className="text-xs font-semibold text-muted">
                  {starProduct.category}
                </span>
              </div>

              <h3 className="font-editorial text-2xl sm:text-3xl lg:text-4xl font-bold text-charcoal">
                {starProduct.name}
              </h3>

              <p className="text-xs sm:text-sm text-charcoal/80 leading-relaxed max-w-xl">
                {starProduct.description}
              </p>

              {/* Active Ingredients Tags */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-mono uppercase font-bold text-muted tracking-wider block">
                  Active Formulation Profile:
                </span>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {[
                    '3 Essential Ceramides (1, 3, 6-II)',
                    'Pure Hyaluronic Acid Deep Moisture',
                    'MVE 24-Hour Controlled Release',
                    'Non-Comedogenic & Fragrance Free'
                  ].map((ing, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-[#FAF5F2] border border-[#EAE0D7] text-[10px] sm:text-[11px] font-medium text-charcoal shadow-2xs"
                    >
                      <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{ing}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Price Row & Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[#F2ECE5] w-full">
                <div className="flex items-center justify-between sm:justify-start gap-4">
                  <div>
                    <span className="text-[10px] text-muted block uppercase font-semibold">Special Selling Price</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl sm:text-2xl font-bold text-charcoal">₹{starProduct.defaultPrice}</span>
                      {starProduct.defaultOriginalPrice && (
                        <span className="text-xs sm:text-sm text-muted line-through">₹{starProduct.defaultOriginalPrice}</span>
                      )}
                      {starProduct.defaultDiscount && (
                        <span className="bg-[#E8F7EE] text-[#137333] text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded">
                          {starProduct.defaultDiscount}% OFF
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Stepper (enforcing minimum 1 and stock ceiling) */}
                  <div className="flex items-center border border-[#EAE0D6] rounded-full px-2 py-1 bg-white shrink-0">
                    <button
                      type="button"
                      onClick={() => setSpotlightQuantity(prev => Math.max(1, prev - 1))}
                      disabled={spotlightQuantity <= 1}
                      aria-label="Decrease quantity"
                      className="w-7 h-7 flex items-center justify-center text-charcoal hover:text-burgundy font-bold text-sm cursor-pointer disabled:opacity-40"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-charcoal">
                      {spotlightQuantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const primaryVariant = starProduct.variants?.[0];
                        const maxStock = primaryVariant?.stockQuantity ?? 10;
                        setSpotlightQuantity(prev => Math.min(maxStock, prev + 1));
                      }}
                      aria-label="Increase quantity"
                      className="w-7 h-7 flex items-center justify-center text-charcoal hover:text-burgundy font-bold text-sm cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto sm:ml-auto">
                  <button
                    onClick={() => {
                      if (!starProduct) return;
                      const primaryVariant = starProduct.variants?.[0] || {
                        id: `${starProduct.id}-default`,
                        variantName: 'Standard',
                        price: starProduct.defaultPrice || 399,
                        sku: starProduct.id,
                        stockQuantity: 15
                      };
                      const availableStock = primaryVariant.stockQuantity ?? 15;
                      if (availableStock <= 0) {
                        alert('This formula is currently out of stock.');
                        return;
                      }
                      const qtyToAdd = Math.min(Math.max(1, spotlightQuantity), availableStock);
                      const res = addToCart(starProduct, primaryVariant, qtyToAdd);
                      if (res.success) {
                        setSpotlightAdded(true);
                        setTimeout(() => setSpotlightAdded(false), 2000);
                      } else {
                        alert(res.message || 'Failed to add item to bag');
                      }
                    }}
                    className={`px-6 sm:px-8 py-3 rounded-full text-xs font-bold tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                      spotlightAdded
                        ? 'bg-emerald-700 text-white'
                        : 'bg-burgundy hover:bg-burgundy-dark text-white'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{spotlightAdded ? 'Added to Bag!' : 'Add to Bag'}</span>
                  </button>
                  <button
                    onClick={() => onNavigate(`/product/${starProduct.slug}`)}
                    className="px-5 py-3 rounded-full bg-white hover:bg-[#FAF7F4] text-charcoal border border-[#EAE0D6] text-xs font-bold transition-colors cursor-pointer text-center"
                  >
                    View Full Specs
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}
      </section>


      {/* ========================================================
          SCENE 4: IMAGE-LED BEAUTY CATEGORIES GALLERY
          (Large, Architectural Editorial Department Cards)
      ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-3 border-b border-[#F0EAE8] gap-2 text-left">
          <div>
            <span className="text-[10px] font-mono uppercase font-bold tracking-[0.25em] text-burgundy block">
              DEPARTMENTS // 03 • CURATED BEAUTY DISCIPLINES
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-charcoal tracking-tight mt-0.5">
              Explore The Beauty Categories
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/shop')}
            className="text-xs font-bold text-burgundy hover:underline flex items-center gap-1 group cursor-pointer"
          >
            <span>View Complete Catalogue</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* 6 Large Editorial Department Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {editorialDepartments.map((dept, idx) => (
            <div
              key={idx}
              onClick={() => onNavigate(dept.route)}
              className="group relative rounded-3xl overflow-hidden bg-white border border-[#EAE0D6] shadow-subtle hover:shadow-card cursor-pointer transition-all duration-300 flex flex-col justify-between h-84"
            >
              {/* High-Resolution Background Photography with Editorial Fallback */}
              <div className="absolute inset-0 z-0 overflow-hidden bg-gradient-to-br from-[#68192E] via-[#4A1221] to-[#2E0B14]">
                <img
                  src={dept.image}
                  alt={dept.name}
                  loading="eager"
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/40 to-black/20" />
              </div>

              {/* Department Index Tag */}
              <div className="relative z-10 p-6 flex justify-between items-center text-white">
                <span className="font-mono text-xs font-bold tracking-widest px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md">
                  {dept.code}
                </span>
                <span className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-burgundy transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>

              {/* Department Label & Count */}
              <div className="relative z-10 p-6 space-y-1 text-left">
                <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-white group-hover:text-rose-200 transition-colors">
                  {dept.name}
                </h3>
                <p className="text-xs text-white/80 font-medium">
                  {dept.subtitle}
                </p>
                <span className="text-[10px] font-mono uppercase text-rose-200/90 font-bold tracking-wider block pt-1">
                  {dept.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* ========================================================
          SCENE 5: CURATED BESTSELLERS CATALOGUE
          (Interactive Category Filters + 5-Column Responsive Cards)
      ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-3 border-b border-[#F0EAE8] gap-4 text-left">
          <div>
            <span className="text-[10px] font-mono uppercase font-bold tracking-[0.25em] text-burgundy block">
              SELECTION // 04 • MYSURU'S DAILY ESSENTIALS
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-charcoal tracking-tight mt-0.5">
              Curated Bestsellers
            </h2>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: 'all', label: 'All Bestsellers' },
              { id: 'skincare', label: 'Skincare' },
              { id: 'makeup', label: 'Makeup' },
              { id: 'haircare', label: 'Haircare' },
              { id: 'offers', label: 'Special Offers' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveBestsellerCategory(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeBestsellerCategory === tab.id
                    ? 'bg-burgundy text-white shadow-xs'
                    : 'bg-white text-charcoal/80 border border-[#EAE2DC] hover:border-burgundy/40 hover:bg-[#FAF7F4]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 5-Column Responsive Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4.5">
          {filteredBestsellers.map(product => (
            <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
          ))}
        </div>
      </section>


      {/* ========================================================
          SCENE 6: BRAND STORY & GOKULAM HYPERLOCAL HUB
          (Layered Photography + Live PIN-Code Serviceability Checker)
      ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Left Banner: Botanical Skincare Essentials */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#EAEFEA] to-[#DFE8DF] border border-[#D5E0D5] p-8 sm:p-10 flex flex-col justify-between min-h-[260px] shadow-subtle group text-left">
            <div className="relative z-10 max-w-sm space-y-3">
              <span className="text-[10px] font-bold tracking-widest text-emerald-800 uppercase block">
                LAB-VERIFIED CLEAN FORMULAS
              </span>
              <h3 className="font-editorial text-3xl sm:text-4xl text-charcoal font-bold leading-tight">
                Skincare Essentials <br />
                for Healthy, Radiant Skin
              </h3>
              <p className="text-xs text-charcoal/75 leading-relaxed">
                Clean, non-comedogenic ingredients tested for high humidity and tropical sun.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => onNavigate('/category/skincare')}
                  className="px-6 py-3 rounded-full bg-burgundy hover:bg-burgundy-dark text-white text-xs font-bold transition-all shadow-sm inline-flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>Shop Skincare Essentials</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-90 pointer-events-none overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1556228722-d0b5de731748?auto=format&fit=crop&w=600&q=80"
                alt="Skincare Essentials"
                className="w-full h-full object-cover object-left group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          {/* Right Banner: Gokulam Hyperlocal Express Delivery & Interactive Checker */}
          <div className="relative rounded-2xl overflow-hidden bg-burgundy text-white p-8 sm:p-10 flex flex-col justify-between min-h-[260px] shadow-card group text-left">
            
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
                  <Bike className="w-5 h-5 text-rose-200" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-rose-200 block">
                    HYPERLOCAL EXPRESS SERVICE
                  </span>
                  <h3 className="font-editorial text-2xl sm:text-3xl font-bold leading-snug">
                    Same-Day Delivery in Gokulam, Mysuru
                  </h3>
                </div>
              </div>

              {/* Interactive PIN Code Serviceability Test */}
              <form onSubmit={handleTestPincode} className="pt-1">
                <div className="flex items-center gap-2 max-w-sm">
                  <input
                    type="text"
                    maxLength={6}
                    value={pincodeInput}
                    onChange={(e) => setPincodeInput(e.target.value)}
                    placeholder="Enter 6-digit PIN code"
                    className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-xs text-white placeholder:text-white/60 focus:bg-white/20 focus:outline-none focus:ring-1 focus:ring-rose-300 font-mono tracking-wider"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-white text-burgundy text-xs font-bold hover:bg-rose-100 transition-colors cursor-pointer shrink-0"
                  >
                    Check
                  </button>
                </div>
                {pincodeResult.tested && (
                  <div className="mt-2 text-[11px] flex items-center gap-1.5 text-rose-100 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{pincodeResult.message} • <strong>{pincodeResult.speed}</strong></span>
                  </div>
                )}
              </form>

              {/* 3 Value Pillars */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] font-medium text-white/90 border-t border-white/10">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-rose-300 stroke-[3] shrink-0" />
                  <span>100% Authentic</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-rose-300 stroke-[3] shrink-0" />
                  <span>Cold Packed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-rose-300 stroke-[3] shrink-0" />
                  <span>30–45 Mins</span>
                </div>
              </div>
            </div>

            {/* Mysuru Palace Watermark / Architectural Graphic */}
            <div className="absolute right-2 bottom-0 opacity-15 pointer-events-none select-none">
              <svg className="w-52 h-36 fill-white" viewBox="0 0 100 60">
                <path d="M10 50 L15 30 L20 30 L25 20 L30 30 L35 30 L40 50 Z M45 50 L48 25 L52 10 L56 25 L60 50 Z M65 50 L70 30 L75 30 L80 20 L85 30 L90 50 Z" />
                <rect x="5" y="50" width="90" height="8" rx="2" />
              </svg>
            </div>

          </div>

        </div>
      </section>


      {/* ========================================================
          SCENE 7: FINAL CAMPAIGN INVITATION & WELCOME REWARD
      ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-burgundy via-[#6E1832] to-[#8A2440] text-white p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-card text-left">
          <div className="relative z-10 max-w-xl space-y-4">
            <span className="text-[10px] uppercase font-bold tracking-widest text-rose-200 block">
              WELCOME OFFER • 20% OFF FIRST ORDER
            </span>
            <h2 className="font-editorial text-3xl sm:text-5xl font-bold leading-tight">
              Ready to Experience Real, Dewy Skin?
            </h2>
            <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
              Use code <strong className="text-rose-200 bg-white/10 px-2 py-0.5 rounded font-mono">DEWGLOW20</strong> at checkout for 20% off your entire first routine with free express delivery in Gokulam.
            </p>
            <div className="pt-3 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate('/shop')}
                className="px-8 py-3.5 rounded-full bg-white text-burgundy hover:bg-rose-50 text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Explore Full Catalogue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('/offers')}
                className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/25 text-xs font-bold transition-colors cursor-pointer"
              >
                View Seasonal Offers
              </button>
            </div>
          </div>

          <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-white/5 rounded-full pointer-events-none" />
          <div className="absolute right-40 top-0 w-60 h-60 bg-white/5 rounded-full pointer-events-none" />
        </div>
      </section>

    </div>
  );
};
