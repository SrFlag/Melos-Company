"use client";

import { useCart } from "@/context/CartContext";
import { X, Trash2, ShoppingBag, ArrowRight } from "lucide-react";

export function CartSidebar() {
  const { isCartOpen, toggleCart, items, removeFromCart, cartTotal } = useCart();

  const formatMoney = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <>
      {/* 1. BACKDROP (Fundo Escuro) */}
      <div 
        onClick={toggleCart}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 999998,
          opacity: isCartOpen ? 1 : 0,
          pointerEvents: isCartOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s ease'
        }}
      />

      {/* 2. GAVETA LATERAL (Com Tamanhos Travados no Style) */}
      <aside 
        style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          right: isCartOpen ? 0 : '-100%', // Slide CSS puro
          width: '100%',
          maxWidth: '450px', // TRAVA DE LARGURA MÁXIMA
          backgroundColor: '#09090b', // zinc-950 garantido
          zIndex: 999999,
          transition: 'right 0.4s cubic-bezier(0.16, 1, 0.3, 1)', // Animação suave (Apple style)
          boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
          borderLeft: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        
        {/* --- HEADER --- */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="bg-purple-600/20 p-2 rounded-full">
               <ShoppingBag className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-lg font-bold tracking-tight text-white">
              SEU CARRINHO <span className="text-zinc-500 text-sm font-normal ml-2">({items.length})</span>
            </h2>
          </div>
          <button 
            onClick={toggleCart} 
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* --- LISTA DE ITENS --- */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-2">
                <ShoppingBag className="w-8 h-8 text-zinc-600" />
              </div>
              <p className="text-zinc-400 text-lg">Sua sacola está vazia.</p>
              <button 
                onClick={toggleCart} 
                className="text-purple-400 font-bold hover:text-purple-300 hover:underline underline-offset-4"
              >
                Voltar às compras
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div 
                key={`${item.id}-${item.size}`} 
                className="flex gap-4 bg-zinc-900/40 p-3 rounded-lg border border-white/5"
              >
                {/* TRAVA DE IMAGEM: Tamanho fixo no style para não explodir */}
                <div 
                  style={{ width: '90px', height: '110px' }} 
                  className="relative bg-zinc-800 rounded-md overflow-hidden flex-shrink-0 border border-white/5"
                >
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                {/* Detalhes */}
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <h3 className="font-bold text-base text-zinc-100 leading-tight mb-1">{item.name}</h3>
                    <div className="flex items-center gap-2">
                       <span className="text-xs font-medium text-zinc-400 bg-white/5 px-2 py-0.5 rounded text-center min-w-[30px]">
                         {item.size}
                       </span>
                       <span className="text-xs text-zinc-500">Qtd: {item.quantity}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-end">
                    <span className="text-purple-400 font-bold text-base">
                      {formatMoney(item.price)}
                    </span>
                    
                    <button 
                      onClick={() => removeFromCart(item.id, item.size)}
                      className="text-zinc-500 hover:text-red-400 hover:bg-red-400/10 p-2 rounded-md transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* --- FOOTER --- */}
        {items.length > 0 && (
          <div className="p-6 bg-zinc-950 border-t border-white/10 space-y-4 shadow-2xl z-10">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span>{formatMoney(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-white pt-4 border-t border-white/5">
                <span>Total</span>
                <span>{formatMoney(cartTotal)}</span>
              </div>
            </div>

            <a 
              href="/checkout"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-md transition-all shadow-lg shadow-purple-900/20 flex justify-center items-center gap-2"
            >
              FINALIZAR COMPRA
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        )}
      </aside>
    </>
  );
}