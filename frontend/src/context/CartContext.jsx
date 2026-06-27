import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartService } from '../services/cart.service';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], total: 0, nombre_articles: 0 });
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user || user.role !== 'client') {
      setCart({ items: [], total: 0, nombre_articles: 0 });
      return;
    }
    setLoading(true);
    try {
      const data = await cartService.get();
      setCart(data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addItem = useCallback(async (productId, quantite = 1) => {
    await cartService.add(productId, quantite);
    await refreshCart();
  }, [refreshCart]);

  const updateItem = useCallback(async (cartItemId, quantite) => {
    await cartService.updateQuantity(cartItemId, quantite);
    await refreshCart();
  }, [refreshCart]);

  const removeItem = useCallback(async (cartItemId) => {
    await cartService.remove(cartItemId);
    await refreshCart();
  }, [refreshCart]);

  return (
    <CartContext.Provider value={{ cart, loading, addItem, updateItem, removeItem, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart doit etre utilise a l\'interieur de CartProvider.');
  }
  return ctx;
}
