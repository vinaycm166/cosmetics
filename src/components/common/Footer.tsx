import React from 'react';
import { ShieldCheck, Clock, Award, Lock, Sparkles } from 'lucide-react';

interface FooterProps {
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-white border-t border-border pt-14 pb-12 text-charcoal">
      
      {/* 1. Trust Badges Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="flex items-center gap-3.5 p-4 rounded-xl bg-warmcream border border-border/80 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-blush flex items-center justify-center text-berry shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal">15-Min Delivery</h4>
              <p className="text-[11px] text-muted">Hyperlocal micro-hubs in your city</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-xl bg-warmcream border border-border/80 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-blush flex items-center justify-center text-berry shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal">100% Authentic</h4>
              <p className="text-[11px] text-muted">Direct from certified beauty brands</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-xl bg-warmcream border border-border/80 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-blush flex items-center justify-center text-berry shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal">Secure Checkout</h4>
              <p className="text-[11px] text-muted">Razorpay 256-bit SSL & COD</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-xl bg-warmcream border border-border/80 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-blush flex items-center justify-center text-berry shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal">Active Integrity</h4>
              <p className="text-[11px] text-muted">Temperature-controlled storage</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Brand Col */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-baseline gap-1.5">
              <span className="font-editorial text-3xl tracking-tight text-charcoal">
                DEW & GO
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-champagne-500 inline-block shadow-sm"></span>
            </div>
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-berry font-mono -mt-2">
              HAUTE QUICK-COMMERCE
            </p>
            <p className="text-xs text-muted leading-relaxed max-w-sm">
              Discover the skincare, makeup, and beauty essentials you love — all in one place. Formulated with proven actives, curated by experts, and brought to your door in 15 minutes.
            </p>
            
            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a href="#instagram" aria-label="Instagram" className="w-8 h-8 rounded-full bg-warmcream border border-border flex items-center justify-center text-charcoal hover:text-rose hover:border-rose transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="#youtube" aria-label="YouTube" className="w-8 h-8 rounded-full bg-warmcream border border-border flex items-center justify-center text-charcoal hover:text-rose hover:border-rose transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              <a href="#twitter" aria-label="Twitter" className="w-8 h-8 rounded-full bg-warmcream border border-border flex items-center justify-center text-charcoal hover:text-rose hover:border-rose transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#facebook" aria-label="Facebook" className="w-8 h-8 rounded-full bg-warmcream border border-border flex items-center justify-center text-charcoal hover:text-rose hover:border-rose transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
            </div>

            <p className="text-xs text-charcoal font-semibold pt-1">
              Customer Care: <a href="mailto:care@dewandgo.com" className="text-rose hover:underline font-bold">care@dewandgo.com</a>
            </p>
          </div>

          {/* Shop Categories */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-berry mb-4">
              Explore Collections
            </h4>
            <ul className="space-y-2.5 text-xs text-muted">
              <li><button onClick={() => onNavigate('/category/skincare')} className="hover:text-rose transition-colors font-medium">Skincare & Barrier Balms</button></li>
              <li><button onClick={() => onNavigate('/category/serums')} className="hover:text-rose transition-colors font-medium">Active Niacinamide & Vitamin C</button></li>
              <li><button onClick={() => onNavigate('/category/sunscreen')} className="hover:text-rose transition-colors font-medium">Invisible SPF 50+ Sunscreens</button></li>
              <li><button onClick={() => onNavigate('/category/lip-care')} className="hover:text-rose transition-colors font-medium">Peptide Glaze Lip Tint Oils</button></li>
              <li><button onClick={() => onNavigate('/category/makeup')} className="hover:text-rose transition-colors font-medium">Seamless Liquid Blushes & Tints</button></li>
              <li><button onClick={() => onNavigate('/category/haircare')} className="hover:text-rose transition-colors font-medium">Rosemary Scalp Density Oils</button></li>
              <li><button onClick={() => onNavigate('/category/fragrance')} className="hover:text-rose transition-colors font-medium">Fine Artisanal Parfumerie</button></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-berry mb-4">
              Customer Service
            </h4>
            <ul className="space-y-2.5 text-xs text-muted">
              <li><button onClick={() => onNavigate('/account/orders')} className="hover:text-rose transition-colors font-medium">Track Your Hyperlocal Order</button></li>
              <li><button onClick={() => onNavigate('/faq')} className="hover:text-rose transition-colors font-medium">Frequently Asked Questions</button></li>
              <li><button onClick={() => onNavigate('/shipping-policy')} className="hover:text-rose transition-colors font-medium">15-Minute Delivery Terms</button></li>
              <li><button onClick={() => onNavigate('/refund-policy')} className="hover:text-rose transition-colors font-medium">Hygienic Returns & Refunds</button></li>
              <li><button onClick={() => onNavigate('/contact')} className="hover:text-rose transition-colors font-medium">Contact Customer Support</button></li>
              <li>
                <button 
                  onClick={() => onNavigate('/beauty-advisor')} 
                  className="hover:text-rose transition-colors font-bold text-berry flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-rose" />
                  <span>AI Routine Skin Advisor</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Company & Operations */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-berry mb-4">
              Company
            </h4>
            <ul className="space-y-2.5 text-xs text-muted">
              <li><button onClick={() => onNavigate('/about')} className="hover:text-rose transition-colors font-medium">Our Story</button></li>
              <li><button onClick={() => onNavigate('/privacy-policy')} className="hover:text-rose transition-colors font-medium">Privacy Policy</button></li>
              <li><button onClick={() => onNavigate('/terms')} className="hover:text-rose transition-colors font-medium">Terms of Service</button></li>
              <li><button onClick={() => onNavigate('/admin')} className="hover:text-rose transition-colors font-medium">Merchant Portal</button></li>
              <li><button onClick={() => onNavigate('/delivery')} className="hover:text-rose transition-colors font-medium">Rider Fleet Portal</button></li>
            </ul>
          </div>

        </div>
      </div>

      {/* 3. Bottom Legal Notice */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted">
        <p>© 2026 Dew & Go Quick-Commerce Ltd. All rights reserved. <span className="font-semibold text-rose">Your beauty. Your moment.</span></p>
        <p>All prices inclusive of applicable GST • 100% Genuine Certified Cosmetics</p>
      </div>

    </footer>
  );
};
