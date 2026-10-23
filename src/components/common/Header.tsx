import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  User, 
  MapPin, 
  Clock, 
  ChevronDown, 
  ChevronRight,
  X, 
  Menu, 
  Sparkles,
  Tag,
  ArrowRight,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { store } from '../../lib/store';
import { Product } from '../../types';

interface HeaderProps {
  onNavigate: (route: string) => void;
  currentRoute: string;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentRoute }) => {
  const { selectedArea, selectedPinCode, isServiceable, estimatedDeliveryMinutes, openLocationModal } = useLocation();
  const { itemCount, openCartDrawer } = useCart();
  const { wishlistIds } = useWishlist();
  const { user, role, isAdmin, logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [announcementIndex, setAnnouncementIndex] = useState(0);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Rotating promotional announcements
  const announcements = [
    { text: '✨ Flash Beauty Deal: 20% OFF with code DEWGLOW20 on your routine', link: '/offers' },
    { text: '⚡ Ultra-fresh cosmetics delivered in 15 mins across Gokulam & Mysuru express hubs', link: '/shipping-policy' },
    { text: '🎁 Free luxury travel sample & free delivery on orders above ₹499', link: '/shop' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setAnnouncementIndex((prev) => (prev + 1) % announcements.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [announcements.length]);

  // Click outside to close search suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter products for live search autocomplete
  const allProducts = store.getPublishedProducts();
  const searchResults: Product[] = searchQuery.trim()
    ? allProducts.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.skinConcern?.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 4)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchFocused(false);
    }
  };

  const handleSearchSelect = (route: string) => {
    onNavigate(route);
    setIsSearchFocused(false);
    setSearchQuery('');
  };

  const handleMegaMenuEnter = (menuKey: string) => {
    if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
    setActiveMegaMenu(menuKey);
  };

  const handleMegaMenuLeave = () => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setActiveMegaMenu(null);
    }, 200);
  };

  // Mega-menu content data
  const megaMenus: Record<string, {
    title: string;
    subcategories: { name: string; route: string }[];
    concerns: { name: string; route: string }[];
    featured: {
      title: string;
      subtitle: string;
      image: string;
      route: string;
      tag: string;
    };
  }> = {
    skincare: {
      title: 'Skincare Formulations',
      subcategories: [
        { name: 'Active Serums & Ampoules', route: '/category/serums' },
        { name: 'Barrier Creams & Balms', route: '/category/skincare' },
        { name: 'Invisible Sunscreens (SPF 50+)', route: '/category/sunscreen' },
        { name: 'Melting Cleansing Balms', route: '/category/skincare' },
        { name: 'Hydrating Face Mists', route: '/category/skincare' },
      ],
      concerns: [
        { name: 'Barrier Recovery & Redness', route: '/search?q=barrier' },
        { name: 'Pore Tightening & Texture', route: '/search?q=pores' },
        { name: 'Hyperpigmentation & Glow', route: '/search?q=glow' },
        { name: 'Oil Control & Blemishes', route: '/search?q=niacinamide' },
      ],
      featured: {
        title: 'Cloud Barrier Recovery',
        subtitle: '5 Biomimetic Ceramides + Oat Beta-Glucan for instant soothing',
        image: 'https://images.unsplash.com/photo-1556228722-d0b5de731748?auto=format&fit=crop&w=600&q=80',
        route: '/product/cloud-barrier-ceramide-cream',
        tag: 'Bestseller'
      }
    },
    makeup: {
      title: 'Dewy & Clean Makeup',
      subcategories: [
        { name: 'Peptide Lip Oils & Glazes', route: '/category/lip-care' },
        { name: 'Seamless Liquid Blushes', route: '/category/makeup' },
        { name: 'Tubing Peptide Mascaras', route: '/category/makeup' },
        { name: 'Skin Tints & Complexion', route: '/category/makeup' },
      ],
      concerns: [
        { name: 'Glass Pout & Plump Lips', route: '/category/lip-care' },
        { name: 'Natural Cheek Flush', route: '/category/makeup' },
        { name: 'Smudge-Proof Lashes', route: '/category/makeup' },
      ],
      featured: {
        title: 'Glaze Peptide Lip Tint Oil',
        subtitle: 'High-comfort mirror shine with pure rose-tint cushion',
        image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80',
        route: '/product/glaze-peptide-hydrating-lip-tint-oil',
        tag: 'Trending Now'
      }
    },
    haircare: {
      title: 'Hair & Scalp Rituals',
      subcategories: [
        { name: 'Rosemary Stimulating Oils', route: '/category/haircare' },
        { name: 'Scalp Detox Cleansers', route: '/category/haircare' },
        { name: 'Bond Repair Treatments', route: '/category/haircare' },
      ],
      concerns: [
        { name: 'Hair Density & Shedding', route: '/search?q=rosemary' },
        { name: 'Dry & Itchy Scalp Relief', route: '/category/haircare' },
        { name: 'Split Ends & Gloss', route: '/category/haircare' },
      ],
      featured: {
        title: 'Rosemary & Biotin Density Oil',
        subtitle: 'Cold-pressed botanical elixir to strengthen weak follicles',
        image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=600&q=80',
        route: '/product/rosemary-biotin-density-scalp-oil',
        tag: 'Must-Have'
      }
    },
    fragrance: {
      title: 'Fine Parfumerie',
      subcategories: [
        { name: 'Artisanal Eau de Parfums', route: '/category/fragrance' },
        { name: 'Solar Florals & Citrus', route: '/category/fragrance' },
        { name: 'Travel Atomizers (10 ml)', route: '/category/fragrance' },
      ],
      concerns: [
        { name: 'Daytime Fresh & Uplifting', route: '/category/fragrance' },
        { name: 'Evening Warm Amber Sillage', route: '/category/fragrance' },
      ],
      featured: {
        title: 'Santorini Sunset EDP',
        subtitle: 'Sparkling Bergamot, Orange Blossom & Golden Coconut Amber',
        image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80',
        route: '/product/santorini-sunset-eau-de-parfum',
        tag: 'Signature'
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-border shadow-subtle transition-colors">
      
      {/* 1. TOP PROMOTIONAL ANNOUNCEMENT STRIP (MATCHING REFERENCE IMAGE) */}
      <div className="bg-burgundy text-white py-1.5 px-4 text-center overflow-hidden transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 sm:gap-8 text-[11px] sm:text-xs font-medium tracking-wide">
          <div className="flex items-center gap-1.5">
            <span>🚚</span>
            <span>Free delivery in Gokulam, Mysuru</span>
          </div>
          <span className="opacity-40">•</span>
          <div className="flex items-center gap-1.5">
            <span>🛡️</span>
            <span>Authentic Products</span>
          </div>
          <span className="opacity-40">•</span>
          <div className="flex items-center gap-1.5">
            <span>⚡</span>
            <span>Fast & Reliable Delivery</span>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER ROW */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20 gap-3 sm:gap-6">
          
          {/* Logo with Botanical Flower Icon */}
          <div className="flex items-center gap-4 lg:gap-6 shrink-0">
            <button
              onClick={() => onNavigate('/')}
              className="text-left flex items-center gap-2 group py-1"
            >
              <div className="w-8 h-8 rounded-full bg-burgundy/5 flex items-center justify-center text-burgundy group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 fill-burgundy" viewBox="0 0 24 24">
                  <path d="M12 2C13.5 5 15.5 6.5 18.5 8C15.5 9.5 13.5 11 12 14C10.5 11 8.5 9.5 5.5 8C8.5 6.5 10.5 5 12 2Z" />
                  <circle cx="12" cy="18" r="2" />
                  <path d="M7 16C8 14 10 13.5 12 14C14 13.5 16 14 17 16C15 17 14 18.5 12 18.5C10 18.5 9 17 7 16Z" opacity="0.6" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight text-charcoal group-hover:text-burgundy transition-colors leading-none">
                  Dew & Go
                </span>
                <span className="text-[8px] sm:text-[9px] tracking-[0.25em] text-burgundy/80 uppercase font-semibold mt-0.5">
                  BEAUTY • CARE • YOU
                </span>
              </div>
            </button>
          </div>

          {/* 3. SEARCH BAR + HYPERLOCAL LOCATION PILL */}
          <div className="flex-1 max-w-2xl flex items-center gap-2.5">
            <div ref={searchContainerRef} className="flex-1 relative">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  placeholder="Search for skincare, makeup, haircare..."
                  className="w-full pl-9 pr-8 py-2 sm:py-2.5 rounded-full border border-[#EFE7E1] bg-[#FAF8F6] text-xs text-charcoal placeholder:text-muted focus:bg-white focus:outline-none focus:border-burgundy focus:ring-1 focus:ring-burgundy/20 transition-all shadow-inner"
                />
                <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-charcoal"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>

            {/* LIVE SEARCH AUTOCOMPLETE POPUP */}
            {isSearchFocused && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-elevated border border-border p-4 z-50 animate-fade-in divide-y divide-border/60">
                {/* Matched Products */}
                {searchResults.length > 0 ? (
                  <div className="pb-3">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-muted mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-rose" />
                      <span>Products Found ({searchResults.length})</span>
                    </div>
                    <div className="space-y-1.5">
                      {searchResults.map((prod) => (
                        <div
                          key={prod.id}
                          onClick={() => handleSearchSelect(`/product/${prod.slug}`)}
                          className="flex items-center gap-3 p-2 rounded-md hover:bg-warmcream/80 cursor-pointer transition-colors group"
                        >
                          <img
                            src={prod.images[0]}
                            alt={prod.name}
                            className="w-10 h-10 object-contain rounded bg-[#FAF7F4] p-1 border border-border/80"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] uppercase font-bold text-muted block truncate">
                              {prod.brand}
                            </span>
                            <h4 className="text-xs font-semibold text-charcoal truncate group-hover:text-rose transition-colors">
                              {prod.name}
                            </h4>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs font-bold text-charcoal">₹{prod.defaultPrice}</span>
                            {prod.defaultOriginalPrice && prod.defaultOriginalPrice > prod.defaultPrice && (
                              <span className="text-[10px] text-muted line-through block">₹{prod.defaultOriginalPrice}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : searchQuery.trim() ? (
                  <div className="py-2 text-center text-xs text-muted">
                    No products matching "{searchQuery}". Press Enter to search catalog.
                  </div>
                ) : null}

                {/* Popular Search Suggestions */}
                <div className="pt-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-muted mb-2 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-coral" />
                    <span>Popular Searches</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Niacinamide Serum', 
                      'SPF 50 Sunscreen', 
                      'Glaze Lip Oil', 
                      'Cloud Ceramide Cream', 
                      'Seamless Liquid Blush', 
                      'Rosemary Scalp Oil', 
                      'Santorini Perfume'
                    ].map(term => (
                      <button
                        key={term}
                        onClick={() => handleSearchSelect(`/search?q=${encodeURIComponent(term)}`)}
                        className="px-2.5 py-1 rounded-full text-xs bg-warmcream hover:bg-blush hover:text-rose text-charcoal border border-border/60 transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>

                {searchQuery.trim() && (
                  <div className="pt-2 text-right">
                    <button
                      onClick={handleSearchSubmit}
                      className="text-xs font-bold text-rose hover:text-berry flex items-center gap-1 ml-auto"
                    >
                      <span>View all results for "{searchQuery}"</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            )}
            </div>

            {/* Hyperlocal Delivery Location Selector Pill */}
            <button
              onClick={openLocationModal}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-full border border-[#EFE7E1] bg-white hover:border-burgundy/40 hover:bg-[#FAF8F6] text-left transition-all duration-150 shadow-sm shrink-0"
              title="Change Delivery Location"
            >
              <MapPin className="w-3.5 h-3.5 text-burgundy shrink-0" />
              <span className="text-xs font-semibold text-charcoal truncate max-w-[150px]">
                {selectedArea || `Gokulam, Mysuru`}
              </span>
              <ChevronDown className="w-3 h-3 text-muted shrink-0" />
            </button>
          </div>

          {/* 4. USER ACTIONS (ACCOUNT, WISHLIST, BAG) */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            
            {/* Account Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="p-2 rounded-full hover:bg-[#FAF8F6] text-charcoal hover:text-burgundy transition-colors"
                title="Account Menu"
              >
                <User className="w-5 h-5" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-dropdown border border-border p-2 z-50 animate-fade-in">
                  <div className="p-3 border-b border-border/80 bg-warmcream/40 rounded-t-md">
                    <p className="text-xs font-bold text-charcoal truncate">
                      {user ? user.fullName : 'Welcome to Dew & Go'}
                    </p>
                    <p className="text-[11px] text-muted truncate">
                      {user ? user.email : 'Log in for personalized recommendations'}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blush text-berry uppercase tracking-wider">
                      {role === 'super_admin' ? 'Administrator' : role === 'delivery_person' ? 'Delivery Partner' : 'Customer'}
                    </div>
                  </div>

                  <div className="py-1 text-xs">
                    <button
                      onClick={() => { onNavigate('/account/profile'); setIsUserMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded hover:bg-warmcream text-charcoal transition-colors flex items-center justify-between"
                    >
                      <span>My Profile</span>
                      <ChevronRight className="w-3.5 h-3.5 text-muted" />
                    </button>
                    <button
                      onClick={() => { onNavigate('/account/orders'); setIsUserMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded hover:bg-warmcream text-charcoal transition-colors flex items-center justify-between"
                    >
                      <span>My Orders & Live Tracking</span>
                      <ChevronRight className="w-3.5 h-3.5 text-muted" />
                    </button>
                    <button
                      onClick={() => { onNavigate('/account/addresses'); setIsUserMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded hover:bg-warmcream text-charcoal transition-colors flex items-center justify-between"
                    >
                      <span>Saved Addresses</span>
                      <ChevronRight className="w-3.5 h-3.5 text-muted" />
                    </button>
                    <button
                      onClick={() => { onNavigate('/account/wishlist'); setIsUserMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded hover:bg-warmcream text-charcoal transition-colors flex items-center justify-between"
                    >
                      <span>Wishlist ({wishlistIds.length})</span>
                      <ChevronRight className="w-3.5 h-3.5 text-muted" />
                    </button>
                    <button
                      onClick={() => { onNavigate('/beauty-advisor'); setIsUserMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded hover:bg-blush/60 text-berry font-semibold transition-colors flex items-center justify-between"
                    >
                      <span>AI Skin Routine Advisor</span>
                      <Sparkles className="w-3.5 h-3.5 text-rose" />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => { onNavigate('/admin/dashboard'); setIsUserMenuOpen(false); }}
                        className="w-full text-left px-3 py-2 rounded hover:bg-berry/10 text-berry font-bold transition-colors flex items-center justify-between border-t border-border/60 mt-1"
                      >
                        <span>Admin Dashboard</span>
                        <ChevronRight className="w-3.5 h-3.5 text-berry" />
                      </button>
                    )}
                  </div>

                  <div className="pt-2 border-t border-border/80">
                    {user ? (
                      <button
                        onClick={() => { logout(); setIsUserMenuOpen(false); }}
                        className="w-full text-left px-3 py-1.5 text-xs font-semibold text-rose hover:bg-blush/40 rounded"
                      >
                        Log Out
                      </button>
                    ) : (
                      <button
                        onClick={() => { onNavigate('/account'); setIsUserMenuOpen(false); }}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-berry hover:bg-blush/40 rounded flex items-center justify-between"
                      >
                        <span>Sign In / Create Account</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist */}
            <button
              onClick={() => onNavigate('/account/wishlist')}
              className="relative p-2 rounded-full hover:bg-[#FAF8F6] text-charcoal hover:text-burgundy transition-colors"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistIds.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-burgundy text-white rounded-full text-[9px] font-bold flex items-center justify-center shadow-sm">
                  {wishlistIds.length}
                </span>
              )}
            </button>

            {/* Shopping Bag with Solid Burgundy Badge */}
            <button
              onClick={openCartDrawer}
              className="relative p-2 rounded-full hover:bg-[#FAF8F6] text-charcoal hover:text-burgundy transition-colors"
              title="Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-burgundy text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-charcoal hover:bg-warmcream rounded-md"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* 5. CATEGORY NAVIGATION BAR (EXACT 8 CATEGORIES FROM REFERENCE) */}
        <nav className="hidden md:flex items-center justify-between border-t border-[#F0EAE8] py-2.5 text-xs font-medium tracking-wide relative">
          <div className="flex items-center gap-6 lg:gap-8">
            
            {/* All Categories Dropdown Trigger */}
            <button
              onClick={() => onNavigate('/shop')}
              className="flex items-center gap-1.5 text-xs font-bold text-charcoal hover:text-burgundy transition-colors"
            >
              <Menu className="w-4 h-4" />
              <span>All Categories</span>
            </button>

            {/* Skincare with Mega Menu */}
            <div 
              className="relative py-1"
              onMouseEnter={() => handleMegaMenuEnter('skincare')}
              onMouseLeave={handleMegaMenuLeave}
            >
              <button
                onClick={() => onNavigate('/category/skincare')}
                className={`hover:text-burgundy transition-colors text-xs font-medium flex items-center gap-0.5 ${
                  currentRoute.includes('skincare') ? 'text-burgundy font-bold' : 'text-charcoal'
                }`}
              >
                <span>Skincare</span>
              </button>
            </div>

            {/* Makeup with Mega Menu */}
            <div 
              className="relative py-1"
              onMouseEnter={() => handleMegaMenuEnter('makeup')}
              onMouseLeave={handleMegaMenuLeave}
            >
              <button
                onClick={() => onNavigate('/category/makeup')}
                className={`hover:text-burgundy transition-colors text-xs font-medium flex items-center gap-0.5 ${
                  currentRoute.includes('makeup') ? 'text-burgundy font-bold' : 'text-charcoal'
                }`}
              >
                <span>Makeup</span>
              </button>
            </div>

            {/* Haircare with Mega Menu */}
            <div 
              className="relative py-1"
              onMouseEnter={() => handleMegaMenuEnter('haircare')}
              onMouseLeave={handleMegaMenuLeave}
            >
              <button
                onClick={() => onNavigate('/category/haircare')}
                className={`hover:text-burgundy transition-colors text-xs font-medium flex items-center gap-0.5 ${
                  currentRoute.includes('haircare') ? 'text-burgundy font-bold' : 'text-charcoal'
                }`}
              >
                <span>Haircare</span>
              </button>
            </div>

            {/* Fragrance */}
            <div 
              className="relative py-1"
              onMouseEnter={() => handleMegaMenuEnter('fragrance')}
              onMouseLeave={handleMegaMenuLeave}
            >
              <button
                onClick={() => onNavigate('/category/fragrance')}
                className={`hover:text-burgundy transition-colors text-xs font-medium flex items-center gap-0.5 ${
                  currentRoute.includes('fragrance') ? 'text-burgundy font-bold' : 'text-charcoal'
                }`}
              >
                <span>Fragrance</span>
              </button>
            </div>

            {/* Bath & Body */}
            <button
              onClick={() => onNavigate('/category/bath-body')}
              className={`hover:text-burgundy transition-colors text-xs font-medium ${
                currentRoute.includes('bath-body') ? 'text-burgundy font-bold' : 'text-charcoal'
              }`}
            >
              Bath & Body
            </button>

            {/* Beauty Tools */}
            <button
              onClick={() => onNavigate('/category/beauty-tools')}
              className={`hover:text-burgundy transition-colors text-xs font-medium ${
                currentRoute.includes('beauty-tools') ? 'text-burgundy font-bold' : 'text-charcoal'
              }`}
            >
              Beauty Tools
            </button>

            {/* Brands */}
            <button
              onClick={() => onNavigate('/shop')}
              className="hover:text-burgundy transition-colors text-xs font-medium text-charcoal"
            >
              Brands
            </button>

            {/* Offers */}
            <button
              onClick={() => onNavigate('/offers')}
              className="hover:text-burgundy transition-colors text-xs font-semibold text-burgundy flex items-center gap-1"
            >
              <span>Offers</span>
            </button>

          </div>

          {/* Right Header Navigation Links */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('/beauty-advisor')}
              className="text-xs font-bold text-berry hover:text-rose transition-colors flex items-center gap-1 bg-blush px-2.5 py-1 rounded-full border border-rose/20"
            >
              <Sparkles className="w-3 h-3 text-rose" />
              <span>AI Skin Advisor</span>
            </button>

            {role !== 'customer' && (
              <button
                onClick={() => onNavigate(role === 'delivery_person' ? '/delivery' : '/admin')}
                className="text-xs font-bold text-charcoal hover:text-berry underline"
              >
                {role === 'delivery_person' ? 'Rider Hub' : 'Admin Portal'}
              </button>
            )}
          </div>

          {/* 6. EXPANDED MEGA-MENU DROP-DOWN */}
          {activeMegaMenu && megaMenus[activeMegaMenu] && (
            <div 
              onMouseEnter={() => handleMegaMenuEnter(activeMegaMenu)}
              onMouseLeave={handleMegaMenuLeave}
              className="absolute left-0 right-0 top-full bg-white shadow-elevated border border-border rounded-b-xl p-6 z-50 animate-mega-menu"
            >
              <div className="grid grid-cols-12 gap-8 items-start">
                
                {/* Column 1: Subcategories */}
                <div className="col-span-4 space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-berry border-b border-border pb-2">
                    {megaMenus[activeMegaMenu].title}
                  </h4>
                  <ul className="space-y-2">
                    {megaMenus[activeMegaMenu].subcategories.map(item => (
                      <li key={item.name}>
                        <button
                          onClick={() => { onNavigate(item.route); setActiveMegaMenu(null); }}
                          className="text-xs text-charcoal hover:text-rose hover:translate-x-1 transition-all flex items-center gap-1.5 group font-medium"
                        >
                          <ChevronRight className="w-3 h-3 text-muted group-hover:text-rose" />
                          <span>{item.name}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Column 2: By Concern / Target */}
                <div className="col-span-4 space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-berry border-b border-border pb-2">
                    Shop by Concern
                  </h4>
                  <ul className="space-y-2">
                    {megaMenus[activeMegaMenu].concerns.map(item => (
                      <li key={item.name}>
                        <button
                          onClick={() => { onNavigate(item.route); setActiveMegaMenu(null); }}
                          className="text-xs text-charcoal hover:text-rose hover:translate-x-1 transition-all flex items-center gap-1.5 group font-medium"
                        >
                          <ChevronRight className="w-3 h-3 text-muted group-hover:text-rose" />
                          <span>{item.name}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-2">
                    <button
                      onClick={() => { onNavigate(`/category/${activeMegaMenu}`); setActiveMegaMenu(null); }}
                      className="text-xs font-bold text-rose hover:underline flex items-center gap-1"
                    >
                      <span>Explore all {activeMegaMenu} products</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Column 3: Featured Photographic Banner */}
                <div className="col-span-4">
                  <div 
                    onClick={() => { onNavigate(megaMenus[activeMegaMenu].featured.route); setActiveMegaMenu(null); }}
                    className="relative rounded-lg overflow-hidden bg-warmcream border border-border group cursor-pointer aspect-[16/10]"
                  >
                    <img
                      src={megaMenus[activeMegaMenu].featured.image}
                      alt={megaMenus[activeMegaMenu].featured.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/30 to-transparent flex flex-col justify-end p-4 text-white">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-coral mb-1 inline-block">
                        {megaMenus[activeMegaMenu].featured.tag}
                      </span>
                      <h4 className="text-sm font-bold text-white group-hover:text-coral transition-colors">
                        {megaMenus[activeMegaMenu].featured.title}
                      </h4>
                      <p className="text-[11px] text-neutral-200 line-clamp-1 mt-0.5">
                        {megaMenus[activeMegaMenu].featured.subtitle}
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </nav>
      </div>

      {/* 7. MOBILE DRAWER MENU */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-border px-4 py-4 space-y-4 animate-fade-in shadow-dropdown">
          
          {/* Mobile Delivery Pin */}
          <button
            onClick={() => { openLocationModal(); setIsMobileMenuOpen(false); }}
            className="w-full flex items-center justify-between p-3 rounded-lg border border-border bg-warmcream text-xs font-semibold text-charcoal shadow-sm"
          >
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose" />
              <span>Deliver to: {selectedArea || `PIN ${selectedPinCode}`}</span>
            </span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              ⚡ {estimatedDeliveryMinutes}m
            </span>
          </button>

          {/* Quick Categories Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => { onNavigate('/shop'); setIsMobileMenuOpen(false); }}
              className="p-2.5 text-left rounded-md bg-warmcream font-bold text-berry hover:bg-blush"
            >
              Shop All Catalog
            </button>
            <button
              onClick={() => { onNavigate('/offers'); setIsMobileMenuOpen(false); }}
              className="p-2.5 text-left rounded-md bg-blush font-bold text-rose hover:bg-blush/80 flex items-center justify-between"
            >
              <span>Offers & Deals</span>
              <Tag className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => { onNavigate('/category/skincare'); setIsMobileMenuOpen(false); }}
              className="p-2 text-left rounded hover:bg-warmcream text-charcoal"
            >
              Skincare
            </button>
            <button
              onClick={() => { onNavigate('/category/makeup'); setIsMobileMenuOpen(false); }}
              className="p-2 text-left rounded hover:bg-warmcream text-charcoal"
            >
              Makeup
            </button>
            <button
              onClick={() => { onNavigate('/category/sunscreen'); setIsMobileMenuOpen(false); }}
              className="p-2 text-left rounded hover:bg-warmcream text-charcoal"
            >
              Sunscreen
            </button>
            <button
              onClick={() => { onNavigate('/category/serums'); setIsMobileMenuOpen(false); }}
              className="p-2 text-left rounded hover:bg-warmcream text-charcoal"
            >
              Serums
            </button>
            <button
              onClick={() => { onNavigate('/category/lip-care'); setIsMobileMenuOpen(false); }}
              className="p-2 text-left rounded hover:bg-warmcream text-charcoal"
            >
              Lip Care
            </button>
            <button
              onClick={() => { onNavigate('/category/haircare'); setIsMobileMenuOpen(false); }}
              className="p-2 text-left rounded hover:bg-warmcream text-charcoal"
            >
              Haircare
            </button>
            <button
              onClick={() => { onNavigate('/category/fragrance'); setIsMobileMenuOpen(false); }}
              className="p-2 text-left rounded hover:bg-warmcream text-charcoal"
            >
              Fragrance
            </button>
            <button
              onClick={() => { onNavigate('/category/body-care'); setIsMobileMenuOpen(false); }}
              className="p-2 text-left rounded hover:bg-warmcream text-charcoal"
            >
              Body Care
            </button>
          </div>

          {/* Beauty Advisor CTA */}
          <button
            onClick={() => { onNavigate('/beauty-advisor'); setIsMobileMenuOpen(false); }}
            className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-berry to-rose text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-lavender" />
            <span>Launch AI Skin Routine Advisor</span>
          </button>
        </div>
      )}

    </header>
  );
};
