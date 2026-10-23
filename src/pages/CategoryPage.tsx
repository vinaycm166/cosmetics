import React from 'react';
import { ChevronRight, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { store } from '../lib/store';
import { ProductCard } from '../components/common/ProductCard';

interface CategoryPageProps {
  slug: string;
  onNavigate: (route: string) => void;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({ slug, onNavigate }) => {
  const category = store.getCategoryBySlug(slug);
  const allProducts = store.getPublishedProducts();

  if (!category) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="font-editorial text-4xl text-charcoal">Category Not Found</h2>
        <p className="text-xs text-muted">This beauty collection is currently being updated.</p>
        <button onClick={() => onNavigate('/shop')} className="dew-btn-berry text-xs mt-2 !px-7 !py-3">
          Browse All Collections
        </button>
      </div>
    );
  }

  const categoryProducts = allProducts.filter(
    p => p.category.toLowerCase() === category.name.toLowerCase() || p.categoryId === category.id
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Luxury Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted">
        <button onClick={() => onNavigate('/')} className="hover:text-berry font-medium transition-colors">Home</button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button onClick={() => onNavigate('/shop')} className="hover:text-berry font-medium transition-colors">Catalog</button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-charcoal font-bold">{category.name}</span>
      </nav>

      {/* Editorial Category Banner */}
      <div className="rounded-3xl border border-[#EFE7E1] bg-[#FAF7F4] shadow-card p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="max-w-2xl space-y-3 z-10 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-berry/10 text-berry text-[10px] font-black uppercase tracking-widest border border-berry/20">
            <span>Curated Portfolio</span>
            <span>•</span>
            <span>{categoryProducts.length} Formulations</span>
          </div>
          <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl text-charcoal tracking-tight leading-tight">
            {category.name}
          </h1>
          <p className="text-xs sm:text-sm text-charcoal/70 leading-relaxed font-sans font-normal max-w-lg">
            {category.description || 'Authentic formulations with clinically verified active ingredients, stored in cold-chain conditions and delivered in 15 minutes.'}
          </p>
          <div className="pt-2 flex items-center gap-4 text-xs font-semibold text-charcoal">
            <span className="flex items-center gap-1.5 text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              15-Min Express Delivery Ready
            </span>
            <span className="text-muted">•</span>
            <span className="text-berry font-bold">100% Genuine Retail Formulations</span>
          </div>
        </div>

        {/* Real photographic category thumbnail with luxury bevel */}
        <div className="w-36 h-36 md:w-56 md:h-56 rounded-3xl overflow-hidden border border-white/80 bg-white shadow-3d-float shrink-0 p-2">
          <img src={category.imageUrl} alt={category.name} className="w-full h-full object-cover rounded-2xl hover:scale-105 transition-transform duration-700" />
        </div>
      </div>

      {/* Products Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#EFE7E1]">
          <span className="text-xs font-extrabold uppercase tracking-widest text-charcoal">
            Showing {categoryProducts.length} Formulations
          </span>
          <span className="text-xs font-bold text-berry flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Temperature Monitored Storage</span>
          </span>
        </div>

        {categoryProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#EFE7E1] p-16 text-center max-w-md mx-auto space-y-4 shadow-card">
            <p className="text-xs text-muted">
              Fresh inventory is being catalogued for this category. Explore our other formulations!
            </p>
            <button onClick={() => onNavigate('/shop')} className="dew-btn-berry text-xs !px-6 !py-2.5">
              Explore All Collections
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {categoryProducts.map(product => (
              <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
