"use client";

import Link from "next/link";
import { CheckCircle, ArrowRight, ShoppingBag } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { useCart } from "@/context/CartContext";

// 1. Criamos um componente interno só para ler os parâmetros
function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, []);

  return (
    <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-3xl max-w-md w-full backdrop-blur-md shadow-2xl animate-in zoom-in-95 duration-500">
        
      <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
        <CheckCircle className="w-10 h-10 text-green-500" />
      </div>

      <h1 className="text-3xl font-black italic tracking-tighter mb-2">
        PEDIDO RECEBIDO!
      </h1>
      
      <p className="text-zinc-400 mb-6">
        Obrigado pela preferência. Estamos aguardando a confirmação do pagamento.
      </p>

      {orderId && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 mb-8 font-mono text-sm">
          <span className="text-zinc-500 block mb-1 text-xs uppercase tracking-widest">Número do Pedido</span>
          <span className="text-purple-400 font-bold text-lg">#{orderId}</span>
        </div>
      )}

      <div className="space-y-3">
        <Link 
          href="/" 
          className="block w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-5 h-5" /> CONTINUAR COMPRANDO
        </Link>
        
        <Link 
          href={`https://wa.me/5511999999999?text=Olá, fiz o pedido #${orderId} e gostaria de acompanhar.`}
          target="_blank"
          className="block w-full bg-zinc-800 text-zinc-300 font-bold py-4 rounded-xl hover:bg-zinc-700 transition-colors border border-white/5"
        >
          FALAR NO WHATSAPP
        </Link>
      </div>

    </div>
  );
}

// 2. O componente principal envolve o conteúdo com Suspense
export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-6 text-center text-white font-sans">
      <Suspense fallback={<div className="text-zinc-500">Carregando pedido...</div>}>
        <SuccessContent />
      </Suspense>
      
      <p className="mt-8 text-zinc-600 text-xs max-w-sm">
        Você receberá atualizações sobre o status do seu pedido via e-mail ou WhatsApp.
      </p>
    </div>
  );
}