import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, ProductVariant, Coupon } from '../types';
import { store } from '../lib/store';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  tax: number;
  total: number;
  freeDeliveryThreshold: number;
  amountNeededForFreeDelivery: number;
  appliedCoupon: Coupon | null;
  couponError: string | null;
  isCartDrawerOpen: boolean;
  addToCart: (product: Product, variant?: ProductVariant, quantity?: number) => { success: boolean; message: string };
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => { success: boolean; message?: string };
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  clearCart: () => void;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  refreshStock: () => void;
}

const STORAGE_KEY_CART = 'dew_and_go_cart';
const STORAGE_KEY_COUPON = 'dew_and_go_applied_coupon';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CART);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_COUPON);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [couponError, setCouponError] = useState<string | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  // Sync with store settings
  const settings = store.getSettings();
  const freeDeliveryThreshold = settings.freeDeliveryThreshold || 499;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CART, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem(STORAGE_KEY_COUPON, JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem(STORAGE_KEY_COUPON);
    }
  }, [appliedCoupon]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Delivery fee calculation
  let deliveryFee = subtotal >= freeDeliveryThreshold || subtotal === 0 ? 0 : settings.standardDeliveryFee;
  if (appliedCoupon?.code === 'FREESHIP') {
    deliveryFee = 0;
  }

  // Coupon discount calculation
  let discount = 0;
  if (appliedCoupon && subtotal > 0) {
    if (subtotal < appliedCoupon.minOrderValue) {
      // Order fell below coupon requirement
      discount = 0;
    } else if (appliedCoupon.discountType === 'percentage') {
      discount = Math.round((subtotal * appliedCoupon.discountValue) / 100);
      if (appliedCoupon.maxDiscountValue && discount > appliedCoupon.maxDiscountValue) {
        discount = appliedCoupon.maxDiscountValue;
      }
    } else if (appliedCoupon.code !== 'FREESHIP') {
      discount = appliedCoupon.discountValue;
    }
  }

  const tax = Math.round(subtotal * 0.05); // 5% GST
  const total = Math.max(0, subtotal - discount + deliveryFee);
  const amountNeededForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);

  const addToCart = (product: Product, variant?: ProductVariant, quantity: number = 1) => {
    const targetVariant = variant || product.variants.find(v => v.isDefault) || product.variants[0];
    if (!targetVariant) {
      return { success: false, message: 'Variant not found' };
    }

    const available = Math.max(0, targetVariant.stockQuantity - targetVariant.reservedQuantity);
    if (available <= 0) {
      return { success: false, message: 'Sorry, this product is currently out of stock.' };
    }

    const existingIndex = items.findIndex(i => i.variantId === targetVariant.id);
    if (existingIndex > -1) {
      const currentQty = items[existingIndex].quantity;
      if (currentQty + quantity > available) {
        return {
          success: false,
          message: `Only ${available} units available in stock.`
        };
      }
      const updated = [...items];
      updated[existingIndex].quantity += quantity;
      setItems(updated);
    } else {
      if (quantity > available) {
        return {
          success: false,
          message: `Only ${available} units available in stock.`
        };
      }
      const newItem: CartItem = {
        productId: product.id,
        variantId: targetVariant.id,
        name: product.name,
        brand: product.brand,
        variantName: targetVariant.variantName,
        sku: targetVariant.sku,
        price: targetVariant.price,
        originalPrice: targetVariant.originalPrice,
        image: product.images[0] || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80',
        quantity,
        availableStock: available
      };
      setItems(prev => [newItem, ...prev]);
    }

    setIsCartDrawerOpen(true);
    return { success: true, message: `Added ${product.name} to cart!` };
  };

  const removeFromCart = (variantId: string) => {
    setItems(prev => prev.filter(i => i.variantId !== variantId));
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variantId);
      return { success: true };
    }

    const item = items.find(i => i.variantId === variantId);
    if (!item) return { success: false };

    if (quantity > item.availableStock) {
      return {
        success: false,
        message: `Maximum available quantity is ${item.availableStock}.`
      };
    }

    setItems(prev => prev.map(i => i.variantId === variantId ? { ...i, quantity } : i));
    return { success: true };
  };

  const applyCoupon = (code: string) => {
    const result = store.validateCoupon(code, subtotal);
    if (result.valid && result.coupon) {
      setAppliedCoupon(result.coupon);
      setCouponError(null);
      return { success: true, message: result.message };
    } else {
      setCouponError(result.message);
      return { success: false, message: result.message };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const refreshStock = () => {
    // Re-verify against store
    setItems(prev => prev.map(item => {
      const prod = store.getProductById(item.productId);
      const variant = prod?.variants.find(v => v.id === item.variantId);
      if (variant) {
        const available = Math.max(0, variant.stockQuantity - variant.reservedQuantity);
        return {
          ...item,
          availableStock: available,
          quantity: Math.min(item.quantity, Math.max(1, available))
        };
      }
      return item;
    }));
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        deliveryFee,
        discount,
        tax,
        total,
        freeDeliveryThreshold,
        amountNeededForFreeDelivery,
        appliedCoupon,
        couponError,
        isCartDrawerOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        applyCoupon,
        removeCoupon,
        clearCart,
        openCartDrawer: () => setIsCartDrawerOpen(true),
        closeCartDrawer: () => setIsCartDrawerOpen(false),
        refreshStock,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
