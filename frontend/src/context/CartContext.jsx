import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchApi } from '../api/client';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('cart');
      return saved && saved !== 'undefined' ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn('Corrupted cart in localStorage, resetting:', e);
      localStorage.removeItem('cart');
      return [];
    }
  });
  const [restaurant, setRestaurant] = useState(() => {
    try {
      const saved = localStorage.getItem('cart_restaurant');
      return saved && saved !== 'undefined' ? JSON.parse(saved) : null;
    } catch (e) {
      console.warn('Corrupted cart_restaurant in localStorage, resetting:', e);
      localStorage.removeItem('cart_restaurant');
      return null;
    }
  });
  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem('applied_coupon');
      return saved && saved !== 'undefined' ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
    localStorage.setItem('cart_restaurant', JSON.stringify(restaurant));
    if (appliedCoupon) {
      localStorage.setItem('applied_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('applied_coupon');
    }
  }, [cartItems, restaurant, appliedCoupon]);

  const addToCart = (item, restInfo) => {
    // If adding item from a different restaurant, confirm reset
    if (restaurant && restaurant.id !== restInfo.id && cartItems.length > 0) {
      if (!window.confirm(`Your cart contains items from "${restaurant.name}". Clear cart and add items from "${restInfo.name}"?`)) {
        return;
      }
      setCartItems([{ menuItemId: item.id, name: item.name, price: item.price, imageUrl: item.imageUrl, quantity: 1 }]);
      setRestaurant(restInfo);
      return;
    }

    setRestaurant(restInfo);
    setCartItems(prev => {
      const existingIndex = prev.findIndex(i => i.menuItemId === item.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }
      return [...prev, { menuItemId: item.id, name: item.name, price: item.price, imageUrl: item.imageUrl, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId, delta) => {
    setCartItems(prev => {
      return prev
        .map(i => {
          if (i.menuItemId === itemId) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean);
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems(prev => prev.filter(i => i.menuItemId !== itemId));
  };

  const clearCart = () => {
    setCartItems([]);
    setRestaurant(null);
    setAppliedCoupon(null);
  };

  const applyCoupon = async (code) => {
    if (!code || !code.trim()) {
      throw new Error('Please enter a coupon code.');
    }
    const res = await fetchApi('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code: code.trim(), subtotal })
    });
    if (res.success && res.coupon) {
      setAppliedCoupon(res.coupon);
      return res;
    }
    throw new Error(res.message || 'Failed to apply coupon');
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  // 10% Discount or configured coupon percent applied to Food Subtotal
  const couponDiscount = appliedCoupon && subtotal > 0
    ? Math.round((subtotal * (appliedCoupon.discountPercent / 100)) * 100) / 100
    : 0;

  // Platform Application Charges: Fixed ₹5 per item ordered
  const applicationCharges = itemCount * 5.0;
  // Delivery Charges: Configured per restaurant (or 40.00 default)
  const deliveryFee = cartItems.length > 0 
    ? (restaurant?.deliveryFee !== undefined && restaurant?.deliveryFee !== null 
        ? Number(restaurant.deliveryFee) 
        : (restaurant?.delivery_fee !== undefined ? Number(restaurant.delivery_fee) : 40.00))
    : 0;
  const tax = 0;
  const total = Math.round(Math.max(0, (subtotal - couponDiscount) + applicationCharges + deliveryFee) * 100) / 100;

  return (
    <CartContext.Provider value={{
      cartItems,
      restaurant,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      subtotal,
      appliedCoupon,
      couponDiscount,
      applyCoupon,
      removeCoupon,
      applicationCharges,
      deliveryFee,
      tax,
      total,
      itemCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
