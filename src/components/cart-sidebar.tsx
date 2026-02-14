"use client";

import { useCart } from "@/context/CartContext";
import { X, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

export function CartSidebar() {
  const { cart, removeFromCart, total, isSidebarOpen, closeSidebar } = useCart();

  // Trava a rolagem da página quando aberto
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isSidebarOpen]);

  // Se não estiver aberto, nem renderiza o HTML pesado (ou usa classes para esconder)
  // Aqui vamos usar classes para manter a animação suave
  return (
    <>
      {/* OVERLAY (Fundo Escuro) */}
      <div 
        className={`fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={closeSidebar}
      />

      {/* SIDEBAR */}
      <div 
        className={`fixed top-0 right-0 z-[70] h-full w-full sm:w-[400px] bg-[#09090b] border-l border-zinc-800 shadow-2xl transition-transform duration-300 ease-out transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="h-full flex flex-col">
          
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-white font-black italic text-xl flex items-center gap-2">
              SEU CARRINHO <span className="text-purple-500">.</span>
            </h2>
            <button 
              onClick={closeSidebar}
              className="p-2 text-zinc-500 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Lista */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                <ShoppingBag className="w-16 h-16 text-zinc-600" />
                <p className="text-zinc-400">Seu carrinho está vazio.</p>
                <button onClick={closeSidebar} className="text-purple-400 hover:text-white underline">
                  Voltar às compras
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={`${item.id}-${item.size}`} className="flex gap-4 group">
                  <div className="relative w-20 h-24 bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0 border border-white/5">
                     <Image src={item.image_url || "/placeholder.png"} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <h4 className="font-bold text-sm text-white line-clamp-2">{item.name}</h4>
                      <p className="text-xs text-zinc-500 mt-1">
                        Tam: <span className="text-zinc-300 font-bold">{item.size || 'UN'}</span>
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-purple-400 font-bold text-sm">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
                        <span className="text-zinc-600 text-xs ml-1">x{item.quantity}</span>
                      </span>
                      <button onClick={() => removeFromCart(item.id)} className="text-zinc-600 hover:text-red-500 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {cart.length > 0 && (
            <div className="p-6 bg-zinc-900 border-t border-zinc-800 space-y-4">
              <div className="flex justify-between text-xl font-black text-white">
                <span>TOTAL</span>
                <span className="text-purple-400">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                </span>
              </div>
              <Link 
                href="/checkout" 
                onClick={closeSidebar}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                FINALIZAR COMPRA <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}