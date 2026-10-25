import React, { useState } from 'react';
import { 
  Sparkles, 
  Droplets, 
  Smile, 
  Flame, 
  Wind, 
  Heart, 
  Wand2, 
  Percent, 
  Gift 
} from 'lucide-react';

interface CategoryImageProps {
  src?: string;
  alt: string;
  name: string;
  isOfferBadge?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const CategoryImage: React.FC<CategoryImageProps> = ({
  src,
  alt,
  name,
  isOfferBadge = false,
  className = 'w-full h-full object-cover',
  size = 'md'
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // If this is an Offer / Sale item, render the signature burgundy & rose pill badge
  if (isOfferBadge) {
    return (
      <div className="w-full h-full rounded-full bg-gradient-to-br from-burgundy via-[#78233C] to-rose-600 flex flex-col items-center justify-center text-white shadow-inner relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Percent className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5] text-white animate-pulse" />
        <span className="text-[9px] font-bold tracking-wider uppercase text-rose-100 mt-0.5">Sale</span>
      </div>
    );
  }

  // If image fails or src is empty, render a luxury stylized icon fallback
  if (!src || hasError) {
    const getFallbackIcon = () => {
      const lower = name.toLowerCase();
      if (lower.includes('skin')) return <Droplets className="w-6 h-6 text-burgundy" />;
      if (lower.includes('make')) return <Smile className="w-6 h-6 text-rose-600" />;
      if (lower.includes('hair')) return <Flame className="w-6 h-6 text-amber-600" />;
      if (lower.includes('fragran') || lower.includes('perfum')) return <Wind className="w-6 h-6 text-purple-600" />;
      if (lower.includes('bath') || lower.includes('body')) return <Heart className="w-6 h-6 text-emerald-600" />;
      if (lower.includes('tool') || lower.includes('brush')) return <Wand2 className="w-6 h-6 text-burgundy" />;
      if (lower.includes('arrival') || lower.includes('new')) return <Sparkles className="w-6 h-6 text-amber-500" />;
      return <Gift className="w-6 h-6 text-burgundy" />;
    };

    return (
      <div className="w-full h-full rounded-full bg-gradient-to-br from-[#FFF5F2] via-[#FCEFEB] to-[#F5E6E0] flex flex-col items-center justify-center border border-[#F0E0D6] shadow-2xs">
        {getFallbackIcon()}
        <span className="text-[8px] font-bold text-charcoal/70 uppercase tracking-wider mt-1 scale-90">
          {name.slice(0, 3)}
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-full overflow-hidden bg-[#FAF2EE]">
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#FAF2EE] via-[#FFF8F5] to-[#FAF2EE] animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`${className} transition-transform duration-500 group-hover:scale-110 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};
