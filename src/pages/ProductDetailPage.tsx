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
import { ProductImage } from '../components/common/ProductImage';

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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Left: Product Stage (Vertical Thumbnails + Main Packshot matching Reference Image) */}
        <div className="lg:col-span-6 flex flex-col sm:flex-row gap-4">
          
          {/* Vertical Gallery Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex sm:flex-col gap-2.5 order-2 sm:order-1 overflow-x-auto sm:overflow-visible shrink-0">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-16 sm:w-18 sm:h-18 rounded-xl border bg-white p-1 transition-all overflow-hidden ${
                    (selectedImage === img || (!selectedImage && idx === 0))
                      ? 'border-burgundy ring-1 ring-burgundy/30 shadow-2xs' 
                      : 'border-[#F0EAE8] hover:border-neutral-400'
                  }`}
                >
                  <ProductImage 
                    src={img} 
                    alt={`Thumbnail ${idx + 1}`} 
                    brand={product.brand}
                    category={product.category}
                    className="w-full h-full object-contain" 
                  />
                </button>
              ))}
            </div>
          )}

          {/* Main Packshot Stage */}
          <div className="relative aspect-square w-full rounded-2xl bg-[#FAFAF9] border border-[#F0EAE8] overflow-hidden flex items-center justify-center shadow-2xs group p-6 order-1 sm:order-2 flex-1">
            <ProductImage
              src={selectedImage || product.images[0]}
              alt={product.name}
              brand={product.brand}
              category={product.category}
              className="w-full h-full object-contain transition-transform duration-300 ease-out group-hover:scale-105"
            />
            
            {/* Bestseller Badge (Peach background matching reference image) */}
            {product.isBestseller && (
              <span className="absolute top-3 left-3 bg-[#FEF3EB] text-[#C25E1A] px-2.5 py-0.5 rounded text-[11px] font-bold tracking-wide">
                Bestseller
              </span>
            )}

            {/* Wishlist Button */}
            <button
              onClick={() => toggleWishlist(product.id)}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
              className={`absolute top-3 right-3 p-2 rounded-full border border-[#F0EAE8] bg-white transition-all shadow-2xs ${
                wishlisted ? 'text-burgundy' : 'text-neutral-400 hover:text-burgundy'
              }`}
            >
              <Heart className={`w-4 h-4 ${wishlisted ? 'fill-burgundy text-burgundy' : ''}`} />
            </button>
          </div>
        </div>

        {/* Right: Product Purchase Controls & Formulation Details */}
        <div className="lg:col-span-6 space-y-4">
          
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal">
              {product.brand}
            </span>

            <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-charcoal leading-tight">
              {product.name}
            </h1>

            <p className="text-xs text-muted">
              {selectedVariant.variantName || 'Standard formulation'}
            </p>

            {/* Star Rating */}
            <div className="flex items-center gap-1.5 pt-1 text-xs">
              <div className="flex text-amber-400">
                {'★'.repeat(Math.round(product.rating))}
              </div>
              <span className="font-bold text-charcoal text-xs">{product.rating.toFixed(1)}</span>
              <span className="text-muted text-[11px]">({product.reviewCount || 124} reviews)</span>
            </div>
          </div>

          {/* Pricing Row with Mint Discount Tag */}
          <div className="pt-2 border-t border-[#F0EAE8] flex items-center gap-2.5 flex-wrap">
            <span className="text-2xl sm:text-3xl font-extrabold text-charcoal">
              ₹{price}
            </span>
            {originalPrice && originalPrice > price && (
              <span className="text-sm text-muted line-through">
                ₹{originalPrice}
              </span>
            )}
            {discount && discount > 0 && (
              <span className="text-xs font-bold bg-[#E8F7EE] text-[#137333] px-2 py-0.5 rounded">
                {discount}% OFF
              </span>
            )}
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded ml-1">
              • In Stock
            </span>
          </div>

          {/* Description Excerpt */}
          <p className="text-xs text-charcoal/75 leading-relaxed pt-1">
            {product.shortDescription || product.description}
          </p>

          {/* Stepper & Primary Actions */}
          <div className="pt-2 space-y-3">
            <div className="flex items-center gap-3">
              {/* Stepper */}
              <div className="flex items-center rounded-lg border border-[#EFE7E1] bg-white shadow-2xs">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-9 h-9 flex items-center justify-center text-charcoal hover:bg-neutral-100 rounded-l-lg transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-xs font-bold text-charcoal">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                  disabled={quantity >= availableStock}
                  className="w-9 h-9 flex items-center justify-center text-charcoal hover:bg-neutral-100 rounded-r-lg transition-colors disabled:opacity-30"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add to Cart Button (Solid Burgundy) */}
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className="flex-1 py-2.5 px-5 rounded-lg bg-burgundy hover:bg-burgundy-dark text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 active:scale-98 disabled:opacity-60"
              >
                {addedNotice ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Added to Cart</span>
                  </>
                ) : (
                  <span>Add to Cart</span>
                )}
              </button>
            </div>

            {/* Buy Now Button */}
            <button
              onClick={handleBuyNow}
              disabled={!inStock}
              className="w-full py-2.5 px-4 rounded-lg bg-[#FBECEB] hover:bg-[#F7D8D7] text-burgundy text-xs font-bold transition-colors shadow-2xs"
            >
              Buy Now
            </button>
          </div>

          {/* 4 Trust Bullets (Matching Reference Image) */}
          <div className="pt-4 border-t border-[#F0EAE8] space-y-2 text-xs text-charcoal/80">
            <div className="flex items-center gap-2">
              <span>🚚</span>
              <span>Free delivery in Gokulam, Mysuru</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🛡️</span>
              <span>100% Authentic Product</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🔄</span>
              <span>Easy Returns</span>
            </div>
            <div className="flex items-center gap-2">
              <span>💳</span>
              <span>Secure Payments</span>
            </div>
          </div>

          {/* Formula Transparency Tabs */}
          <div className="pt-4 border-t border-[#F0EAE8]">
            <div className="flex border-b border-[#F0EAE8] gap-6 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('benefits')}
                className={`pb-2 transition-all ${
                  activeTab === 'benefits' ? 'border-b-2 border-burgundy text-burgundy font-bold' : 'text-muted hover:text-charcoal'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('ingredients')}
                className={`pb-2 transition-all ${
                  activeTab === 'ingredients' ? 'border-b-2 border-burgundy text-burgundy font-bold' : 'text-muted hover:text-charcoal'
                }`}
              >
                Ingredients
              </button>
              <button
                onClick={() => setActiveTab('howToUse')}
                className={`pb-2 transition-all ${
                  activeTab === 'howToUse' ? 'border-b-2 border-burgundy text-burgundy font-bold' : 'text-muted hover:text-charcoal'
                }`}
              >
                How to Use
              </button>
              <button
                onClick={() => setActiveTab('safety')}
                className={`pb-2 transition-all ${
                  activeTab === 'safety' ? 'border-b-2 border-burgundy text-burgundy font-bold' : 'text-muted hover:text-charcoal'
                }`}
              >
                Reviews
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
