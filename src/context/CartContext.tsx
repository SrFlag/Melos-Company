"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface CartItem {
  id: number;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
  size?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any, size?: string) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  total: number;
  cartCount: number;
  // Novos controles da Sidebar
  isSidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
}

// Valor padrão seguro para evitar crash se o Provider falhar
const defaultContext: CartContextType = {
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  total: 0,
  cartCount: 0,
  isSidebarOpen: false,
  openSidebar: () => {},
  closeSidebar: () => {},
};

const CartContext = createContext<CartContextType>(defaultContext);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Carregar do LocalStorage (Apenas no cliente)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("@melos:cart");
      if (savedCart) setCart(JSON.parse(savedCart));
    }
  }, []);

  // Salvar no LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("@melos:cart", JSON.stringify(cart));
    }
  }, [cart]);

  const addToCart = (product: any, size: string = 'UN') => {
    setCart((prev) => {
      const existingItem = prev.find((item) => item.id === product.id && item.size === size);
      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, image_url: product.image_url, quantity: 1, size: size }];
    });
    setIsSidebarOpen(true); // Abre o carrinho automaticamente ao adicionar
  };

  const removeFromCart = (itemId: number) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
    if (typeof window !== "undefined") localStorage.removeItem("@melos:cart");
  };

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cart, addToCart, removeFromCart, clearCart, total, cartCount,
      isSidebarOpen, openSidebar, closeSidebar 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);