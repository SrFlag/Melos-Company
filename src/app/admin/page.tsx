"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../public/lib/supabase";
import { Plus, Trash2, Edit, Package, Search, Archive, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string;
  category: string;
  stock: number;
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error("Erro ao buscar:", error);
    else setProducts(data || []);
    setLoading(false);
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Tem certeza que deseja excluir?")) return;

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      alert("ERRO: Você precisa rodar o comando SQL no Supabase para liberar a exclusão.");
    } else {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  }

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans pb-20">
      
      {/* --- HEADER --- */}
      <div className="border-b border-white/5 bg-[#09090b] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-purple-600/20 p-2 rounded-lg">
              <Package className="w-6 h-6 text-purple-500" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Painel Admin</h1>
          </div>
          
          <Link 
            href="/admin/new" 
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(147,51,234,0.4)]"
          >
            <Plus className="w-4 h-4" /> NOVO PRODUTO
          </Link>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* --- FILTROS --- */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
           {/* Busca Corrigida */}
           <div className="w-full md:w-[400px] relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
             <input 
               type="text" 
               placeholder="Buscar produto pelo nome..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full bg-zinc-900 border border-zinc-800 rounded-xl h-12 pl-12 pr-4 text-white focus:border-purple-500 outline-none transition-all placeholder:text-zinc-600"
             />
           </div>

           {/* Contador */}
           <div className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-400">
             Total: <span className="text-white font-bold ml-1">{products.length}</span>
           </div>
        </div>

        {/* --- TABELA REAL (NÃO QUEBRA O ALINHAMENTO) --- */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              
              {/* Cabeçalho da Tabela */}
              <thead>
                <tr className="bg-zinc-950/80 text-xs font-bold text-zinc-500 uppercase tracking-wider border-b border-white/5">
                  <th className="p-5 pl-6">Produto</th>
                  <th className="p-5">Categoria</th>
                  <th className="p-5">Estoque</th>
                  <th className="p-5">Preço</th>
                  <th className="p-5 text-right pr-6">Ações</th>
                </tr>
              </thead>

              {/* Corpo da Tabela */}
              <tbody className="divide-y divide-white/5 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-zinc-500">Carregando estoque...</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-zinc-500">Nenhum produto encontrado.</td>
                  </tr>
                ) : (
                  filtered.map((product) => (
                    <tr key={product.id} className="group hover:bg-white/[0.02] transition-colors">
                      
                      {/* Célula: Produto */}
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-14 bg-zinc-950 rounded border border-zinc-800 overflow-hidden flex-shrink-0">
                            <img src={product.image_url || "/placeholder.png"} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="font-bold text-white text-base">{product.name}</p>
                            <p className="text-[10px] text-zinc-500 mt-0.5">ID: {product.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Célula: Categoria */}
                      <td className="p-4 text-zinc-300">
                        <span className="bg-zinc-950 border border-zinc-800 px-2 py-1 rounded text-xs">
                          {product.category || "Geral"}
                        </span>
                      </td>

                      {/* Célula: Estoque */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                           {product.stock < 5 ? (
                             <div className="flex items-center gap-1.5 text-red-400 bg-red-400/10 px-2 py-1 rounded border border-red-400/20">
                               <AlertTriangle className="w-3 h-3" />
                               <span className="font-bold">{product.stock} un.</span>
                             </div>
                           ) : (
                             <div className="flex items-center gap-1.5 text-zinc-400">
                               <Archive className="w-3 h-3" />
                               <span>{product.stock} un.</span>
                             </div>
                           )}
                        </div>
                      </td>

                      {/* Célula: Preço */}
                      <td className="p-4 font-mono font-medium text-white">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                      </td>

                      {/* Célula: Ações */}
                      <td className="p-4 pr-6 text-right">
                        <div className="flex justify-end gap-2">
                           <button className="p-2 hover:bg-blue-500/10 text-zinc-500 hover:text-blue-400 rounded transition-colors" title="Editar">
                             <Edit className="w-4 h-4" />
                           </button>
                           <button 
                             onClick={() => handleDelete(product.id)}
                             className="p-2 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 rounded transition-colors" 
                             title="Excluir"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}