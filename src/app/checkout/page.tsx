"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { supabase } from "../../../public/lib/supabase";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, User, ShieldCheck, Loader2, CreditCard } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function CheckoutPage() {
  const context = useCart();
  const router = useRouter();
  
  const cart = context?.cart || [];
  const total = context?.total || 0;
  const clearCart = context?.clearCart || (() => {});

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cpf: "", // NOVO CAMPO OBRIGATÓRIO
    phone: "",
    cep: "",
    street: "",
    number: "",
    district: "",
    city: "",
    state: "",
  });

  // Redireciona se vazio
  useEffect(() => {
    const timer = setTimeout(() => {
      if (cart.length === 0) { /* router.push("/"); */ }
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
    } catch (error) { console.error("Erro CEP"); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Salvar Pedido no Supabase (Status: Ag. Pagamento)
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
          status: 'Aguardando Pagamento', // Status inicial
          payment_method: 'Mercado Pago'
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

      // 3. CHAMAR A API DE PAGAMENTO
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          items: cart,
          payer: {
            name: formData.name,
            email: formData.email,
            cpf: formData.cpf,
          }
        }),
      });

      const paymentData = await response.json();

      if (paymentData.url) {
        // Redireciona para o Mercado Pago Seguro
        window.location.href = paymentData.url;
        clearCart(); // Limpa o carrinho pois o pedido foi criado
      } else {
        throw new Error("Erro ao gerar link de pagamento");
      }

    } catch (error: any) {
      alert("Erro: " + error.message);
      setLoading(false);
    }
  };

  if (!cart || cart.length === 0) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-white">Carregando...</div>;

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans pb-20">
      
      <div className="border-b border-white/5 bg-[#09090b]/90 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center gap-4">
          <Link href="/" className="p-2 bg-zinc-800 rounded-full hover:bg-white text-zinc-400 hover:text-black transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold">Checkout Seguro</h1>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-8 grid md:grid-cols-[1fr_350px] gap-8">
        
        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
          
          <div className="space-y-4">
            <h3 className="text-purple-400 text-xs font-bold uppercase tracking-widest border-b border-white/10 pb-2 flex items-center gap-2">
              <User className="w-4 h-4" /> Dados Pessoais
            </h3>
            <input required placeholder="Nome Completo" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 outline-none focus:border-purple-500" />
            
            {/* CPF É ESSENCIAL PARA PAGAMENTO */}
            <input required placeholder="CPF (Apenas números)" maxLength={14} value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 outline-none focus:border-purple-500" />
            
            <div className="grid grid-cols-2 gap-4">
              <input required type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 outline-none focus:border-purple-500" />
              <input required type="tel" placeholder="Celular" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 outline-none focus:border-purple-500" />
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
          <h3 className="font-bold text-white mb-4">Pagamento</h3>
          
          <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl mb-6 flex items-start gap-3">
             <ShieldCheck className="w-6 h-6 text-blue-400 flex-shrink-0" />
             <p className="text-xs text-blue-200">
               Você será redirecionado para o ambiente seguro do <strong>Mercado Pago</strong> para escolher entre <strong>PIX, Cartão de Crédito ou Débito</strong>.
             </p>
          </div>

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
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-blue-900/20"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                 <CreditCard className="w-5 h-5" /> IR PARA PAGAMENTO
              </>
            )}
          </button>
          
          <div className="flex justify-center gap-2 mt-4 opacity-50">
             <Image src="https://logopng.com.br/logos/pix-106.png" width={25} height={25} alt="Pix" />
             <Image src="https://logodownload.org/wp-content/uploads/2019/09/mastercard-logo.png" width={30} height={20} alt="Master" className="object-contain" />
             <Image src="https://logodownload.org/wp-content/uploads/2016/10/visa-logo-1.png" width={30} height={20} alt="Visa" className="object-contain" />
          </div>

        </div>

      </main>
    </div>
  );
}