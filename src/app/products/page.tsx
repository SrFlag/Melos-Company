"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../public/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ShoppingBag, Filter, Sparkles, Search } from "lucide-react";
import { CartTrigger } from "@/components/cart-trigger";
import { QuickBuyButton } from "@/components/quick-buy-button";

interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string | null;
  category: string;
  slug: string;
  stock: number;
  badge?: string;
}

const CATEGORIES = ["Todos", "Camisetas", "Hoodies", "Calças", "Acessórios"];

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        setProducts(data);
        setFilteredProducts(data);
      }
      setLoading(false);
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    let result = products;

    if (selectedCategory !== "Todos") {
      result = result.filter(p => p.category === selectedCategory);
    }

    if (search.trim() !== "") {
      result = result.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredProducts(result);
  }, [selectedCategory, search, products]);

  const formatPrice = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-purple-500/30 overflow-x-hidden">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#09090b]/90 backdrop-blur-md transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
            <div className="p-2 rounded-full bg-white/5 group-hover:bg-purple-500/20 transition-colors">
               <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider hidden sm:block">Voltar</span>
          </Link>

          <span className="font-bold text-xl tracking-tighter text-white">
            MELOS<span className="text-purple-600">.</span>CO
          </span>

          <div className="relative group">
            <CartTrigger className="w-6 h-6 group-hover:text-purple-400 transition-colors" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-purple-600 rounded-full border-2 border-zinc-950"></span>
          </div>
        </div>
      </nav>

      {/* --- HERO HEADER --- */}
      <header className="relative pt-32 pb-12 px-6 border-b border-white/5">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />
        
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-widest">
                <Sparkles className="w-3 h-3" /> Coleção Completa
              </div>
              <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white">
                CATÁLOGO
              </h1>
            </div>

            {/* BARRA DE BUSCA (CORRIGIDA) */}
            <div className="w-full md:w-auto">
               <div className="relative group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5 group-focus-within:text-purple-400 transition-colors" />
                 <input 
                   type="text" 
                   placeholder="Buscar peça..." 
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                   // CORREÇÃO: pl-12 garante que o texto não fique embaixo do ícone
                   className="w-full md:w-[320px] bg-zinc-900 border border-white/10 rounded-full h-12 pl-12 pr-6 text-sm text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder:text-zinc-600 shadow-lg"
                 />
               </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        
        {/* --- FILTROS (NOVOS BOTÕES) --- */}
        <div className="sticky top-20 z-40 bg-[#09090b]/95 backdrop-blur-xl py-4 -mx-6 px-6 border-b border-white/5 mb-12 flex items-center gap-6 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-black uppercase tracking-widest mr-2 flex-shrink-0">
            <Filter className="w-3 h-3" /> Filtros
          </div>
          
          <div className="flex items-center gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`
                  relative px-6 py-2.5 rounded text-[11px] font-bold uppercase tracking-widest transition-all duration-300 border
                  ${selectedCategory === cat
                    ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                    : "bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-white"
                  }
                `}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* --- GRID DE PRODUTOS --- */}
        {loading ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
             {[1,2,3,4,5,6].map(i => (
               <div key={i} className="aspect-[4/5] bg-zinc-900 rounded-sm animate-pulse"></div>
             ))}
           </div>
        ) : filteredProducts.length > 0 ? (
          // CORREÇÃO: gap-8 para o espaçamento perfeito
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <Link href={`/product/${product.slug}`} key={product.id} className="group block">
                <div className="relative">
                  
                  {/* Card Imagem */}
                  <div className={`aspect-[4/5] bg-zinc-900 overflow-hidden border border-white/5 relative transition-all duration-500 group-hover:border-purple-500/30 ${product.stock === 0 ? 'opacity-50 grayscale' : ''}`}>
                    
                    {/* Badge de Novo */}
                    {product.badge && product.stock > 0 && (
                       <span className="absolute top-0 left-0 bg-purple-600 text-white text-[10px] font-bold px-3 py-1.5 uppercase tracking-wider z-20">
                         {product.badge}
                       </span>
                    )}

                    {/* Imagem com Zoom Suave */}
                    <div className="w-full h-full relative">
                      <Image 
                        src={product.image_url || '/img/camisa-frente.png'} 
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                    
                    {/* Overlay Escuro no Hover (Para dar contraste ao botão) */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none" />

                    {/* Overlay de Esgotado */}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black/60 z-30 flex items-center justify-center backdrop-blur-[2px]">
                         <div className="border border-white text-white px-4 py-2 font-bold text-lg tracking-widest uppercase transform -rotate-12">
                           Esgotado
                         </div>
                      </div>
                    )}
                    
                    {/* CORREÇÃO: Botão de Compra no Hover */}
                    {product.stock > 0 && (
                       <div className="absolute bottom-0 left-0 w-full p-4 z-20 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <QuickBuyButton product={product} />
                       </div>
                    )}
                  </div>

                  {/* Informações (Sem categorias feias embaixo) */}
                  <div className="mt-4 flex justify-between items-start gap-4">
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-purple-400 transition-colors uppercase tracking-tight line-clamp-1">
                        {product.name}
                      </h3>
                      {product.stock > 0 && product.stock < 5 && (
                         <p className="text-[10px] text-red-500 font-bold mt-1 animate-pulse">
                           Restam {product.stock} un.
                         </p>
                       )}
                    </div>
                    <p className="font-mono font-bold text-zinc-300 whitespace-nowrap text-lg">
                      {formatPrice(product.price)}
                    </p>
                  </div>

                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-32 flex flex-col items-center justify-center text-center border border-dashed border-zinc-800 rounded-lg">
            <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mb-6">
               <ShoppingBag className="w-6 h-6 text-zinc-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Sem resultados</h3>
            <p className="text-zinc-500 max-w-xs mx-auto text-sm">
              Não encontramos peças com esses filtros.
            </p>
            <button 
              onClick={() => {setSelectedCategory("Todos"); setSearch("");}}
              className="mt-6 text-xs font-bold text-purple-400 hover:text-white uppercase tracking-wider border-b border-purple-500/30 pb-1 hover:border-white transition-all"
            >
              Limpar Filtros
            </button>
          </div>
        )}

      </main>
    </div>
  );
}