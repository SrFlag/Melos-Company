"use client";

import { useCart } from "@/context/CartContext";
import { Check, ShoppingBag, ArrowRight, Mail } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function SuccessPage() {
  const { clearCart } = useCart();

  // Limpa o carrinho assim que a página carrega
  useEffect(() => {
    clearCart();
  }, []); // Array vazio garante que rode apenas uma vez

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-6 text-center">
      
      {/* Círculo Animado de Sucesso */}
      <div className="mb-8 relative">
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center animate-bounce shadow-[0_0_50px_rgba(34,197,94,0.4)]">
          <Check className="w-12 h-12 text-white" strokeWidth={3} />
        </div>
        {/* Efeito de onda */}
        <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20"></div>
      </div>

      <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Pedido Confirmado!</h1>
      <p className="text-zinc-400 text-lg mb-8 max-w-md">
        Obrigado pela compra. Estamos preparando tudo com muito cuidado. 🖤
      </p>

      {/* Card de Informações */}
      <div className="bg-zinc-900 border border-white/5 rounded-2xl p-8 max-w-md w-full mb-8 shadow-2xl">
        <div className="space-y-6">
           
           <div className="flex items-center gap-4 pb-6 border-b border-white/5">
             <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center">
               <ShoppingBag className="w-5 h-5 text-purple-400" />
             </div>
             <div className="text-left">
               <p className="text-xs text-zinc-500 uppercase font-bold">Número do Pedido</p>
               <p className="text-white font-mono font-bold text-lg">#CW-{Math.floor(Math.random() * 10000)}</p>
             </div>
           </div>

           <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center">
               <Mail className="w-5 h-5 text-purple-400" />
             </div>
             <div className="text-left">
               <p className="text-xs text-zinc-500 uppercase font-bold">Confirmação Enviada</p>
               <p className="text-zinc-300 text-sm">Verifique seu e-mail para acompanhar a entrega.</p>
             </div>
           </div>

        </div>
      </div>

      {/* Botão Voltar */}
      <Link 
        href="/" 
        className="group flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-zinc-200 transition-all active:scale-95"
      >
        VOLTAR PARA A LOJA
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>

    </div>
  );
}