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
        className="group relative bg-white border border-[#F0EAE8] rounded-xl overflow-hidden flex flex-col justify-between cursor-pointer shadow-subtle hover:shadow-card hover:-translate-y-0.5 hover:border-burgundy/30 transition-all duration-200 select-none"
      >
        {/* 1. Packshot Container */}
        <div className="relative aspect-square w-full bg-[#FAFAF9] overflow-hidden flex items-center justify-center p-2 sm:p-3">
          <ProductImage
            src={isHovered && secondaryImage ? secondaryImage : primaryImage}
            alt={product.name}
            brand={product.brand}
            category={product.category}
            className="w-full h-full object-contain transition-transform duration-300 ease-out group-hover:scale-105"
          />

          {/* Reference Image Bestseller Badge (Peach background with warm orange text) */}
          {product.isBestseller ? (
            <span className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 bg-[#FEF3EB] text-[#C25E1A] px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold tracking-wide">
              Bestseller
            </span>
          ) : null}

          {/* Floating Action: Wishlist Heart */}
          <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 flex items-center z-10">
            <button
              onClick={handleWishlistClick}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
              className={`p-1 sm:p-1.5 rounded-full transition-colors cursor-pointer ${
                wishlisted
                  ? 'text-burgundy'
                  : 'text-neutral-400 hover:text-burgundy'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${wishlisted ? 'fill-burgundy text-burgundy' : ''}`} />
            </button>
          </div>

          {/* Out of Stock Overlay */}
          {!inStock && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-center z-10">
              <span className="bg-charcoal text-white px-2.5 sm:px-3 py-1 rounded text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* 2. Product Details */}
        <div className="p-2.5 sm:p-3.5 flex-1 flex flex-col justify-between bg-white">
          <div>
            {/* Brand */}
            <span className="text-[10px] sm:text-[11px] font-bold text-charcoal block mb-0.5">
              {product.brand}
            </span>

            {/* Product Title */}
            <h3 className="font-heading font-medium text-[11px] sm:text-xs text-charcoal line-clamp-1 leading-snug group-hover:text-burgundy transition-colors">
              {product.name}
            </h3>

            {/* Volume / Size */}
            <p className="text-[10px] sm:text-[11px] text-muted mt-0.5 truncate">
              {selectedVariant?.variantName || 'Standard'}
            </p>
          </div>

          {/* 3. Price Row & Full Width Action Button */}
          <div className="mt-2 pt-1.5 sm:mt-2.5 sm:pt-2 border-t border-[#F5EFEA]">
            <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
              <span className="text-xs sm:text-sm font-bold text-charcoal">
                ₹{price}
              </span>
              {originalPrice && originalPrice > price && (
                <span className="text-[10px] sm:text-xs text-muted line-through">
                  ₹{originalPrice}
                </span>
              )}
              {discount && discount > 0 && (
                <span className="bg-[#E8F7EE] text-[#137333] text-[9px] sm:text-[10px] font-bold px-1 sm:px-1.5 py-0.5 rounded">
                  {discount}% OFF
                </span>
              )}
            </div>

            {/* Full Width Burgundy Button (Matching Reference Image) */}
            <div className="mt-2.5 sm:mt-3">
              {inStock ? (
                <button
                  onClick={handleAddToCart}
                  className={`w-full py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg text-[11px] sm:text-xs font-bold tracking-wide transition-all duration-150 flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer active:scale-95 ${
                    added
                      ? 'bg-emerald-700 text-white'
                      : 'bg-burgundy hover:bg-burgundy-dark text-white'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
                      <span>Added</span>
                    </>
                  ) : (
                    <span>Add to Cart</span>
                  )}
                </button>
              ) : (
                <button
                  disabled
                  className="w-full py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg text-[11px] sm:text-xs font-semibold bg-neutral-100 text-neutral-400 cursor-not-allowed"
                >
                  Sold Out
                </button>
              )}
            </div>
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
