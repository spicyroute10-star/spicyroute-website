import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [restaurant, setRestaurant] = useState(() => {
    const saved = localStorage.getItem('cart_restaurant');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
    localStorage.setItem('cart_restaurant', JSON.stringify(restaurant));
  }, [cartItems, restaurant]);

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
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = cartItems.length > 0 ? 40.00 : 0;
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const total = Math.round((subtotal + deliveryFee + tax) * 100) / 100;

  return (
    <CartContext.Provider value={{
      cartItems,
      restaurant,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      subtotal,
      deliveryFee,
      tax,
      total,
      itemCount: cartItems.reduce((acc, item) => acc + item.quantity, 0)
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
