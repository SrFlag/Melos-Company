"use client";

import { useCart } from "@/context/CartContext";
import { ArrowLeft, MapPin, User, Truck, CreditCard, Lock, ShieldCheck, QrCode, Wallet, Copy, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix');
  const [showPixModal, setShowPixModal] = useState(false); // Estado do Modal
  
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  // Chave Pix Aleatória para simulação
  const pixKey = "00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-426614174000520400005303986540510.005802BR5913MELOS COMPANY6009SAO PAULO62070503***6304E2CA";

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const formatMoney = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Se for PIX, paramos o loading e mostramos o modal
    if (paymentMethod === 'pix') {
      setTimeout(() => {
        setLoading(false);
        setShowPixModal(true);
      }, 1000);
      return;
    }

    // Se for Cartão, segue o fluxo normal
    setTimeout(() => {
      setLoading(false);
      router.push("/success");
    }, 2000);
  };

  const handlePixPaid = () => {
    // Usuário confirmou que pagou o PIX
    setShowPixModal(false);
    router.push("/success");
  };

  const copyPixToClipboard = () => {
    navigator.clipboard.writeText(pixKey);
    alert("Chave PIX copiada!");
  };

  const handleSubmitClick = () => {
    formRef.current?.requestSubmit();
  };

  const styles = {
    input: {
      width: '100%',
      backgroundColor: '#18181b',
      border: '1px solid #27272a',
      borderRadius: '8px',
      padding: '16px 18px',
      color: 'white',
      fontSize: '15px',
      outline: 'none',
      transition: 'all 0.2s ease',
      marginBottom: '0px'
    },
    label: {
      display: 'block',
      fontSize: '13px',
      fontWeight: 600,
      color: '#a1a1aa',
      marginBottom: '8px',
      marginLeft: '2px'
    },
    sectionTitle: {
      fontSize: '20px',
      fontWeight: 700,
      color: 'white',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center text-zinc-100 p-6 space-y-4">
        <h2 className="text-2xl font-bold">Seu carrinho está vazio 😕</h2>
        <Link href="/" className="text-purple-400 hover:text-purple-300 underline underline-offset-4">
          Voltar para a loja
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans pb-24 relative">
      
      {/* HEADER */}
      <header className="border-b border-white/5 bg-[#09090b] sticky top-0 z-40 shadow-sm">
        <div className="max-w-[1100px] mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            VOLTAR
          </Link>
          <div className="flex items-center gap-2 text-green-500 bg-green-500/10 px-4 py-1.5 rounded-full border border-green-500/20 text-xs font-bold tracking-wide">
            <Lock className="w-3 h-3" />
            CHECKOUT SEGURO
          </div>
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-6 lg:px-8 py-12">
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '60px', alignItems: 'flex-start' }}>
          
          <div style={{ flex: 1, width: '100%' }}>
            <form ref={formRef} onSubmit={handleFinish} className="space-y-12">
              {/* DADOS PESSOAIS */}
              <section>
                <h2 style={styles.sectionTitle}>
                  <div className="w-8 h-8 rounded bg-purple-500/20 flex items-center justify-center text-purple-400"><User className="w-4 h-4" /></div>
                  Dados Pessoais
                </h2>
                <div className="grid gap-6">
                  <div className="space-y-1"><label style={styles.label}>E-mail</label><input required name="email" style={styles.input} type="email" placeholder="seu@email.com" /></div>
                  <div className="space-y-1"><label style={styles.label}>Nome Completo</label><input required name="name" style={styles.input} type="text" placeholder="Como no seu documento" /></div>
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-1"><label style={styles.label}>CPF</label><input required name="cpf" style={styles.input} type="tel" placeholder="000.000.000-00" /></div>
                     <div className="space-y-1"><label style={styles.label}>Celular</label><input required name="phone" style={styles.input} type="tel" placeholder="(11) 99999-9999" /></div>
                  </div>
                </div>
              </section>

              {/* ENTREGA */}
              <section>
                <h2 style={styles.sectionTitle}>
                   <div className="w-8 h-8 rounded bg-purple-500/20 flex items-center justify-center text-purple-400"><MapPin className="w-4 h-4" /></div>
                  Endereço de Entrega
                </h2>
                <div className="grid gap-6">
                  <div className="flex gap-6 items-end">
                     <div className="w-[180px] space-y-1"><label style={styles.label}>CEP</label><input required name="zipcode" style={styles.input} type="text" placeholder="00000-000" /></div>
                     <div className="h-[54px] flex items-center px-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm font-bold w-full"><Truck className="w-4 h-4 mr-2" /> Frete Grátis Aplicado!</div>
                  </div>
                  <div className="space-y-1"><label style={styles.label}>Endereço</label><input required name="address" style={styles.input} type="text" placeholder="Rua, Avenida..." /></div>
                  <div className="grid grid-cols-[120px_1fr] gap-6">
                     <div className="space-y-1"><label style={styles.label}>Número</label><input required name="number" style={styles.input} type="text" placeholder="123" /></div>
                     <div className="space-y-1"><label style={styles.label}>Complemento</label><input name="complement" style={styles.input} type="text" placeholder="Apto, Bloco, Ref..." /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-1"><label style={styles.label}>Bairro</label><input required name="district" style={styles.input} type="text" placeholder="Bairro" /></div>
                     <div className="space-y-1"><label style={styles.label}>Cidade</label><input required name="city" style={styles.input} type="text" placeholder="Cidade - UF" /></div>
                  </div>
                </div>
              </section>

              {/* PAGAMENTO */}
              <section>
                <h2 style={styles.sectionTitle}>
                  <div className="w-8 h-8 rounded bg-purple-500/20 flex items-center justify-center text-purple-400"><Wallet className="w-4 h-4" /></div>
                  Forma de Pagamento
                </h2>
                <div className="grid grid-cols-2 gap-4 mb-6">
                   <button type="button" onClick={() => setPaymentMethod('pix')} className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all ${paymentMethod === 'pix' ? 'bg-purple-600/20 border-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.3)]' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800'}`}>
                      <QrCode className="w-6 h-6" /><div className="text-center"><span className="block font-bold text-sm">PIX</span><span className="block text-[10px] opacity-70">Aprovação Imediata</span></div>
                   </button>
                   <button type="button" onClick={() => setPaymentMethod('card')} className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all ${paymentMethod === 'card' ? 'bg-purple-600/20 border-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.3)]' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800'}`}>
                      <CreditCard className="w-6 h-6" /><div className="text-center"><span className="block font-bold text-sm">Cartão de Crédito</span><span className="block text-[10px] opacity-70">Até 12x sem juros</span></div>
                   </button>
                </div>
                <div className="p-5 border border-white/5 bg-zinc-900 rounded-lg">
                    {paymentMethod === 'pix' ? (
                       <div className="flex items-center gap-4 text-green-400 text-sm"><ShieldCheck className="w-5 h-5 flex-shrink-0" /><p>Ao finalizar, geraremos um <strong>QR Code</strong> exclusivo para seu pagamento. Rápido e seguro.</p></div>
                    ) : (
                       <div className="space-y-4">
                          <input required name="card_number" style={styles.input} type="text" placeholder="Número do Cartão" />
                          <div className="grid grid-cols-2 gap-4"><input required name="card_expiry" style={styles.input} type="text" placeholder="Validade (MM/AA)" /><input required name="card_cvv" style={styles.input} type="text" placeholder="CVV" /></div>
                          <input required name="card_name" style={styles.input} type="text" placeholder="Nome impresso no cartão" />
                       </div>
                    )}
                </div>
              </section>
            </form>
          </div>

          <div style={{ width: isMobile ? '100%' : '380px', flexShrink: 0, position: isMobile ? 'static' : 'sticky', top: '120px' }}>
             <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '16px', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                <h3 className="font-bold text-lg text-white mb-6 pb-4 border-b border-white/5">Resumo do Pedido</h3>
                <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                   {items.map(item => (
                     <div key={`${item.id}-${item.size}`} className="flex gap-4">
                        <div style={{ width: '64px', height: '80px' }} className="bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0 relative border border-white/5">
                           <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                           <span className="absolute -top-1.5 -right-1.5 bg-zinc-700 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border border-black font-bold shadow-md">{item.quantity}</span>
                        </div>
                        <div className="flex-1 py-1"><p className="text-sm font-bold text-white line-clamp-1">{item.name}</p><p className="text-xs text-zinc-400 mt-1">Tamanho: {item.size}</p><p className="text-sm font-bold text-purple-400 mt-2">{formatMoney(item.price * item.quantity)}</p></div>
                     </div>
                   ))}
                </div>
                <div className="space-y-3 pt-6 border-t border-white/5">
                   <div className="flex justify-between text-sm text-zinc-400"><span>Subtotal</span><span>{formatMoney(cartTotal)}</span></div>
                   <div className="flex justify-between text-sm text-green-400 font-medium"><span>Frete (Brasil)</span><span>GRÁTIS</span></div>
                   <div className="flex justify-between items-center pt-4 border-t border-white/10 mt-2"><span className="text-zinc-300 font-bold">Total a pagar</span><span className="text-2xl font-bold text-white">{formatMoney(cartTotal)}</span></div>
                </div>
                <button onClick={handleSubmitClick} type="button" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl transition-all mt-8 shadow-lg shadow-purple-900/20 active:scale-[0.98] flex items-center justify-center gap-2 group">
                  {loading ? <span className="animate-pulse">PROCESSANDO...</span> : (paymentMethod === 'pix' ? 'GERAR PIX' : 'FINALIZAR PAGAMENTO')}
                </button>
                <div className="mt-6 flex flex-col items-center gap-2"><div className="flex items-center gap-2 text-[10px] text-zinc-500 uppercase tracking-widest font-semibold"><Lock className="w-3 h-3" /> Ambiente Criptografado</div><div className="flex gap-2 opacity-30 grayscale hover:grayscale-0 transition-all"><div className="w-8 h-5 bg-white rounded"></div><div className="w-8 h-5 bg-white rounded"></div><div className="w-8 h-5 bg-white rounded"></div></div></div>
            </div>
          </div>
        </div>
      </main>

      {/* --- MODAL DO PIX --- */}
      {showPixModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
           {/* Fundo Escuro */}
           <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowPixModal(false)}></div>
           
           {/* Janela do Modal */}
           <div className="relative bg-[#18181b] w-full max-w-md rounded-2xl border border-white/10 p-8 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
              <button onClick={() => setShowPixModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X className="w-6 h-6" /></button>
              
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mb-4">
                 <QrCode className="w-6 h-6" />
              </div>
              
              <h2 className="text-xl font-bold text-white mb-2">Pague via Pix</h2>
              <p className="text-sm text-zinc-400 mb-6">Abra o app do seu banco e escaneie o código ou copie a chave abaixo.</p>
              
              {/* QR CODE GERADO VIA API (Sem instalar nada) */}
              <div className="bg-white p-2 rounded-lg mb-6">
                 {/* Esta URL gera um QR Code real baseado na nossa chave pix */}
                 <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${pixKey}`} 
                    alt="QR Code Pix" 
                    className="w-48 h-48"
                 />
              </div>

              {/* Área Copia e Cola */}
              <div className="w-full bg-zinc-900 border border-white/10 rounded-lg p-3 flex items-center gap-2 mb-6">
                 <p className="text-xs text-zinc-500 truncate flex-1 font-mono">{pixKey}</p>
                 <button onClick={copyPixToClipboard} className="text-purple-400 hover:text-white p-2 hover:bg-white/10 rounded transition-colors" title="Copiar">
                    <Copy className="w-4 h-4" />
                 </button>
              </div>

              <div className="w-full space-y-3">
                 <button onClick={handlePixPaid} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors">
                    JÁ FIZ O PAGAMENTO
                 </button>
                 <p className="text-xs text-zinc-500">O pedido será liberado automaticamente após a confirmação.</p>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}