"use client";

import { useCart } from "@/context/CartContext";
import { ShoppingBag } from "lucide-react";
import { useState } from "react";

interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string | null;
}

export function QuickBuyButton({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault(); // Evita que abra a página do produto ao clicar no botão
    setLoading(true);

    // Adiciona ao carrinho (Define tamanho 'M' como padrão para compra rápida ou abre modal no futuro)
    // Para simplificar agora, vamos adicionar como "Único" ou "Padrão"
    addToCart(product, "Padrão"); 

    // Efeito visual de "Adicionado"
    setTimeout(() => setLoading(false), 500);
  };

  return (
    <button
      onClick={handleQuickAdd}
      disabled={loading}
      className={`
        absolute bottom-0 left-0 w-full py-4 font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all duration-300 transform translate-y-full group-hover:translate-y-0
        ${loading ? "bg-purple-600 text-white" : "bg-white text-black hover:bg-zinc-200"}
      `}
    >
      {loading ? (
        <span>ADICIONADO!</span>
      ) : (
        <>
          <ShoppingBag className="w-4 h-4" />
          COMPRA RÁPIDA
        </>
      )}
    </button>
  );
}