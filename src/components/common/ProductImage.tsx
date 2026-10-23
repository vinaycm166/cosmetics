import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface ProductImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  containerClassName?: string;
  brand?: string;
  category?: string;
  aspectRatio?: 'square' | 'portrait' | 'auto';
  objectFit?: 'contain' | 'cover';
  showBadgeOnFallback?: boolean;
  badge?: boolean;
}

/**
 * Validates whether a provided image URL is plausible and loadable
 */
export const isValidImageUrl = (url?: string | null): boolean => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') return false;
  
  // Must be http/https URL, data URI, or blob URI
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('blob:')
  ) {
    return true;
  }

  // Reject local file paths like "Minimalist/SKU0001.jpg" which are unhosted
  return false;
};

/**
 * Premium, reliable cosmetics product image renderer
 * 1. Checks URL validity
 * 2. Handles failed network loads (onError)
 * 3. Never leaves a blank or broken space
 * 4. Displays a designed neutral luxury cosmetic placeholder
 */
export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  className = 'w-full h-full object-contain',
  containerClassName = '',
  brand,
  category,
  aspectRatio = 'square',
  objectFit = 'contain',
  showBadgeOnFallback = true,
  badge,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const effectiveBadge = badge !== undefined ? badge : showBadgeOnFallback;

  const validUrl = isValidImageUrl(src);
  const shouldRenderImage = validUrl && !hasError;

  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === 'portrait'
      ? 'aspect-[3/4]'
      : '';

  if (!shouldRenderImage) {
    // Elegant luxury cosmetics neutral placeholder
    const brandInitials = brand
      ? brand
          .split(' ')
          .map((w) => w[0])
          .slice(0, 2)
          .join('')
          .toUpperCase()
      : 'DG';

    return (
      <div
        className={`relative w-full h-full bg-gradient-to-b from-[#FAF7F4] via-[#F6F1EC] to-[#EFE7E1] flex flex-col items-center justify-center p-4 text-center select-none ${aspectClass} ${containerClassName}`}
        role="img"
        aria-label={`${alt} (Image pending verification)`}
      >
        {/* Subtle decorative luxury border ring */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-champagne-300/60 bg-white/70 shadow-subtle flex flex-col items-center justify-center relative mb-2">
          {/* Minimalist cosmetic bottle icon */}
          <svg
            className="w-8 h-8 sm:w-10 sm:h-10 text-berry/75"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Dropper Cap & Pipette */}
            <path d="M10 2h4" />
            <path d="M12 2v3" />
            <path d="M9 5h6v2H9z" />
            {/* Bottle Body */}
            <path d="M8 7h8a2 2 0 0 1 2 2v10a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V9a2 2 0 0 1 2-2z" />
            {/* Level Fill Accent */}
            <path d="M8 14h8" strokeDasharray="2 2" opacity="0.6" />
          </svg>
          <span className="text-[9px] font-extrabold tracking-widest text-berry font-mono -mt-1 opacity-80">
            {brandInitials}
          </span>
        </div>

        {/* Brand & Category Label */}
        <div className="max-w-[85%] space-y-0.5">
          <span className="text-[10px] font-bold text-charcoal/80 block truncate">
            {brand || 'Dew & Go'}
          </span>
          <span className="text-[9px] text-muted tracking-wider uppercase font-semibold block truncate">
            {category || 'Cosmetics'}
          </span>
        </div>

        {/* Fallback Review Badge */}
        {effectiveBadge && (
          <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/90 border border-[#E4D9D0] text-[9px] font-bold text-charcoal/70 shadow-xs">
            <Sparkles className="w-2.5 h-2.5 text-champagne-500" />
            <span>Image Pending</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full overflow-hidden flex items-center justify-center bg-[#FAF7F4] ${aspectClass} ${containerClassName}`}>
      {/* Loading state skeleton glow */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-warmcream via-white to-warmcream animate-pulse" />
      )}

      <img
        src={src!}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`${className} transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${objectFit === 'cover' ? 'object-cover' : 'object-contain'}`}
      />
    </div>
  );
};
