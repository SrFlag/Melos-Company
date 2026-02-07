"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";

interface ProductControlsProps {
  product: {
    id: number;
    name: string;
    price: number;
    image_url: string | null;
  };
}

export function ProductControls({ product }: ProductControlsProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const { addToCart } = useCart();
  const sizes = ['P', 'M', 'G', 'GG'];

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Por favor, selecione um tamanho!");
      return;
    }
    
    // Adiciona ao carrinho
    addToCart(product, selectedSize);
  };

  return (
    <div>
      {/* Seletor de Tamanhos */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
           <label className="text-sm font-medium text-zinc-300">
             Tamanho: {selectedSize && <span className="text-purple-400 font-bold ml-1">{selectedSize}</span>}
           </label>
           <button className="text-xs text-zinc-500 underline hover:text-purple-400">Guia de Medidas</button>
        </div>
        
        <div className="grid grid-cols-4 gap-3">
           {sizes.map((size) => (
              <button 
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`
                  h-12 rounded-sm font-medium transition-all border
                  ${selectedSize === size 
                    ? 'border-purple-600 bg-purple-600/20 text-white ring-1 ring-purple-600' 
                    : 'border-white/10 text-zinc-400 hover:border-purple-600/50 hover:bg-white/5'}
                `}
              >
                 {size}
              </button>
           ))}
        </div>
      </div>

      {/* Botão de Compra */}
      <button 
        onClick={handleAddToCart}
        className="w-full bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white font-bold h-14 rounded-sm transition-all mb-6 text-lg tracking-wide shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2"
      >
        ADICIONAR AO CARRINHO
      </button>
    </div>
  );
}