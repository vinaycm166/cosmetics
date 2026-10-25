import { useState, useEffect } from 'react';
import { store } from './store';
import { Product, Category } from '../types';

/**
 * Hook to reactively subscribe to published products.
 * Updates automatically when products are added, updated, published, or unpublished.
 */
export const usePublishedProducts = (): Product[] => {
  const [products, setProducts] = useState<Product[]>(() => store.getPublishedProducts());

  useEffect(() => {
    const sync = () => {
      setProducts(store.getPublishedProducts());
    };

    const unsub = store.subscribe(sync);

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', sync);
      window.addEventListener('dew_and_go_catalogue_updated', sync);
    }

    return () => {
      unsub();
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', sync);
        window.removeEventListener('dew_and_go_catalogue_updated', sync);
      }
    };
  }, []);

  return products;
};

/**
 * Hook to reactively subscribe to all products (including drafts and archived) for admin management.
 */
export const useAllProducts = (): Product[] => {
  const [products, setProducts] = useState<Product[]>(() => store.getProducts());

  useEffect(() => {
    const sync = () => {
      setProducts(store.getProducts());
    };

    const unsub = store.subscribe(sync);

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', sync);
      window.addEventListener('dew_and_go_catalogue_updated', sync);
    }

    return () => {
      unsub();
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', sync);
        window.removeEventListener('dew_and_go_catalogue_updated', sync);
      }
    };
  }, []);

  return products;
};

/**
 * Hook to reactively subscribe to store categories.
 */
export const useCategories = (): Category[] => {
  const [categories, setCategories] = useState<Category[]>(() => store.getCategories());

  useEffect(() => {
    const sync = () => {
      setCategories(store.getCategories());
    };

    const unsub = store.subscribe(sync);

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', sync);
      window.addEventListener('dew_and_go_catalogue_updated', sync);
    }

    return () => {
      unsub();
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', sync);
        window.removeEventListener('dew_and_go_catalogue_updated', sync);
      }
    };
  }, []);

  return categories;
};
