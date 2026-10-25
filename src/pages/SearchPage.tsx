import React, { useState, useMemo } from 'react';
import { Search, Sparkles, X, ArrowRight } from 'lucide-react';
import { usePublishedProducts } from '../lib/useStore';
import { ProductCard } from '../components/common/ProductCard';

interface SearchPageProps {
  initialQuery?: string;
  onNavigate: (route: string) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({ initialQuery = '', onNavigate }) => {
  const [query, setQuery] = useState(initialQuery);
  const allProducts = usePublishedProducts();

  const searchResults = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return allProducts;

    return allProducts.filter(p => {
      const matchName = p.name.toLowerCase().includes(q);
      const matchBrand = p.brand.toLowerCase().includes(q);
      const matchCategory = p.category.toLowerCase().includes(q);
      const matchConcern = p.skinConcern?.some(c => c.toLowerCase().includes(q));
      const matchIngredients = p.ingredients?.toLowerCase().includes(q);
      const matchDesc = p.description?.toLowerCase().includes(q);
      const matchSku = p.variants?.some(v => v.sku?.toLowerCase().includes(q) || (v as any).barcode?.toLowerCase().includes(q));
      return matchName || matchBrand || matchCategory || matchConcern || matchIngredients || matchDesc || matchSku;
    });
  }, [query, allProducts]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Luxury Search Header */}
      <div className="max-w-2xl mx-auto text-center space-y-4">
        <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-berry">
          Direct Discovery
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl text-charcoal tracking-tight">
          Find Your Formula
        </h1>
        <p className="text-xs sm:text-sm text-muted font-sans font-normal">
          Search by bioactive ingredients (Niacinamide, Ceramides, Peptides), product type, or skin concern.
        </p>

        <div className="relative pt-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search skincare, makeup, brands, active ingredients..."
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl border border-[#EFE7E1] bg-white text-xs sm:text-sm font-medium text-charcoal shadow-card focus:outline-none focus:border-berry transition-all"
          />
          <Search className="w-4 h-4 text-berry absolute left-4 top-1/2 -translate-y-1/2 mt-1" />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 mt-1 text-muted hover:text-charcoal p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Popular Query Badges */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 text-xs">
          <span className="text-muted text-[10px] font-extrabold uppercase tracking-widest mr-1">Trending Searches:</span>
          {['Sunscreen', 'Niacinamide', 'Lip Oil', 'Ceramide', 'Rosemary', 'Blush', 'Peptides'].map((term) => (
            <button
              key={term}
              onClick={() => setQuery(term)}
              className="px-3 py-1 rounded-full glass-pill hover:bg-white text-charcoal text-xs font-semibold border border-[#EFE7E1] transition-all hover:border-berry/40"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#EFE7E1]">
        <p className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-charcoal">
          {query ? `Search results for "${query}"` : 'All Beauty Essentials'} ({searchResults.length} Formulations)
        </p>
      </div>

      {/* Grid or Empty State */}
      {searchResults.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#EFE7E1] p-16 text-center max-w-md mx-auto space-y-4 shadow-card">
          <div className="w-12 h-12 rounded-full bg-berry/10 flex items-center justify-center text-berry mx-auto">
            <Search className="w-5 h-5" />
          </div>
          <h3 className="font-editorial text-3xl text-charcoal">No Matching Formulations Found</h3>
          <p className="text-xs text-muted max-w-xs mx-auto">
            Try checking for alternate ingredient names or explore our bestselling curated collections.
          </p>
          <div className="pt-2 flex justify-center gap-2">
            <button
              onClick={() => setQuery('')}
              className="glass-pill px-5 py-2.5 rounded-xl text-xs font-bold text-charcoal border border-[#EFE7E1]"
            >
              Clear Search
            </button>
            <button
              onClick={() => onNavigate('/shop')}
              className="dew-btn-berry text-xs !px-6 !py-2.5"
            >
              Browse All
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {searchResults.map(product => (
            <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
          ))}
        </div>
      )}

    </div>
  );
};
