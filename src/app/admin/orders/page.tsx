"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../public/lib/supabase";
import { 
  Package, Calendar, User, MapPin, Phone, 
  CreditCard, Search, Truck, CheckCircle, Clock, X 
} from "lucide-react";
import Image from "next/image";

// Tipos
interface OrderItem {
  id: number;
  product_name: string;
  size: string;
  quantity: number;
  price: number;
  image_url: string;
}

interface Order {
  id: number;
  created_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address_street: string;
  address_number: string;
  address_district: string;
  address_city: string;
  address_state: string;
  address_zip: string;
  total_value: number;
  status: string;
  payment_method: string;
  order_items: OrderItem[];
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null); // Para o Modal

  // 1. Buscar Pedidos
  async function fetchOrders() {
    setLoading(true);
    // Busca o pedido E os itens dele (join)
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (error) console.error(error);
    else setOrders(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  // 2. Atualizar Status
  async function updateStatus(id: number, newStatus: string) {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      // Atualiza localmente para ser rápido
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
      if (selectedOrder?.id === id) setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  }

  // Formatadores
  const formatMoney = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  const formatDate = (date: string) => new Date(date).toLocaleDateString('pt-BR') + ' às ' + new Date(date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  // Cores dos Status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendente': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'Pago': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Enviado': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-zinc-800 text-zinc-400';
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans pb-20 p-6">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-end gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter text-white flex items-center gap-3">
             <Package className="w-8 h-8 text-purple-600" /> GESTÃO DE PEDIDOS
          </h1>
          <p className="text-zinc-500 mt-2">Visualize, separe e envie seus pedidos.</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-lg text-sm text-zinc-400">
           Total: <span className="text-white font-bold">{orders.length} pedidos</span>
        </div>
      </div>

      {/* Grid de Pedidos */}
      <main className="max-w-7xl mx-auto">
        {loading ? (
          <div className="text-center py-20 text-zinc-500">Carregando pedidos...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-zinc-800 rounded-xl">
            <Package className="w-12 h-12 mx-auto text-zinc-600 mb-4" />
            <p className="text-zinc-500">Nenhum pedido recebido ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-zinc-900/50 border border-zinc-800 hover:border-purple-500/30 rounded-xl p-6 transition-all group relative overflow-hidden">
                
                {/* Topo do Card */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-xs font-mono text-zinc-500">#{order.id}</span>
                    <h3 className="font-bold text-white text-lg line-clamp-1">{order.customer_name}</h3>
                    <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" /> {formatDate(order.created_at)}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                    {order.status.toUpperCase()}
                  </span>
                </div>

                {/* Resumo */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Itens</span>
                    <span className="text-white font-bold">{order.order_items.length} peças</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Total</span>
                    <span className="text-purple-400 font-bold font-mono text-lg">{formatMoney(order.total_value)}</span>
                  </div>
                </div>

                {/* Botão Detalhes */}
                <button 
                  onClick={() => setSelectedOrder(order)}
                  className="w-full bg-zinc-800 hover:bg-purple-600 hover:text-white text-zinc-300 font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  VER DETALHES
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* --- MODAL DE DETALHES --- */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#09090b] border border-zinc-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl relative animate-in zoom-in-95 duration-200">
            
            {/* Header Modal */}
            <div className="sticky top-0 bg-[#09090b] border-b border-zinc-800 p-6 flex justify-between items-center z-10">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  Pedido #{selectedOrder.id}
                </h2>
                <p className="text-zinc-500 text-sm">{formatDate(selectedOrder.created_at)}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              
              {/* 1. Status e Ações */}
              <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                 <div className="flex items-center gap-2">
                   <span className="text-sm text-zinc-400 font-bold">STATUS ATUAL:</span>
                   <span className={`px-3 py-1 rounded text-xs font-bold ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status.toUpperCase()}
                   </span>
                 </div>
                 
                 <div className="flex gap-2">
                    {selectedOrder.status !== 'Enviado' && (
                      <button 
                        onClick={() => updateStatus(selectedOrder.id, 'Enviado')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
                      >
                        <Truck className="w-4 h-4" /> MARCAR ENVIADO
                      </button>
                    )}
                    {selectedOrder.status === 'Pendente' && (
                      <button 
                        onClick={() => updateStatus(selectedOrder.id, 'Pago')}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" /> APROVAR PGTO
                      </button>
                    )}
                 </div>
              </div>

              {/* 2. Dados do Cliente */}
              <div className="grid md:grid-cols-2 gap-6">
                 <div className="space-y-3">
                    <h3 className="text-purple-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                      <User className="w-4 h-4" /> Dados do Cliente
                    </h3>
                    <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 text-sm space-y-2">
                       <p><span className="text-zinc-500">Nome:</span> <span className="text-white ml-2">{selectedOrder.customer_name}</span></p>
                       <p><span className="text-zinc-500">Email:</span> <span className="text-white ml-2">{selectedOrder.customer_email}</span></p>
                       <p><span className="text-zinc-500">Tel/Cel:</span> <span className="text-white ml-2">{selectedOrder.customer_phone}</span></p>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <h3 className="text-purple-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> Endereço de Entrega
                    </h3>
                    <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 text-sm space-y-1">
                       <p className="text-white font-medium">{selectedOrder.address_street}, {selectedOrder.address_number}</p>
                       <p className="text-zinc-400">{selectedOrder.address_district}</p>
                       <p className="text-zinc-400">{selectedOrder.address_city} - {selectedOrder.address_state}</p>
                       <p className="text-zinc-500 font-mono mt-1">CEP: {selectedOrder.address_zip}</p>
                    </div>
                 </div>
              </div>

              {/* 3. Lista de Produtos (Separação) */}
              <div className="space-y-3">
                 <h3 className="text-purple-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    <Package className="w-4 h-4" /> Itens para Separar
                 </h3>
                 <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-zinc-950 text-zinc-500 uppercase font-bold text-xs">
                        <tr>
                          <th className="p-4">Produto</th>
                          <th className="p-4 text-center">Tamanho</th>
                          <th className="p-4 text-center">Qtd</th>
                          <th className="p-4 text-right">Preço Un.</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800">
                        {selectedOrder.order_items.map((item) => (
                          <tr key={item.id}>
                            <td className="p-4 flex items-center gap-3">
                               <div className="w-10 h-10 bg-zinc-800 rounded overflow-hidden relative">
                                 {/* Fallback de imagem se não tiver */}
                                 {item.image_url && <Image src={item.image_url} alt="" fill className="object-cover" />}
                               </div>
                               <span className="text-white font-medium">{item.product_name}</span>
                            </td>
                            <td className="p-4 text-center">
                              <span className="bg-zinc-800 border border-zinc-700 px-2 py-1 rounded text-xs font-bold text-white">
                                {item.size}
                              </span>
                            </td>
                            <td className="p-4 text-center text-white font-bold">x{item.quantity}</td>
                            <td className="p-4 text-right text-zinc-400">{formatMoney(item.price)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-zinc-950/50">
                         <tr>
                           <td colSpan={3} className="p-4 text-right font-bold text-zinc-400">TOTAL DO PEDIDO</td>
                           <td className="p-4 text-right font-bold text-purple-400 text-lg">{formatMoney(selectedOrder.total_value)}</td>
                         </tr>
                      </tfoot>
                    </table>
                 </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}