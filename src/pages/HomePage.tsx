import React, { useState } from 'react';
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
import { CategoryImage } from '../components/common/CategoryImage';
import { store } from '../lib/store';
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
  const allProducts = store.getPublishedProducts();
  const scrollY = useScrollParallax();

  // 3D Tilt for Spotlight Card
  const { ref: spotlightRef, style: spotlightTiltStyle } = useTilt<HTMLDivElement>({
    max: 10,
    scale: 1.02,
    perspective: 1200
  });

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

  // Flagship bestsellers matching actual catalogue
  const flagshipBestsellers = [
    allProducts.find(p => p.id === 'prod-cerave-hydrating') || allProducts[0],
    allProducts.find(p => p.id === 'prod-minimalist-nia') || allProducts[1],
    allProducts.find(p => p.id === 'prod-loreal-revitalift') || allProducts[2],
    allProducts.find(p => p.id === 'prod-maybelline-skyhigh') || allProducts[3],
    allProducts.find(p => p.id === 'prod-ordinary-ha') || allProducts[4],
  ].filter(Boolean) as Product[];

  // Filtered bestsellers based on user tab selection
  const filteredBestsellers = activeBestsellerCategory === 'all'
    ? flagshipBestsellers
    : allProducts.filter(p => {
        if (activeBestsellerCategory === 'skincare') return p.category.toLowerCase().includes('skin') || p.category.toLowerCase().includes('serum');
        if (activeBestsellerCategory === 'makeup') return p.category.toLowerCase().includes('make') || p.category.toLowerCase().includes('lip');
        if (activeBestsellerCategory === 'haircare') return p.category.toLowerCase().includes('hair');
        if (activeBestsellerCategory === 'offers') return p.defaultDiscount && p.defaultDiscount >= 18;
        return true;
      }).slice(0, 5);

  // Crown Star Product for 3D Dimensional Spotlight
  const starProduct = allProducts.find(p => p.id === 'prod-cerave-hydrating') || allProducts[0];

  // 8 Circular Categories with high-res, verified photography and bulletproof fallbacks
  const categoryCircles = [
    {
      code: '01',
      name: 'Skincare',
      count: '24+ Items',
      route: '/category/skincare',
      image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=400&q=80',
    },
    {
      code: '02',
      name: 'Makeup',
      count: '18+ Items',
      route: '/category/makeup',
      image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=400&q=80',
    },
    {
      code: '03',
      name: 'Haircare',
      count: '12+ Items',
      route: '/category/haircare',
      image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=400&q=80',
    },
    {
      code: '04',
      name: 'Fragrance',
      count: '10+ Items',
      route: '/category/fragrance',
      image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=400&q=80',
    },
    {
      code: '05',
      name: 'Bath & Body',
      count: '14+ Items',
      route: '/category/bath-body',
      image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=400&q=80',
    },
    {
      code: '06',
      name: 'Beauty Tools',
      count: '8+ Items',
      route: '/category/beauty-tools',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80',
    },
    {
      code: '07',
      name: 'New Arrivals',
      count: '16+ Drops',
      route: '/shop',
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=400&q=80',
    },
    {
      code: '08',
      name: 'Offers',
      count: 'Up to 40% Off',
      route: '/offers',
      isOfferBadge: true,
    },
  ];

  // The 4-Step Dewy Routine products (Cleanse -> Treat -> Moisturize -> Shield)
  const routineSteps = [
    {
      step: '01',
      phase: 'Cleanse',
      title: 'Hydrating Ceramide Cleanser',
      brand: 'CeraVe',
      desc: 'Restores the delicate barrier with 3 essential ceramides while washing away urban dust.',
      price: '₹899',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
      product: allProducts.find(p => p.id === 'prod-cerave-hydrating') || allProducts[0],
      benefits: ['Gentle Non-Foaming', 'Hyaluronic Hydration', 'Preserves Lipids']
    },
    {
      step: '02',
      phase: 'Treat',
      title: 'Niacinamide 10% + Zinc 1%',
      brand: 'Minimalist',
      desc: 'Targeted serum to fade post-acne blemishes, tighten pores, and regulate excess sebum.',
      price: '₹549',
      image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
      product: allProducts.find(p => p.id === 'prod-minimalist-nia') || allProducts[1],
      benefits: ['Balances Oil', 'Fades Dark Spots', 'Soothes Redness']
    },
    {
      step: '03',
      phase: 'Nourish',
      title: 'Revitalift Hyaluronic Plump Cream',
      brand: "L'Oréal Paris",
      desc: 'Concentrated micro-hyaluronic day gel-cream that locks moisture for 24-hour velvet bounce.',
      price: '₹799',
      image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&q=80',
      product: allProducts.find(p => p.id === 'prod-loreal-revitalift') || allProducts[2],
      benefits: ['Micro-HA Plumping', 'Glass Skin Radiance', 'Non-Greasy Base']
    },
    {
      step: '04',
      phase: 'Shield',
      title: 'Invisible Water Gel Sunscreen SPF 50+',
      brand: 'Sol Shield Lab',
      desc: 'Ultralight broad-spectrum PA++++ protection with 0% white cast, perfected for Karnataka heat.',
      price: '₹499',
      image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80',
      product: allProducts.find(p => p.id === 'prod-003') || allProducts[3],
      benefits: ['Zero White Cast', 'Photostable Tinosorb', 'Sweat Resistant']
    }
  ];

  const handleAddRoutineProduct = (prod: Product, stepName: string) => {
    if (!prod) return;
    const res = addToCart(prod, prod.variants[0], 1);
    if (res.success) {
      setRoutineAddedNotification(`Added ${prod.name} (${stepName}) to your bag!`);
      setTimeout(() => setRoutineAddedNotification(null), 2500);
    }
  };

  return (
    <div className="space-y-20 sm:space-y-28 pb-28 overflow-x-hidden bg-[#FCFAF8] text-charcoal">
      
      {/* ========================================================
          SCENE A: CINEMATIC LAYERED HERO (SELENE-INSPIRED DEPTH)
      ======================================================== */}
      <section className="relative min-h-[92vh] lg:min-h-[94vh] flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#FDF9F6] via-[#FAF3ED] to-[#F7ECE4] border-b border-[#EDE0D6]">
        
        {/* Parallax Background Aura Layer */}
        <div 
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{ transform: `translate3d(0, ${scrollY * 0.12}px, 0)` }}
        >
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-gradient-to-tr from-rose-200/40 via-peach-100/35 to-burgundy/10 rounded-full blur-3xl opacity-75" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-rose-300/20 rounded-full blur-2xl" />
        </div>

        {/* Floating Top Editorial Metadata Bar */}
        <div className="relative z-20 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 flex items-center justify-between text-[11px] font-mono tracking-widest uppercase text-charcoal/60">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-burgundy animate-ping" />
            <span className="font-bold text-burgundy">Gokulam Hub // Mysuru Express</span>
          </div>
          <div className="hidden sm:flex items-center gap-6">
            <span>Lat 12.3375° N • Long 76.6346° E</span>
            <span>Temperature: 18–22°C Cold Stored</span>
          </div>
        </div>

        {/* Central Stage: Dominant Editorial Composition with Overlapping Typography */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-12 flex-1 flex flex-col justify-center items-center text-center">
          
          {/* Campaign Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/85 backdrop-blur-md border border-[#EBE0D8] shadow-xs mb-6">
            <Sparkles className="w-3.5 h-3.5 text-burgundy" />
            <span className="text-[11px] font-bold tracking-[0.2em] text-burgundy uppercase">
              DEW & GO • AUTONOMOUS BEAUTY EDIT 2026
            </span>
          </div>

          {/* Monumental Editorial Headline */}
          <div className="relative max-w-5xl mx-auto">
            <h1 className="font-editorial text-5xl sm:text-7xl lg:text-8.5xl xl:text-9xl font-bold tracking-tight text-charcoal leading-[0.96] select-none">
              THE ART OF <br />
              <span className="italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-burgundy via-[#8B263E] to-[#E76F51]">
                CONFIDENT
              </span>{' '}
              GLOW.
            </h1>
          </div>

          {/* Supporting Narrative */}
          <p className="mt-6 text-sm sm:text-base lg:text-lg text-charcoal/80 max-w-xl mx-auto leading-relaxed font-sans">
            Curated clinical actives, sensorial formulations & clean dewy textures. Stored under laboratory conditions and delivered to your doorstep in Gokulam, Mysuru in 30–45 minutes.
          </p>

          {/* Primary Action Group */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <button
              onClick={() => onNavigate('/shop')}
              className="px-9 py-4 rounded-full bg-burgundy hover:bg-burgundy-dark text-white text-xs font-bold tracking-wider uppercase transition-all shadow-md hover:shadow-xl hover:scale-102 flex items-center gap-3 cursor-pointer group active:scale-95"
            >
              <span>Explore The Collection</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('scene-star-spotlight');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-7 py-4 rounded-full bg-white/90 backdrop-blur-md hover:bg-white text-charcoal border border-[#E2D5CC] text-xs font-bold tracking-wider uppercase transition-all shadow-xs hover:border-burgundy/40 cursor-pointer"
            >
              Discover Star Formula ↓
            </button>
          </div>

          {/* Social Proof Review Indicator */}
          <div className="flex items-center gap-3 mt-8 pt-4 border-t border-[#EAE0D6]/80">
            <div className="flex -space-x-2 overflow-hidden">
              <img
                className="inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover"
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                alt="Shopper"
              />
              <img
                className="inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover"
                src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80"
                alt="Shopper"
              />
              <img
                className="inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover"
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
                alt="Shopper"
              />
            </div>
            <div className="text-left text-xs">
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <span>★★★★★</span>
                <span className="text-charcoal text-[11px] font-semibold">4.9 / 5.0</span>
              </div>
              <span className="text-[10px] text-muted">2,400+ Verified Gokulam & Mysuru Orders</span>
            </div>
          </div>

        </div>

        {/* 4 Bottom Trust Seals */}
        <div className="relative z-20 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-[#EAE0D6]/70">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white border border-[#EBE1D8] flex items-center justify-center text-burgundy shadow-2xs shrink-0">
                <Zap className="w-3.5 h-3.5 text-burgundy" />
              </div>
              <div className="leading-tight text-left">
                <span className="font-bold text-charcoal text-[11px] block">30–45 Mins</span>
                <span className="text-[10px] text-muted">Gokulam Express Drop</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white border border-[#EBE1D8] flex items-center justify-center text-burgundy shadow-2xs shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-burgundy" />
              </div>
              <div className="leading-tight text-left">
                <span className="font-bold text-charcoal text-[11px] block">100% Authentic</span>
                <span className="text-[10px] text-muted">Direct Lab Sourcing</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white border border-[#EBE1D8] flex items-center justify-center text-burgundy shadow-2xs shrink-0">
                <RotateCcw className="w-3.5 h-3.5 text-burgundy" />
              </div>
              <div className="leading-tight text-left">
                <span className="font-bold text-charcoal text-[11px] block">7-Day Return</span>
                <span className="text-[10px] text-muted">Doorstep Rider Pickup</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white border border-[#EBE1D8] flex items-center justify-center text-burgundy shadow-2xs shrink-0">
                <CreditCard className="w-3.5 h-3.5 text-burgundy" />
              </div>
              <div className="leading-tight text-left">
                <span className="font-bold text-charcoal text-[11px] block">UPI & COD</span>
                <span className="text-[10px] text-muted">Razorpay Protected</span>
              </div>
            </div>
          </div>
        </div>

      </section>


      {/* ========================================================
          SCENE B: THE BEAUTY MANIFESTO TRANSITION SPREAD
      ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-[#FAF2EC] via-[#FDF7F3] to-[#F5E8E0] border border-[#EADBD1] p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-subtle">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left: Editorial Statement */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <span className="text-[10px] font-mono uppercase font-bold tracking-[0.25em] text-burgundy block">
                MANIFESTO // 01 • FRESHNESS PRESERVATION
              </span>
              <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal leading-[1.08]">
                "Cosmetics lose potency in long transit. We engineered a fresh, local supply chain for Mysuru."
              </h2>
              <p className="text-xs sm:text-sm text-charcoal/80 leading-relaxed max-w-xl">
                Traditional national e-commerce shuttles active skincare across state borders in uninsulated 45°C shipping trucks for 4 to 7 days, degrading delicate vitamin C, retinol, and peptide bonds. Dew & Go receives direct cold shipments into our Gokulam climate-controlled hub and hand-delivers in under 45 minutes.
              </p>
              
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold text-charcoal">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>18–22°C Preserved Actives</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-charcoal">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Zero Oxidation Guarantee</span>
                </div>
              </div>
            </div>

            {/* Right: Layered Photographic Showcase */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-[#E8DAD0] shadow-card bg-[#FAF7F4]">
                <img
                  src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=85"
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
          SCENE C: 3D DIMENSIONAL PRODUCT SPOTLIGHT (CROWN FORMULA)
      ======================================================== */}
      <section id="scene-star-spotlight" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-1.5">
          <span className="text-[10px] font-mono uppercase font-bold tracking-[0.25em] text-burgundy block">
            CROWN SPOTLIGHT // 02
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal">
            The Golden Standard Formula
          </h2>
          <p className="text-xs sm:text-sm text-charcoal/70">
            Move your cursor across the card to inspect our highest-rated barrier repair cleanser.
          </p>
        </div>

        {/* 3D Tilt Stage Container */}
        <div 
          ref={spotlightRef}
          style={spotlightTiltStyle}
          className="relative rounded-3xl bg-white border border-[#EAE0D6] p-6 sm:p-10 lg:p-12 shadow-card grid grid-cols-1 lg:grid-cols-12 gap-8 items-center cursor-default transition-shadow duration-300 hover:shadow-2xl"
        >
          {/* Left Column: Product Image in 3D Perspective */}
          <div className="lg:col-span-5 flex items-center justify-center relative">
            <div className="relative w-72 h-72 sm:w-84 sm:h-84 rounded-2xl bg-gradient-to-b from-[#FBF6F2] to-[#F5ECE5] border border-[#EAE0D6] p-6 flex items-center justify-center shadow-inner overflow-hidden">
              <img
                src={starProduct.images[0]}
                alt={starProduct.name}
                className="w-full h-full object-contain filter drop-shadow-xl hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-4 left-4 bg-[#FEF3EB] text-[#C25E1A] px-2.5 py-1 rounded text-[10px] font-bold tracking-wide shadow-2xs">
                ★ Mysuru's #1 Bestseller
              </span>
            </div>
          </div>

          {/* Right Column: Active Ingredients & Direct Buy */}
          <div className="lg:col-span-7 space-y-5 text-left">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-burgundy uppercase tracking-wider bg-burgundy/5 px-2.5 py-1 rounded-md">
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
                Active Ingredient Profile:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  '3 Essential Ceramides (1, 3, 6-II)',
                  'Pure Hyaluronic Acid',
                  'MVE 24-Hour Controlled Release',
                  'Non-Comedogenic & Fragrance Free'
                ].map((ing, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5F2] border border-[#EAE0D7] text-[11px] font-medium text-charcoal"
                  >
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>{ing}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Price Row & Action */}
            <div className="flex items-center gap-6 pt-4 border-t border-[#F2ECE5] flex-wrap">
              <div>
                <span className="text-[10px] text-muted block uppercase font-semibold">Special Selling Price</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-charcoal">₹{starProduct.defaultPrice}</span>
                  {starProduct.defaultOriginalPrice && (
                    <span className="text-sm text-muted line-through">₹{starProduct.defaultOriginalPrice}</span>
                  )}
                  {starProduct.defaultDiscount && (
                    <span className="bg-[#E8F7EE] text-[#137333] text-xs font-bold px-2 py-0.5 rounded">
                      {starProduct.defaultDiscount}% OFF
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const res = addToCart(starProduct, starProduct.variants[0], 1);
                    if (res.success) {
                      setRoutineAddedNotification(`Added ${starProduct.name} to your bag!`);
                      setTimeout(() => setRoutineAddedNotification(null), 2500);
                    }
                  }}
                  className="px-8 py-3 rounded-full bg-burgundy hover:bg-burgundy-dark text-white text-xs font-bold tracking-wider uppercase transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag</span>
                </button>
                <button
                  onClick={() => onNavigate(`/product/${starProduct.slug}`)}
                  className="px-5 py-3 rounded-full bg-white hover:bg-[#FAF7F4] text-charcoal border border-[#EAE0D6] text-xs font-bold transition-colors cursor-pointer"
                >
                  View Details
                </button>
              </div>
            </div>

            {routineAddedNotification && (
              <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-lg inline-flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>{routineAddedNotification}</span>
              </div>
            )}

          </div>

        </div>
      </section>


      {/* ========================================================
          SCENE D: THE 4-STEP DEWY ROUTINE (CONNECTED STORYTELLING)
      ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-[#FAF3EE] via-[#FDF7F4] to-[#F5ECE5] border border-[#ECDCD3] p-6 sm:p-10 lg:p-12 shadow-card relative overflow-hidden">
          
          <div className="max-w-2xl space-y-2 mb-8 text-left">
            <span className="text-[10px] font-mono uppercase font-bold tracking-[0.25em] text-burgundy block">
              RITUAL // 03 • SYSTEMIC BARRIER DEFENSE
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal tracking-tight">
              The 4-Step Dewy Routine
            </h2>
            <p className="text-xs sm:text-sm text-charcoal/75 leading-relaxed">
              Formulated to counter high-UV and urban humidity in Mysuru. Each step locks moisture without clogging pores.
            </p>
          </div>

          {/* Routine Steps Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
            {routineSteps.map((step, idx) => (
              <button
                key={idx}
                onClick={() => setActiveRoutineStep(idx)}
                className={`p-4 rounded-2xl text-left transition-all border cursor-pointer ${
                  activeRoutineStep === idx
                    ? 'bg-white border-burgundy shadow-md scale-102'
                    : 'bg-white/60 border-[#EBDCD3] hover:bg-white hover:border-burgundy/30'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[11px] font-mono font-bold ${
                    activeRoutineStep === idx ? 'text-burgundy' : 'text-muted'
                  }`}>
                    STEP {step.step}
                  </span>
                  <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    activeRoutineStep === idx ? 'bg-burgundy/10 text-burgundy' : 'bg-warmcream text-muted'
                  }`}>
                    {step.phase}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-charcoal line-clamp-1">
                  {step.title}
                </h4>
                <span className="text-[11px] text-muted font-medium mt-1 block">
                  {step.brand}
                </span>
              </button>
            ))}
          </div>

          {/* Active Step Deep-Dive Showcase */}
          {(() => {
            const current = routineSteps[activeRoutineStep];
            return (
              <div className="bg-white rounded-2xl border border-[#EAE0D7] p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center shadow-subtle">
                <div className="md:col-span-5 flex items-center justify-center">
                  <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-2xl overflow-hidden bg-[#FAF7F4] p-3 border border-[#EFE7E1]">
                    <img
                      src={current.image}
                      alt={current.title}
                      className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>

                <div className="md:col-span-7 space-y-4 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-burgundy uppercase tracking-wider bg-burgundy/5 px-2.5 py-1 rounded-md">
                      STEP {current.step} • {current.phase.toUpperCase()}
                    </span>
                    <span className="text-xs font-semibold text-muted">
                      {current.brand}
                    </span>
                  </div>

                  <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-charcoal">
                    {current.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-charcoal/80 leading-relaxed max-w-lg">
                    {current.desc}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {current.benefits.map((b, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5F2] border border-[#EAE0D7] text-[11px] font-medium text-charcoal"
                      >
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>{b}</span>
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 pt-3 border-t border-[#F2ECE5]">
                    <div>
                      <span className="text-[10px] text-muted block uppercase font-semibold">Price</span>
                      <span className="text-xl font-bold text-charcoal">{current.price}</span>
                    </div>

                    <button
                      onClick={() => handleAddRoutineProduct(current.product, current.phase)}
                      className="px-6 py-2.5 rounded-full bg-burgundy hover:bg-burgundy-dark text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add to Bag</span>
                    </button>

                    <button
                      onClick={() => onNavigate(`/product/${current.product.slug}`)}
                      className="text-xs font-bold text-charcoal hover:text-burgundy underline cursor-pointer"
                    >
                      View Details
                    </button>
                  </div>
                </div>

              </div>
            );
          })()}

        </div>
      </section>


      {/* ========================================================
          SCENE E: SHOP BY CATEGORY (EDITORIAL DEPARTMENT TILES)
      ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-3 border-b border-[#F0EAE8] gap-2">
          <div>
            <span className="text-[10px] font-mono uppercase font-bold tracking-[0.25em] text-burgundy block">
              DEPARTMENTS // 04
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-charcoal tracking-tight mt-0.5">
              Explore Curated Categories
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/shop')}
            className="text-xs font-bold text-burgundy hover:underline flex items-center gap-1 group cursor-pointer"
          >
            <span>View All Categories</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* 8 Circular Discovery Avatars with High-Res Photography & Rock-Solid Fallback */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 sm:gap-6 text-center">
          {categoryCircles.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => onNavigate(cat.route)}
              className="flex flex-col items-center gap-2.5 group cursor-pointer focus:outline-none"
            >
              <div className="w-18 h-18 sm:w-22 sm:h-22 lg:w-24 lg:h-24 rounded-full bg-[#FAF3EE] border-2 border-[#F3E3DA] p-1 flex items-center justify-center shadow-subtle group-hover:scale-108 group-hover:border-burgundy/60 group-hover:shadow-md transition-all duration-300 relative overflow-hidden">
                <CategoryImage
                  src={cat.image}
                  alt={cat.name}
                  name={cat.name}
                  isOfferBadge={cat.isOfferBadge}
                />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-charcoal group-hover:text-burgundy transition-colors block">
                  {cat.name}
                </span>
                <span className="text-[10px] text-muted block group-hover:text-charcoal/80 transition-colors">
                  {cat.count}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>


      {/* ========================================================
          SCENE F: CURATED BESTSELLERS CATALOGUE
      ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-3 border-b border-[#F0EAE8] gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase font-bold tracking-[0.25em] text-burgundy block">
              SELECTION // 05 • MYSURU'S DAILY ESSENTIALS
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
          SCENE G: GOKULAM HYPERLOCAL HUB & SERVICEABILITY CHECKER
      ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Left Banner: Botanical Skincare Essentials */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#EAEFEA] to-[#DFE8DF] border border-[#D5E0D5] p-8 sm:p-10 flex flex-col justify-between min-h-[260px] shadow-subtle group">
            <div className="relative z-10 max-w-sm space-y-3 text-left">
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
          SCENE H: FINAL INVITATION & WELCOME CODE
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
