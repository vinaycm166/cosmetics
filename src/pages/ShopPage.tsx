import React, { useState, useMemo } from 'react';
import { Filter, SlidersHorizontal, ArrowUpDown, X, Check, Search, Sparkles, LayoutGrid, Grid3X3 } from 'lucide-react';
import { ProductCard } from '../components/common/ProductCard';
import { usePublishedProducts, useCategories } from '../lib/useStore';

interface ShopPageProps {
  onNavigate: (route: string) => void;
  initialCategory?: string;
}

export const ShopPage: React.FC<ShopPageProps> = ({ onNavigate, initialCategory }) => {
  const allProducts = usePublishedProducts();
  const categories = useCategories();

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedSkinConcern, setSelectedSkinConcern] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('bestseller');
  
  const maxPriceLimit = useMemo(() => {
    const prices = allProducts.map(p => p.defaultPrice || 0);
    return Math.max(3000, ...prices);
  }, [allProducts]);

  const [maxPrice, setMaxPrice] = useState<number>(3000);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);
  const [gridCols, setGridCols] = useState<'3' | '4'>('4');

  // Extract unique brands and concerns
  const availableBrands = useMemo(() => {
    return Array.from(new Set(allProducts.map(p => p.brand).filter(Boolean)));
  }, [allProducts]);

  const availableConcerns = useMemo(() => {
    const set = new Set<string>();
    allProducts.forEach(p => {
      p.skinConcern?.forEach(c => set.add(c));
    });
    return Array.from(set);
  }, [allProducts]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return allProducts.filter(p => {
      // Category filter (case-insensitive and ID-aware)
      if (selectedCategory !== 'all') {
        const cat = categories.find(c => c.slug.toLowerCase() === selectedCategory.toLowerCase());
        const catName = cat?.name?.toLowerCase();
        const pCat = p.category?.toLowerCase();
        const pCatId = p.categoryId?.toLowerCase();
        const matches = (catName && pCat === catName) || (cat && pCatId === cat.id.toLowerCase()) || pCat === selectedCategory.toLowerCase();
        if (!matches) return false;
      }

      // Brand filter
      if (selectedBrand !== 'all' && p.brand.toLowerCase() !== selectedBrand.toLowerCase()) return false;

      // Concern filter
      if (selectedSkinConcern !== 'all' && !p.skinConcern?.some(c => c.toLowerCase() === selectedSkinConcern.toLowerCase())) return false;

      // Price filter
      if (p.defaultPrice > maxPrice) return false;

      // In-stock filter
      if (inStockOnly) {
        const defaultVar = p.variants.find(v => v.isDefault) || p.variants[0];
        if (defaultVar && defaultVar.stockQuantity <= defaultVar.reservedQuantity) return false;
      }

      // Live publication requirement
      return Boolean(p.isPublished || p.status === 'published') && p.status !== 'draft' && p.defaultPrice > 0;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.defaultPrice - b.defaultPrice;
      if (sortBy === 'price-desc') return b.defaultPrice - a.defaultPrice;
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'rating') return b.rating - a.rating;
      // bestseller default
      return (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0);
    });
  }, [allProducts, categories, selectedCategory, selectedBrand, selectedSkinConcern, maxPrice, inStockOnly, sortBy]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedBrand('all');
    setSelectedSkinConcern('all');
    setMaxPrice(3000);
    setInStockOnly(false);
  };

  const hasActiveFilters = selectedCategory !== 'all' || selectedBrand !== 'all' || selectedSkinConcern !== 'all' || inStockOnly || maxPrice < 3000;

  const renderFilterContent = () => (
    <div className="bg-white p-5 sm:p-6 rounded-2xl md:rounded-3xl border border-[#EFE7E1] shadow-subtle space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-[#EFE7E1]">
        <span className="font-heading font-extrabold text-xs uppercase tracking-widest text-charcoal flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-berry" />
          <span>Filter Formulations</span>
        </span>
        <button
          onClick={resetFilters}
          className="text-xs font-bold text-berry hover:underline cursor-pointer"
        >
          Reset
        </button>
      </div>

      {/* Category Filter */}
      <div>
        <h4 className="text-[11px] font-black uppercase tracking-widest text-muted mb-2.5">
          Category
        </h4>
        <div className="space-y-1 text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`w-full text-left px-3 py-2 rounded-xl transition-all cursor-pointer ${
              selectedCategory === 'all' 
                ? 'bg-berry text-white font-extrabold shadow-subtle' 
                : 'text-charcoal hover:bg-[#FAF7F4]'
            }`}
          >
            All Categories ({allProducts.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`w-full text-left px-3 py-2 rounded-xl transition-all cursor-pointer ${
                selectedCategory === cat.slug 
                  ? 'bg-berry text-white font-extrabold shadow-subtle' 
                  : 'text-charcoal hover:bg-[#FAF7F4]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Brand Filter */}
      <div className="pt-4 border-t border-[#EFE7E1]">
        <h4 className="text-[11px] font-black uppercase tracking-widest text-muted mb-2.5">
          Brand
        </h4>
        <div className="space-y-1 text-xs max-h-48 overflow-y-auto pr-1">
          <button
            onClick={() => setSelectedBrand('all')}
            className={`w-full text-left px-3 py-2 rounded-xl transition-all cursor-pointer ${
              selectedBrand === 'all' 
                ? 'bg-berry text-white font-extrabold shadow-subtle' 
                : 'text-charcoal hover:bg-[#FAF7F4]'
            }`}
          >
            All Brands
          </button>
          {availableBrands.map(b => (
            <button
              key={b}
              onClick={() => setSelectedBrand(b)}
              className={`w-full text-left px-3 py-2 rounded-xl transition-all cursor-pointer ${
                selectedBrand === b 
                  ? 'bg-berry text-white font-extrabold shadow-subtle' 
                  : 'text-charcoal hover:bg-[#FAF7F4]'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Skin Concern Filter */}
      {availableConcerns.length > 0 && (
        <div className="pt-4 border-t border-[#EFE7E1]">
          <h4 className="text-[11px] font-black uppercase tracking-widest text-muted mb-2.5">
            Skin Target
          </h4>
          <div className="space-y-1 text-xs">
            <button
              onClick={() => setSelectedSkinConcern('all')}
              className={`w-full text-left px-3 py-2 rounded-xl transition-all cursor-pointer ${
                selectedSkinConcern === 'all' 
                  ? 'bg-berry text-white font-extrabold shadow-subtle' 
                  : 'text-charcoal hover:bg-[#FAF7F4]'
              }`}
            >
              All Skin Concerns
            </button>
            {availableConcerns.map(c => (
              <button
                key={c}
                onClick={() => setSelectedSkinConcern(c)}
                className={`w-full text-left px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  selectedSkinConcern === c 
                    ? 'bg-berry text-white font-extrabold shadow-subtle' 
                    : 'text-charcoal hover:bg-[#FAF7F4]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price Filter */}
      <div className="pt-4 border-t border-[#EFE7E1]">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-black uppercase tracking-widest text-[11px] text-muted">Max Price</span>
          <span className="font-extrabold text-charcoal">₹{maxPrice}</span>
        </div>
        <input
          type="range"
          min="200"
          max="3000"
          step="50"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-berry cursor-pointer"
        />
      </div>

      {/* In Stock Only Checkbox */}
      <div className="pt-4 border-t border-[#EFE7E1]">
        <label className="flex items-center gap-2.5 text-xs font-bold text-charcoal cursor-pointer">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="rounded border-[#EFE7E1] text-berry focus:ring-berry"
          />
          <span>In Stock & Ready (15m Dispatch)</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-muted -mb-4">
        <button onClick={() => onNavigate('/')} className="hover:text-burgundy transition-colors">Home</button>
        <span>&gt;</span>
        <span className="text-charcoal font-semibold capitalize">{selectedCategory === 'all' ? 'Skincare' : selectedCategory}</span>
      </nav>

      {/* Header Matching Reference Image */}
      <div className="space-y-3 pb-6 border-b border-[#F0EAE8]">
        <h1 className="font-editorial text-4xl sm:text-5xl font-bold text-charcoal tracking-tight capitalize">
          {selectedCategory === 'all' ? 'Skincare' : selectedCategory}
        </h1>
        <p className="text-xs sm:text-sm text-muted font-sans font-normal">
          Cleansers, moisturizers, serums, sunscreens and more for healthy, glowing skin.
        </p>

        {/* Quick Brand Filter Pills Row */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {['all', 'CeraVe', 'Minimalist', 'The Ordinary', 'La Roche-Posay', 'Clinique', 'Neutrogena'].map((brand) => (
            <button
              key={brand}
              onClick={() => setSelectedBrand(brand === 'all' ? 'all' : brand)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                (brand === 'all' && selectedBrand === 'all') || selectedBrand === brand
                  ? 'bg-burgundy text-white font-bold shadow-2xs'
                  : 'bg-white hover:bg-[#FAF8F6] text-charcoal border border-[#EFE7E1]'
              }`}
            >
              {brand === 'all' ? 'All' : brand}
            </button>
          ))}
        </div>
      </div>

      {/* Products Count & Sorting Bar */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-muted font-medium">
          {filteredProducts.length} products
        </span>

        <div className="flex items-center gap-2">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#EFE7E1] bg-white text-xs font-bold text-charcoal shadow-2xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-burgundy" />
            <span>Filters</span>
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <span className="hidden sm:inline">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-[#EFE7E1] rounded-lg px-2.5 py-1.5 text-xs font-semibold text-charcoal focus:outline-none cursor-pointer"
            >
              <option value="bestseller">Popularity</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest First</option>
              <option value="rating">Customer Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Chips Ribbon */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-1 pb-2">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted mr-1">
            Applied:
          </span>
          {selectedCategory !== 'all' && (
            <span className="glass-pill px-3 py-1 rounded-full text-xs font-semibold text-charcoal flex items-center gap-1.5 border border-berry/20">
              Category: {selectedCategory}
              <button onClick={() => setSelectedCategory('all')} className="text-muted hover:text-charcoal">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedBrand !== 'all' && (
            <span className="glass-pill px-3 py-1 rounded-full text-xs font-semibold text-charcoal flex items-center gap-1.5 border border-berry/20">
              Brand: {selectedBrand}
              <button onClick={() => setSelectedBrand('all')} className="text-muted hover:text-charcoal">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedSkinConcern !== 'all' && (
            <span className="glass-pill px-3 py-1 rounded-full text-xs font-semibold text-charcoal flex items-center gap-1.5 border border-berry/20">
              Concern: {selectedSkinConcern}
              <button onClick={() => setSelectedSkinConcern('all')} className="text-muted hover:text-charcoal">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {inStockOnly && (
            <span className="glass-pill px-3 py-1 rounded-full text-xs font-semibold text-charcoal flex items-center gap-1.5 border border-berry/20">
              In Stock Only
              <button onClick={() => setInStockOnly(false)} className="text-muted hover:text-charcoal">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            onClick={resetFilters}
            className="text-xs font-bold text-berry hover:underline ml-2"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Mobile Accessible Filter Drawer Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          <div 
            className="fixed inset-0 bg-charcoal/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative w-full max-w-xs bg-[#FAF7F4] h-full shadow-2xl flex flex-col z-10 animate-fade-in">
            <div className="flex items-center justify-between p-4 bg-white border-b border-[#EFE7E1]">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-burgundy" />
                <span className="font-heading font-extrabold text-xs uppercase tracking-wider text-charcoal">Filter Formulations</span>
              </div>
              <button 
                onClick={() => setMobileFilterOpen(false)}
                className="p-1.5 rounded-full hover:bg-neutral-100 text-charcoal cursor-pointer"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {renderFilterContent()}
            </div>
            <div className="p-4 border-t border-[#EFE7E1] bg-white flex gap-2 shrink-0">
              <button 
                onClick={resetFilters}
                className="flex-1 py-2.5 rounded-xl border border-[#EFE7E1] text-xs font-bold text-charcoal hover:bg-neutral-50 cursor-pointer"
              >
                Reset All
              </button>
              <button 
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-burgundy text-white text-xs font-bold hover:bg-burgundy-dark shadow-xs cursor-pointer"
              >
                View ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid with Sidebar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Left Filter Sidebar (Desktop) */}
        <aside className="hidden md:block space-y-6">
          {renderFilterContent()}
        </aside>

        {/* Right Product Grid */}
        <div className="md:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-[#EFE7E1] space-y-4">
              <span className="text-3xl">✨</span>
              <h3 className="font-editorial text-3xl text-charcoal">No Matching Formulations</h3>
              <p className="text-xs text-muted max-w-sm mx-auto">
                No items match your active filters. Try loosening your criteria or resetting your parameters.
              </p>
              <button onClick={resetFilters} className="dew-btn-berry text-xs !px-6 !py-2.5">
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className={`grid gap-4 sm:gap-6 ${
              gridCols === '3' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
            }`}>
              {filteredProducts.map(p => (
                <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
