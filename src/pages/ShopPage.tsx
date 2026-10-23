import React, { useState, useMemo } from 'react';
import { Filter, SlidersHorizontal, ArrowUpDown, X, Check, Search, Sparkles, LayoutGrid, Grid3X3 } from 'lucide-react';
import { ProductCard } from '../components/common/ProductCard';
import { store } from '../lib/store';

interface ShopPageProps {
  onNavigate: (route: string) => void;
  initialCategory?: string;
}

export const ShopPage: React.FC<ShopPageProps> = ({ onNavigate, initialCategory }) => {
  const allProducts = store.getPublishedProducts();
  const categories = store.getCategories();

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedSkinConcern, setSelectedSkinConcern] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('bestseller');
  const [maxPrice, setMaxPrice] = useState<number>(3000);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);
  const [gridCols, setGridCols] = useState<'3' | '4'>('4');

  // Extract unique brands and concerns
  const availableBrands = useMemo(() => {
    return Array.from(new Set(allProducts.map(p => p.brand)));
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
      // Category filter
      if (selectedCategory !== 'all') {
        const cat = categories.find(c => c.slug === selectedCategory);
        if (cat && p.category !== cat.name && p.categoryId !== cat.id) return false;
      }

      // Brand filter
      if (selectedBrand !== 'all' && p.brand !== selectedBrand) return false;

      // Concern filter
      if (selectedSkinConcern !== 'all' && !p.skinConcern?.includes(selectedSkinConcern)) return false;

      // Price filter
      if (p.defaultPrice > maxPrice) return false;

      // In-stock filter
      if (inStockOnly) {
        const defaultVar = p.variants.find(v => v.isDefault) || p.variants[0];
        if (defaultVar && defaultVar.stockQuantity <= defaultVar.reservedQuantity) return false;
      }

      return p.isPublished;
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Luxury Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#EFE7E1]">
        <div className="space-y-2">
          <span className="text-[11px] font-black uppercase tracking-[0.25em] text-berry">
            The Complete Portfolio
          </span>
          <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl text-charcoal leading-tight">
            Curated Formulations
          </h1>
          <p className="text-xs sm:text-sm text-muted font-sans font-normal">
            Displaying {filteredProducts.length} dermatologically verified beauty essentials ready for 15-minute dispatch.
          </p>
        </div>

        {/* Sorting Dropdown & View Mode Controls */}
        <div className="flex items-center gap-3">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#EFE7E1] bg-white text-xs font-bold text-charcoal shadow-subtle"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-berry" />
            <span>Filters ({hasActiveFilters ? 'Active' : 'All'})</span>
          </button>

          {/* Desktop Grid Layout Switcher */}
          <div className="hidden lg:flex items-center gap-1 glass-pill p-1 rounded-xl shadow-subtle border border-[#EFE7E1]">
            <button
              onClick={() => setGridCols('3')}
              className={`p-1.5 rounded-lg transition-colors ${gridCols === '3' ? 'bg-berry text-white' : 'text-charcoal hover:bg-black/5'}`}
              title="Large Editorial Grid (3 columns)"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setGridCols('4')}
              className={`p-1.5 rounded-lg transition-colors ${gridCols === '4' ? 'bg-berry text-white' : 'text-charcoal hover:bg-black/5'}`}
              title="Compact Grid (4 columns)"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 glass-pill px-3 py-2 rounded-xl border border-[#EFE7E1] shadow-subtle">
            <ArrowUpDown className="w-3.5 h-3.5 text-berry" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs font-bold text-charcoal focus:outline-none cursor-pointer"
            >
              <option value="bestseller">Featured & Bestsellers</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">New Arrivals</option>
              <option value="rating">Highest Rated</option>
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

      {/* Main Grid with Sidebar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Left Filter Sidebar */}
        <aside className={`md:block space-y-6 ${mobileFilterOpen ? 'block' : 'hidden'}`}>
          <div className="bg-white p-6 rounded-3xl border border-[#EFE7E1] shadow-subtle space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFE7E1]">
              <span className="font-heading font-extrabold text-xs uppercase tracking-widest text-charcoal flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-berry" />
                <span>Filter Formulations</span>
              </span>
              <button
                onClick={resetFilters}
                className="text-xs font-bold text-berry hover:underline"
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
                  className={`w-full text-left px-3 py-2 rounded-xl transition-all ${
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
                    className={`w-full text-left px-3 py-2 rounded-xl transition-all ${
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
                  className={`w-full text-left px-3 py-2 rounded-xl transition-all ${
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
                    className={`w-full text-left px-3 py-2 rounded-xl transition-all ${
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
                    className={`w-full text-left px-3 py-2 rounded-xl transition-all ${
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
                      className={`w-full text-left px-3 py-2 rounded-xl transition-all ${
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
