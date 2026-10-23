import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';
import { store } from '../lib/store';

interface WishlistContextType {
  wishlistIds: string[];
  wishlistProducts: Product[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

const STORAGE_KEY_WISHLIST = 'dew_and_go_wishlist';

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_WISHLIST);
      return stored ? JSON.parse(stored) : ['prod-001', 'prod-004'];
    } catch {
      return ['prod-001', 'prod-004'];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_WISHLIST, JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  const toggleWishlist = (productId: string) => {
    setWishlistIds(prev => 
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const isInWishlist = (productId: string) => wishlistIds.includes(productId);

  const clearWishlist = () => setWishlistIds([]);

  const allProducts = store.getProducts();
  const wishlistProducts = allProducts.filter(p => wishlistIds.includes(p.id));

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistProducts,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
};
