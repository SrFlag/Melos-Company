"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: any, size: string) => void;
  removeFromCart: (id: number, size: string) => void;
  clearCart: () => void; // <--- NOVA FUNÇÃO
  toggleCart: () => void;
  isCartOpen: boolean;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext({} as CartContextType);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("@melos-cart");
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("@melos-cart", JSON.stringify(items));
  }, [items]);

  const addToCart = (product: any, size: string) => {
    setItems((prev) => {
      const existingItem = prev.find((item) => item.id === product.id && item.size === size);
      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image_url || "/img/camisa-frente.png",
        quantity: 1,
        size,
      }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: number, size: string) => {
    setItems((prev) => prev.filter((item) => !(item.id === id && item.size === size)));
  };

  // <--- NOVA LÓGICA: LIMPAR CARRINHO
  const clearCart = () => {
    setItems([]);
    localStorage.removeItem("@melos-cart");
  };

  const toggleCart = () => setIsCartOpen((prev) => !prev);

  const cartTotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, toggleCart, isCartOpen, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);