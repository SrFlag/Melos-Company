"use client";

import { useCart } from "@/context/CartContext";
import { ShoppingBag } from "lucide-react";

export function CartTrigger({ className }: { className?: string }) {
  const { openSidebar, cartCount } = useCart();

  return (
    <button 
      onClick={openSidebar}
      className={`relative group p-2 hover:bg-white/5 rounded-full transition-colors ${className}`}
    >
      <ShoppingBag className="w-6 h-6 text-zinc-400 group-hover:text-purple-500 transition-colors" />
      
      {cartCount > 0 && (
        <span className="absolute top-0 right-0 w-4 h-4 bg-purple-600 text-[10px] font-bold text-white rounded-full flex items-center justify-center border-2 border-[#09090b]">
          {cartCount}
        </span>
      )}
    </button>
  );
}