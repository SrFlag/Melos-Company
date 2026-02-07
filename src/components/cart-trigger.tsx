"use client";

import { useCart } from "@/context/CartContext";
import { ShoppingBag } from "lucide-react";

type CartTriggerProps = {
  className?: string; // aplicado ao ícone (ex: "w-4 h-4")
};

export function CartTrigger({ className }: CartTriggerProps) {
  const { toggleCart, cartCount } = useCart();

  const iconClasses = `${className ?? "w-6 h-6"} text-zinc-300 group-hover:text-purple-400 transition-colors`;

  return (
    <button
      onClick={toggleCart}
      className="relative p-2 hover:bg-white/5 rounded-full transition-colors group"
    >
      <ShoppingBag className={iconClasses} />

      {/* Bolinha com a quantidade (só aparece se tiver itens) */}
      {cartCount > 0 && (
        <span className="absolute top-0 right-0 w-5 h-5 bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-zinc-950">
          {cartCount}
        </span>
      )}
    </button>
  );
}