import React, { useState, useRef } from 'react';
import { Heart, ShoppingBag, Star, Check, Eye, X, ShieldCheck, Zap } from 'lucide-react';
import { Product, ProductVariant } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { ProductImage } from './ProductImage';

interface ProductCardProps {
  product: Product;
  onNavigate: (route: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onNavigate }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(() => {
    return product.variants.find(v => v.isDefault) || product.variants[0];
  });

  const [added, setAdded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const price = selectedVariant?.price ?? product.defaultPrice;
  const originalPrice = selectedVariant?.originalPrice ?? product.defaultOriginalPrice;
  const discount = selectedVariant?.discountPercentage ?? product.defaultDiscount;
  const inStock = selectedVariant ? selectedVariant.stockQuantity > selectedVariant.reservedQuantity : true;
  const wishlisted = isInWishlist(product.id);

  const primaryImage = product.images[0] || '';
  const secondaryImage = product.images[1] || null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!inStock) return;

    const res = addToCart(product, selectedVariant, 1);
    if (res.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 1600);
    }
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleVariantSelect = (e: React.MouseEvent, variant: ProductVariant) => {
    e.stopPropagation();
    setSelectedVariant(variant);
  };

  return (
    <>
      <div
        onClick={() => onNavigate(`/product/${product.slug}`)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative bg-white border border-[#EFE7E1] rounded-2xl overflow-hidden flex flex-col justify-between cursor-pointer shadow-subtle hover:shadow-card hover:-translate-y-1 hover:border-berry/30 transition-all duration-300 select-none"
      >
        {/* 1. Packshot Container */}
        <div className="relative aspect-square w-full bg-[#FAF7F4] overflow-hidden flex items-center justify-center p-3">
          <ProductImage
            src={isHovered && secondaryImage ? secondaryImage : primaryImage}
            alt={product.name}
            brand={product.brand}
            category={product.category}
            className="w-full h-full object-contain transition-transform duration-500 ease-out group-hover:scale-105"
          />

          {/* Luxury Discount Pill */}
          {discount && discount > 0 ? (
            <span className="absolute top-3.5 left-3.5 glass-pill px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-sale shadow-subtle border border-sale/20">
              {discount}% OFF
            </span>
          ) : product.isBestseller ? (
            <span className="absolute top-3.5 left-3.5 glass-pill-dark px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest text-champagne-300 shadow-subtle border border-champagne-400/30">
              Bestseller
            </span>
          ) : null}

          {/* Floating Actions: Wishlist + Quick View */}
          <div className="absolute top-3.5 right-3.5 flex flex-col gap-1.5 z-10">
            <button
              onClick={handleWishlistClick}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
              className={`p-2 rounded-full transition-all duration-200 shadow-subtle ${
                wishlisted
                  ? 'bg-rose text-white scale-105'
                  : 'bg-white/90 text-charcoal/70 hover:text-rose hover:bg-white'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${wishlisted ? 'fill-white' : ''}`} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setQuickViewOpen(true);
              }}
              title="Quick Inspection"
              className="p-2 rounded-full bg-white/90 text-charcoal/70 hover:text-berry hover:bg-white shadow-subtle transition-all duration-200 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Out of Stock Overlay */}
          {!inStock && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center z-10">
              <span className="glass-pill-dark px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-white shadow-subtle border border-white/20">
                Awaiting Restock
              </span>
            </div>
          )}
        </div>

        {/* 2. Product Details & Merchandising */}
        <div className="p-4 flex-1 flex flex-col justify-between bg-white">
          <div>
            {/* Category / Brand Row */}
            <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-bold mb-1.5">
              <span className="text-berry/90 font-extrabold">{product.brand}</span>
              <div className="flex items-center gap-1 bg-[#FAF7F4] px-1.5 py-0.5 rounded-md border border-[#EFE7E1]">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="text-charcoal font-black text-[11px]">{product.rating.toFixed(1)}</span>
                {product.reviewCount ? (
                  <span className="text-muted text-[10px]">({product.reviewCount})</span>
                ) : null}
              </div>
            </div>

            {/* Product Title */}
            <h3 className="font-heading font-semibold text-xs sm:text-[13px] text-charcoal line-clamp-2 leading-snug group-hover:text-berry transition-colors">
              {product.name}
            </h3>

            {/* Variant Pills */}
            {product.variants.length > 1 ? (
              <div className="flex flex-wrap gap-1 mt-2.5">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={(e) => handleVariantSelect(e, v)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all ${
                      selectedVariant?.id === v.id
                        ? 'border-berry bg-berry/5 text-berry font-extrabold'
                        : 'border-[#EFE7E1] bg-white text-muted hover:border-neutral-400'
                    }`}
                  >
                    {v.variantName.split('(')[0].trim()}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-muted mt-1 truncate">
                {selectedVariant?.variantName || 'Standard formulation'}
              </p>
            )}
          </div>

          {/* 3. Price & Action Row */}
          <div className="mt-3 pt-3 border-t border-[#F5EFEA] flex items-center justify-between gap-2">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm sm:text-base font-extrabold text-charcoal">
                  ₹{price}
                </span>
                {originalPrice && originalPrice > price && (
                  <span className="text-xs text-muted line-through font-medium">
                    ₹{originalPrice}
                  </span>
                )}
              </div>
            </div>

            {/* Tactile Quick Add Button */}
            {inStock ? (
              <button
                onClick={handleAddToCart}
                className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-extrabold tracking-wide transition-all duration-200 active:scale-95 ${
                  added
                    ? 'bg-emerald-700 text-white shadow-subtle'
                    : 'bg-berry hover:bg-berry-dark text-white shadow-subtle'
                }`}
              >
                {added ? (
                  <span className="flex items-center gap-1 text-[11px]">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" /> Added
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px]">
                    <ShoppingBag className="w-3.5 h-3.5" /> Add
                  </span>
                )}
              </button>
            ) : (
              <span className="text-[10px] text-muted font-bold bg-neutral-100 px-2.5 py-1 rounded-md">
                Sold Out
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewOpen && (
        <div 
          onClick={() => setQuickViewOpen(false)}
          className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-border relative overflow-hidden"
          >
            <button
              onClick={() => setQuickViewOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 text-charcoal transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex gap-5">
              <div className="w-1/2 aspect-square rounded-2xl bg-[#FAF7F4] p-2 flex items-center justify-center overflow-hidden border border-border">
                <ProductImage 
                  src={primaryImage} 
                  alt={product.name} 
                  brand={product.brand}
                  category={product.category}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="w-1/2 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-extrabold text-berry tracking-widest uppercase">
                    {product.brand}
                  </span>
                  <h4 className="font-heading font-bold text-sm text-charcoal mt-1 line-clamp-2">
                    {product.name}
                  </h4>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-lg font-black text-charcoal">₹{price}</span>
                    {originalPrice && originalPrice > price && (
                      <span className="text-xs text-muted line-through">₹{originalPrice}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted mt-2.5 line-clamp-3 leading-relaxed">
                    {product.shortDescription || product.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-border mt-3 space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800">
                    <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                    <span>In stock • Dispatches in 15 mins</span>
                  </div>
                  <button
                    onClick={(e) => {
                      handleAddToCart(e);
                      setQuickViewOpen(false);
                    }}
                    className="w-full dew-btn-berry !py-2.5 text-xs font-extrabold"
                  >
                    Add to Bag (₹{price})
                  </button>
                  <button
                    onClick={() => {
                      setQuickViewOpen(false);
                      onNavigate(`/product/${product.slug}`);
                    }}
                    className="w-full text-center text-xs text-berry font-bold hover:underline py-1"
                  >
                    View Full Product Details →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
