"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { supabase } from "../../../public/lib/supabase";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, User, Phone, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function CheckoutPage() {
  const context = useCart(); // Pegamos o contexto inteiro
  const router = useRouter();
  
  // PROTEÇÃO CONTRA CRASH: Se o contexto não carregou, define valores padrão
  const cart = context?.cart || [];
  const total = context?.total || 0;
  const clearCart = context?.clearCart || (() => {});

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cep: "",
    street: "",
    number: "",
    district: "",
    city: "",
    state: "",
    paymentMethod: "PIX"
  });

  // Proteção: Se não tiver itens, volta pra home (mas espera o React carregar)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (cart.length === 0) {
        // Opcional: Descomente se quiser redirecionar automático
        // router.push("/"); 
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [cart, router]);

  const handleBlurCep = async () => {
    const cleanCep = formData.cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          street: data.logradouro,
          district: data.bairro,
          city: data.localidade,
          state: data.uf
        }));
      }
    } catch (error) {
      console.error("Erro CEP");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Salvar Pedido
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          address_zip: formData.cep,
          address_street: formData.street,
          address_number: formData.number,
          address_district: formData.district,
          address_city: formData.city,
          address_state: formData.state,
          total_value: total,
          status: 'Pendente',
          payment_method: 'PIX'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Salvar Itens
      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_name: item.name,
        size: item.size || 'UN',
        quantity: item.quantity,
        price: item.price,
        image_url: item.image_url
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      // 3. Limpar e Zap
      clearCart();
      const message = `*NOVO PEDIDO #${order.id}*\n👤 ${formData.name}\n💰 Total: R$ ${total.toFixed(2)}\n📦 Itens: ${cart.length}`;
      window.location.href = `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`;

    } catch (error: any) {
      alert("Erro ao salvar: " + error.message);
      setLoading(false);
    }
  };

  // Se o carrinho estiver vazio, mostra mensagem amigável em vez de erro
  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center text-white p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Seu carrinho está vazio ou carregando...</h2>
        <Link href="/" className="bg-purple-600 px-6 py-3 rounded-full font-bold hover:bg-purple-700 transition-colors">
          Voltar para a Loja
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans pb-20">
      
      {/* Header */}
      <div className="border-b border-white/5 bg-[#09090b]/90 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center gap-4">
          <Link href="/" className="p-2 bg-zinc-800 rounded-full hover:bg-white text-zinc-400 hover:text-black transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold">Finalizar Compra</h1>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-8 grid md:grid-cols-[1fr_350px] gap-8">
        
        {/* Formulário */}
        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
          
          <div className="space-y-4">
            <h3 className="text-purple-400 text-xs font-bold uppercase tracking-widest border-b border-white/10 pb-2 flex items-center gap-2">
              <User className="w-4 h-4" /> Seus Dados
            </h3>
            <input required placeholder="Nome Completo" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 outline-none focus:border-purple-500" />
            <div className="grid grid-cols-2 gap-4">
              <input required type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 outline-none focus:border-purple-500" />
              <input required type="tel" placeholder="WhatsApp" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 outline-none focus:border-purple-500" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-purple-400 text-xs font-bold uppercase tracking-widest border-b border-white/10 pb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Entrega
            </h3>
            <div className="grid grid-cols-[120px_1fr] gap-4">
               <input required placeholder="CEP" maxLength={9} value={formData.cep} onChange={e => setFormData({...formData, cep: e.target.value})} onBlur={handleBlurCep} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 outline-none focus:border-purple-500" />
               <input required placeholder="Endereço" value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 outline-none focus:border-purple-500" />
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-4">
               <input required placeholder="Número" value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 outline-none focus:border-purple-500" />
               <input required placeholder="Bairro" value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 outline-none focus:border-purple-500" />
            </div>
            <div className="grid grid-cols-[1fr_60px] gap-4">
               <input required placeholder="Cidade" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 outline-none focus:border-purple-500" />
               <input required placeholder="UF" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 outline-none focus:border-purple-500" />
            </div>
          </div>

        </form>

        {/* Resumo Lateral */}
        <div className="bg-zinc-900/50 p-6 rounded-2xl h-fit border border-white/5 sticky top-24">
          <h3 className="font-bold text-white mb-4">Resumo</h3>
          <div className="space-y-3 mb-6 max-h-[200px] overflow-y-auto">
             {cart.map((item, idx) => (
               <div key={idx} className="flex gap-3 text-sm">
                 <div className="w-10 h-10 bg-zinc-800 rounded flex-shrink-0 relative overflow-hidden">
                    <Image src={item.image_url || '/placeholder.png'} alt="" fill className="object-cover"/>
                 </div>
                 <div>
                   <p className="text-zinc-200 line-clamp-1">{item.name}</p>
                   <p className="text-zinc-500">x{item.quantity}</p>
                 </div>
               </div>
             ))}
          </div>
          
          <div className="border-t border-white/10 pt-4 mb-4">
             <div className="flex justify-between text-xl font-bold text-white">
                <span>Total</span>
                <span className="text-purple-400">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                </span>
             </div>
          </div>

          <button 
            form="checkout-form"
            type="submit" 
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "FINALIZAR PEDIDO"}
          </button>
        </div>

      </main>
    </div>
  );
}