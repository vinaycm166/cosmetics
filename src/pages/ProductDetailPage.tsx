import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  ShoppingBag, 
  Star, 
  Clock, 
  ShieldCheck, 
  Check, 
  Plus, 
  Minus,
  ChevronRight,
  Sparkles,
  RotateCw,
  Image as ImageIcon,
  Zap,
  Droplets,
  Layers,
  Award
} from 'lucide-react';
import { store } from '../lib/store';
import { ProductVariant } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useLocation } from '../context/LocationContext';
import { ProductCard } from '../components/common/ProductCard';
import { Interactive3DProductViewer } from '../components/3d/Interactive3DProductViewer';

interface ProductDetailPageProps {
  slug: string;
  onNavigate: (route: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ slug, onNavigate }) => {
  const product = store.getProductBySlug(slug);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { estimatedDeliveryMinutes, isServiceable, selectedArea } = useLocation();

  if (!product || product.status === 'draft' || !product.isPublished || !product.defaultPrice || product.defaultPrice <= 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-28 text-center space-y-5">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-berry bg-berry/10 px-3 py-1 rounded-full">
          Catalog Notice
        </span>
        <h2 className="font-editorial text-4xl text-charcoal">Formulation Unavailable</h2>
        <p className="text-xs text-muted max-w-md mx-auto">This product listing is currently being catalogued or awaiting fresh batch verification.</p>
        <button onClick={() => onNavigate('/shop')} className="dew-btn-berry text-xs !px-7 !py-3">
          Browse Available Formulations
        </button>
      </div>
    );
  }

  // Visual Mode: 'photo' (Studio Packshots) or '3d' (Interactive 360° Three.js Stage)
  const [viewMode, setViewMode] = useState<'photo' | '3d'>('photo');
  const [selectedImage, setSelectedImage] = useState(product.images[0] || '');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants.find(v => v.isDefault) || product.variants[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'benefits' | 'ingredients' | 'howToUse' | 'safety'>('benefits');
  const [addedNotice, setAddedNotice] = useState(false);

  // Track recently viewed products in localStorage
  useEffect(() => {
    if (product) {
      try {
        const stored = localStorage.getItem('dew_and_go_recently_viewed');
        let ids: string[] = stored ? JSON.parse(stored) : [];
        ids = [product.id, ...ids.filter(id => id !== product.id)].slice(0, 8);
        localStorage.setItem('dew_and_go_recently_viewed', JSON.stringify(ids));
      } catch {
        // ignore
      }
    }
  }, [product]);

  const price = selectedVariant.price;
  const originalPrice = selectedVariant.originalPrice;
  const discount = selectedVariant.discountPercentage;
  const availableStock = Math.max(0, selectedVariant.stockQuantity - selectedVariant.reservedQuantity);
  const inStock = availableStock > 0;
  const wishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    if (!inStock) return;
    const res = addToCart(product, selectedVariant, quantity);
    if (res.success) {
      setAddedNotice(true);
      setTimeout(() => setAddedNotice(false), 2000);
    }
  };

  const handleBuyNow = () => {
    if (!inStock) return;
    addToCart(product, selectedVariant, quantity);
    onNavigate('/checkout');
  };

  const relatedProducts = store.getPublishedProducts().filter(p => p.id !== product.id && p.category === product.category).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-muted">
        <button onClick={() => onNavigate('/')} className="hover:text-berry font-medium">Home</button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button onClick={() => onNavigate('/shop')} className="hover:text-berry font-medium">Catalog</button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button onClick={() => onNavigate(`/category/${product.categoryId}`)} className="hover:text-berry font-medium">{product.category}</button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-charcoal font-bold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Stage Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        
        {/* Left: Product Stage (Toggleable Studio Photography vs Interactive 3D Canvas) */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Stage View Mode Toggle Bar */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted">
              Inspection Mode:
            </span>
            <div className="flex items-center gap-1 glass-pill p-1 rounded-full shadow-subtle">
              <button
                onClick={() => setViewMode('photo')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  viewMode === 'photo' ? 'bg-berry text-white shadow-subtle' : 'text-charcoal/70 hover:text-charcoal'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Studio Packshots</span>
              </button>
              <button
                onClick={() => setViewMode('3d')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  viewMode === '3d' ? 'bg-berry text-white shadow-subtle' : 'text-charcoal/70 hover:text-charcoal'
                }`}
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Interactive 3D 360°</span>
              </button>
            </div>
          </div>

          {/* Active Stage Display */}
          {viewMode === '3d' ? (
            <div className="animate-fade-in">
              <Interactive3DProductViewer product={product} />
            </div>
          ) : (
            <div className="relative aspect-square w-full rounded-3xl bg-[#FAF7F4] border border-[#EFE7E1] overflow-hidden flex items-center justify-center shadow-card animate-fade-in group">
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-contain p-8 transition-transform duration-700 group-hover:scale-106"
              />
              
              {/* Discount Badge */}
              {discount && discount > 0 ? (
                <span className="absolute top-4 left-4 glass-pill px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-sale shadow-subtle border border-sale/20">
                  {discount}% OFF
                </span>
              ) : null}

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product.id)}
                aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                className={`absolute top-4 right-4 p-2.5 rounded-full border border-border transition-all shadow-subtle ${
                  wishlisted ? 'bg-rose text-white scale-105' : 'bg-white/90 text-charcoal/60 hover:text-rose hover:bg-white'
                }`}
              >
                <Heart className={`w-4 h-4 ${wishlisted ? 'fill-white' : ''}`} />
              </button>
            </div>
          )}

          {/* Gallery Thumbnails (active when in photo mode) */}
          {viewMode === 'photo' && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-2xl border bg-[#FAF7F4] p-2 transition-all shrink-0 ${
                    selectedImage === img 
                      ? 'border-berry ring-2 ring-berry/20 shadow-subtle' 
                      : 'border-[#EFE7E1] hover:border-neutral-400'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Purchase Controls & Formulation Details */}
        <div className="lg:col-span-6 space-y-6">
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-berry">
                {product.brand}
              </span>
              <div className="flex items-center gap-1 bg-[#FAF7F4] px-2 py-0.5 rounded-md border border-[#EFE7E1]">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-charcoal font-black text-xs">{product.rating.toFixed(1)}</span>
                {product.reviewCount ? (
                  <span className="text-muted text-[10px]">({product.reviewCount} verified reviews)</span>
                ) : null}
              </div>
            </div>

            <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-charcoal leading-tight">
              {product.name}
            </h1>

            <p className="text-xs sm:text-sm text-charcoal/70 leading-relaxed font-sans pt-1">
              {product.shortDescription || product.description}
            </p>
          </div>

          {/* Pricing Row */}
          <div className="pt-2 border-t border-[#EFE7E1] flex items-baseline gap-3">
            <span className="text-3xl font-black text-charcoal">
              ₹{price}
            </span>
            {originalPrice && originalPrice > price && (
              <span className="text-base text-muted line-through font-medium">
                ₹{originalPrice}
              </span>
            )}
            {discount && discount > 0 && (
              <span className="text-xs font-bold text-sale bg-rose/10 px-2.5 py-0.5 rounded-full border border-sale/20">
                Save ₹{originalPrice! - price} ({discount}% off)
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted -mt-3">
            Prices inclusive of all taxes. Free 15-minute climate-controlled delivery on orders ₹499+.
          </p>

          {/* Cold-Pack Delivery ETA Notice */}
          <div className="p-3.5 rounded-2xl bg-[#FCF8F5] border border-[#EFE7E1] flex items-center justify-between text-xs shadow-subtle">
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-berry shrink-0" />
              <span>
                {isServiceable ? (
                  <>Dispatched from Indiranagar Hub to <b>{selectedArea}</b> in ~{estimatedDeliveryMinutes} mins</>
                ) : (
                  <>Hyperlocal service check for {selectedArea}</>
                )}
              </span>
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {isServiceable ? 'Express Ready' : 'Standard'}
            </span>
          </div>

          {/* Variant Selector */}
          <div className="space-y-2">
            <label className="block text-[11px] font-extrabold uppercase tracking-widest text-charcoal">
              Formulation / Size:
            </label>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                    selectedVariant.id === variant.id
                      ? 'border-berry bg-berry text-white shadow-subtle'
                      : 'border-[#EFE7E1] bg-white text-charcoal hover:border-berry/40'
                  }`}
                >
                  {variant.variantName} • ₹{variant.price}
                </button>
              ))}
            </div>
            <div className="text-[11px] text-muted flex items-center gap-2 pt-1 font-medium">
              <span>SKU: {selectedVariant.sku}</span>
              <span>•</span>
              <span className={inStock ? 'text-emerald-700 font-bold' : 'text-sale font-bold'}>
                {inStock ? `In Stock (${availableStock} units fresh)` : 'Currently Out of Stock'}
              </span>
            </div>
          </div>

          {/* Stepper & Primary Add to Bag Actions */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              {/* Stepper */}
              <div className="flex items-center rounded-xl border border-[#EFE7E1] bg-white shadow-subtle">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-9 h-9 flex items-center justify-center text-charcoal hover:bg-neutral-100 rounded-l-xl transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-9 text-center text-xs font-black text-charcoal">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                  disabled={quantity >= availableStock}
                  className="w-9 h-9 flex items-center justify-center text-charcoal hover:bg-neutral-100 rounded-r-xl transition-colors disabled:opacity-30"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add to Bag */}
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className="flex-1 dew-btn-berry !py-3.5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-3d-float"
              >
                {addedNotice ? (
                  <>
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>Added to Bag</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>{inStock ? `Add to Bag • ₹${price * quantity}` : 'Out of Stock'}</span>
                  </>
                )}
              </button>

              {/* Buy Now */}
              <button
                onClick={handleBuyNow}
                disabled={!inStock}
                className="glass-pill hover:bg-white text-charcoal !py-3.5 !px-6 rounded-xl text-xs font-black uppercase tracking-wider border border-[#EFE7E1] transition-all"
              >
                Buy Now
              </button>
            </div>
          </div>

          {/* Formula Transparency Tabs */}
          <div className="pt-4 border-t border-[#EFE7E1]">
            <div className="flex border-b border-[#EFE7E1] gap-6 text-xs font-bold">
              <button
                onClick={() => setActiveTab('benefits')}
                className={`pb-2.5 transition-all ${
                  activeTab === 'benefits' ? 'border-b-2 border-berry text-berry font-black' : 'text-muted hover:text-charcoal'
                }`}
              >
                Clinical Benefits
              </button>
              <button
                onClick={() => setActiveTab('ingredients')}
                className={`pb-2.5 transition-all ${
                  activeTab === 'ingredients' ? 'border-b-2 border-berry text-berry font-black' : 'text-muted hover:text-charcoal'
                }`}
              >
                Verified Ingredients
              </button>
              <button
                onClick={() => setActiveTab('howToUse')}
                className={`pb-2.5 transition-all ${
                  activeTab === 'howToUse' ? 'border-b-2 border-berry text-berry font-black' : 'text-muted hover:text-charcoal'
                }`}
              >
                Application Protocol
              </button>
              <button
                onClick={() => setActiveTab('safety')}
                className={`pb-2.5 transition-all ${
                  activeTab === 'safety' ? 'border-b-2 border-berry text-berry font-black' : 'text-muted hover:text-charcoal'
                }`}
              >
                Dermatology & Skin Type
              </button>
            </div>

            <div className="py-4 text-xs text-charcoal/80 leading-relaxed font-sans">
              {activeTab === 'benefits' && (
                <ul className="space-y-2">
                  {product.benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="text-berry font-bold">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}

              {activeTab === 'ingredients' && (
                <p className="leading-relaxed bg-[#FAF7F4] p-4 rounded-2xl border border-[#EFE7E1]">
                  {product.ingredients || 'Verified formula certified on official retail packaging.'}
                </p>
              )}

              {activeTab === 'howToUse' && (
                <p className="leading-relaxed">{product.howToUse || 'Apply morning and night to clean, damp skin as part of your beauty ritual.'}</p>
              )}

              {activeTab === 'safety' && (
                <div className="space-y-2">
                  <p>{product.safetyInformation || 'Dermatologically evaluated. Safe for sensitive skin types.'}</p>
                  {product.skinType && (
                    <p className="font-semibold text-charcoal">
                      Recommended for: {product.skinType.join(', ')} skin concerns.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Related Products Showcase */}
      {relatedProducts.length > 0 && (
        <section className="pt-12 border-t border-[#EFE7E1]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-berry">
                Pairing Suggestions
              </span>
              <h3 className="font-editorial text-3xl text-charcoal mt-0.5">
                Complete Your Beauty Ritual
              </h3>
            </div>
            <button onClick={() => onNavigate('/shop')} className="text-xs font-bold text-berry hover:underline">
              View All Formulations →
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}

      {/* Mobile Sticky Purchase Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md p-3 border-t border-[#EFE7E1] shadow-2xl flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-muted block">{product.brand}</span>
          <span className="text-sm font-black text-charcoal">₹{price}</span>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={!inStock}
          className="dew-btn-berry !py-2.5 !px-6 text-xs font-black uppercase tracking-wider flex-1"
        >
          {addedNotice ? 'Added to Bag' : inStock ? 'Add to Bag' : 'Sold Out'}
        </button>
      </div>

    </div>
  );
};
