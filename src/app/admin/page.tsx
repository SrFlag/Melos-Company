"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../public/lib/supabase";
import { Plus, Trash2, Edit, Package, Search, Archive, AlertTriangle, ImageIcon, ShoppingBag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
      alert("ERRO: Verifique as permissões do Supabase.");
    } else {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  }

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans pb-20">
      
      {/* HEADER FIXO */}
      <div className="border-b border-white/5 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(147,51,234,0.5)]">
              <Package className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">Painel Admin</h1>
          </div>
          
          <div className="flex gap-3">
            {/* BOTÃO NOVO: IR PARA PEDIDOS */}
            <Link 
              href="/admin/orders" 
              className="bg-zinc-800 hover:bg-zinc-700 text-white px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 transition-all border border-white/10"
            >
              <ShoppingBag className="w-4 h-4" /> VER PEDIDOS
            </Link>

            <Link 
              href="/admin/new" 
              className="bg-white hover:bg-zinc-200 text-black px-6 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 transition-all active:scale-95 shadow-lg"
            >
              <Plus className="w-4 h-4" /> NOVO PRODUTO
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        
        {/* BUSCA E INFO */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
           <div className="w-full md:w-[400px] relative group">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5 group-focus-within:text-purple-400 transition-colors" />
             <input 
               type="text" 
               placeholder="Buscar produto..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full bg-zinc-900 border border-zinc-800 rounded-xl h-12 pl-12 pr-4 text-white focus:border-purple-500 outline-none transition-all placeholder:text-zinc-600 focus:ring-1 focus:ring-purple-500"
             />
           </div>
           <div className="text-zinc-500 text-sm font-medium bg-zinc-900/50 px-4 py-2 rounded-lg border border-white/5">
             Total Cadastrado: <span className="text-white font-bold ml-1">{products.length}</span>
           </div>
        </div>

        {/* LISTA DE PRODUTOS */}
        <div className="space-y-3">
          <div className="hidden md:grid grid-cols-12 px-6 py-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
            <div className="col-span-5">Produto</div>
            <div className="col-span-2">Categoria</div>
            <div className="col-span-2">Estoque</div>
            <div className="col-span-2">Preço</div>
            <div className="col-span-1 text-right">Ações</div>
          </div>

          {loading ? (
             <div className="py-20 text-center text-zinc-500 flex flex-col items-center gap-3">
               <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
               Carregando catálogo...
             </div>
          ) : filtered.length === 0 ? (
             <div className="py-20 text-center text-zinc-600 border border-dashed border-zinc-800 rounded-xl">
               Nenhum produto encontrado.
             </div>
          ) : (
            filtered.map((product) => (
              <div 
                key={product.id} 
                className="group bg-zinc-900/40 hover:bg-zinc-900 border border-white/5 hover:border-purple-500/30 rounded-xl p-4 transition-all duration-300 grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
              >
                {/* 1. Imagem e Nome */}
                <div className="col-span-5 flex items-center gap-4">
                  <div className="w-14 h-16 bg-zinc-950 rounded-lg overflow-hidden relative border border-white/10 flex-shrink-0">
                    {product.image_url ? (
                      <Image 
                        src={product.image_url} 
                        alt={product.name} 
                        fill 
                        className="object-cover"
                        sizes="60px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-700">
                        <ImageIcon size={20}/>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-white text-base truncate group-hover:text-purple-400 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">ID: {product.id}</p>
                  </div>
                </div>

                {/* 2. Categoria */}
                <div className="col-span-2">
                   <span className="bg-zinc-950 border border-zinc-800 text-zinc-400 px-2.5 py-1 rounded text-xs font-medium">
                     {product.category || "Geral"}
                   </span>
                </div>

                {/* 3. Estoque */}
                <div className="col-span-2 flex items-center gap-2">
                   {product.stock < 5 ? (
                     <div className="flex items-center gap-1.5 text-red-400 bg-red-400/10 px-2 py-1 rounded border border-red-400/20 text-xs font-bold">
                       <AlertTriangle className="w-3 h-3" />
                       {product.stock} un.
                     </div>
                   ) : (
                     <div className="flex items-center gap-1.5 text-zinc-400 text-sm">
                       <Archive className="w-3 h-3" />
                       {product.stock} un.
                     </div>
                   )}
                </div>

                {/* 4. Preço */}
                <div className="col-span-2 font-mono font-bold text-white">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                </div>

                {/* 5. Ações */}
                <div className="col-span-1 flex justify-end gap-2">
                   <Link 
                     href={`/admin/edit/${product.id}`}
                     className="p-2 bg-zinc-800 hover:bg-blue-600 text-zinc-400 hover:text-white rounded-lg transition-colors"
                     title="Editar"
                   >
                     <Edit className="w-4 h-4" />
                   </Link>
                   <button 
                     onClick={() => handleDelete(product.id)}
                     className="p-2 bg-zinc-800 hover:bg-red-600 text-zinc-400 hover:text-white rounded-lg transition-colors"
                     title="Excluir"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                </div>

              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}