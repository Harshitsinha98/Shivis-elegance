'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
};

type CartItem = Product & { quantity: number };

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, action: 'increase' | 'decrease') => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 🔴 1. Page load hone par LocalStorage se Cart wapas lana
  useEffect(() => {
    const savedCart = localStorage.getItem('shivis_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    setIsLoaded(true);
  }, []);

  // 🔴 2. Cart update hone par LocalStorage mein save karna
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('shivis_cart', JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, action: 'increase' | 'decrease') => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (action === 'increase') return { ...item, quantity: item.quantity + 1 };
          if (action === 'decrease' && item.quantity > 1) return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      })
    );
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  // Jab tak storage se cart load na ho jaye, UI glitch na aaye isliye empty return na karein
  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};