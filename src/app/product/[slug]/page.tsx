"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../public/lib/supabase";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Star, ShoppingBag, Truck, ShieldCheck, Share2 } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string;
  gallery: string[]; // <--- Aqui estão as fotos extras
  category: string;
  stock: number;
  description?: string;
}

export default function ProductDetails() {
  const params = useParams();
  const { addToCart, openSidebar } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Estado para controlar qual imagem está aparecendo no destaque
  const [activeImage, setActiveImage] = useState<string | null>(null);
  
  // Estado para tamanho selecionado
  const [selectedSize, setSelectedSize] = useState<string>("M");

  useEffect(() => {
    async function fetchProduct() {
      if (!params.slug) return;

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', params.slug)
        .single();

      if (data) {
        setProduct(data);
        setActiveImage(data.image_url); // Começa com a foto principal
      }
      setLoading(false);
    }
    fetchProduct();
  }, [params.slug]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, selectedSize);
      // Opcional: Abrir o carrinho automaticamente
      // openSidebar(); 
    }
  };

  const formatPrice = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  if (loading) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-zinc-500">Carregando...</div>;
  if (!product) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-white">Produto não encontrado.</div>;

  // Junta a foto principal com as fotos da galeria numa lista única para as miniaturas
  const allImages = [product.image_url, ...(product.gallery || [])].filter(Boolean);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans pb-20 selection:bg-purple-500/30">
      
      {/* NAVBAR SIMPLES */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#09090b]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-bold tracking-tighter text-white">
            MELOS<span className="text-purple-600">.</span>CO
          </span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-32 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        
        {/* --- COLUNA ESQUERDA: GALERIA DE FOTOS --- */}
        <div className="space-y-4">
          
          {/* FOTO GRANDE (DESTAQUE) */}
          <div className="relative aspect-[4/5] bg-zinc-900 rounded-2xl overflow-hidden border border-white/5 group">
             <Image 
               src={activeImage || "/placeholder.png"} 
               alt={product.name} 
               fill 
               className="object-cover transition-transform duration-700 group-hover:scale-105"
               priority
             />
             {/* Tag de Novo/Destaque se tiver */}
             <div className="absolute top-4 left-4 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                Original Melos
             </div>
          </div>

          {/* MINIATURAS (CARROSSEL) */}
          {allImages.length > 1 && (
            <div className="grid grid-cols-5 gap-3">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    activeImage === img 
                      ? "border-purple-600 opacity-100 ring-2 ring-purple-600/30" 
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image src={img} alt={`Foto ${idx}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* --- COLUNA DIREITA: DETALHES --- */}
        <div className="flex flex-col h-full lg:pt-10">
          
          {/* Cabeçalho do Produto */}
          <div className="mb-8 border-b border-white/5 pb-8">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-purple-400 font-bold text-xs uppercase tracking-widest bg-purple-500/10 px-2 py-1 rounded mb-3 inline-block">
                  {product.category}
                </span>
                <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white mb-2">
                  {product.name}
                </h1>
              </div>
              <button className="p-2 text-zinc-500 hover:text-white transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center gap-4 mt-2">
              <span className="text-3xl font-bold text-white">{formatPrice(product.price)}</span>
              <div className="flex items-center gap-1 text-yellow-500 text-sm font-bold bg-yellow-500/10 px-2 py-1 rounded">
                <Star className="w-3 h-3 fill-yellow-500" /> 5.0
              </div>
            </div>
          </div>

          {/* Seleção de Tamanho */}
          <div className="mb-8">
            <div className="flex justify-between mb-3">
              <span className="text-sm font-bold text-zinc-300">Selecione o Tamanho</span>
              <button className="text-xs text-zinc-500 underline hover:text-purple-400">Guia de Medidas</button>
            </div>
            <div className="flex flex-wrap gap-3">
              {['P', 'M', 'G', 'GG', 'XG'].map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`
                    w-14 h-14 rounded-xl font-bold flex items-center justify-center transition-all
                    ${selectedSize === size 
                      ? "bg-white text-black scale-110 shadow-[0_0_15px_rgba(255,255,255,0.3)]" 
                      : "bg-zinc-900 text-zinc-500 border border-zinc-800 hover:border-zinc-600 hover:text-white"
                    }
                  `}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Botão de Compra */}
          <div className="flex gap-4 mb-8">
             <button 
               onClick={handleAddToCart}
               disabled={product.stock === 0}
               className={`flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-5 rounded-xl text-lg flex items-center justify-center gap-3 transition-all shadow-[0_0_25px_rgba(147,51,234,0.3)] hover:scale-[1.02] active:scale-[0.98] ${product.stock === 0 ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
             >
               <ShoppingBag className="w-5 h-5" />
               {product.stock > 0 ? "ADICIONAR AO CARRINHO" : "ESGOTADO"}
             </button>
          </div>

          {/* Infos Extras */}
          <div className="grid grid-cols-2 gap-4 text-xs font-medium text-zinc-500">
            <div className="bg-zinc-900/50 p-4 rounded-lg flex items-center gap-3 border border-white/5">
              <Truck className="w-5 h-5 text-purple-500" />
              <span>Envio rápido para todo Brasil</span>
            </div>
            <div className="bg-zinc-900/50 p-4 rounded-lg flex items-center gap-3 border border-white/5">
              <ShieldCheck className="w-5 h-5 text-green-500" />
              <span>Garantia de qualidade e troca</span>
            </div>
          </div>

          {/* Descrição (Estática ou do Banco) */}
          <div className="mt-8 pt-8 border-t border-white/5">
            <h3 className="font-bold text-white mb-2">Descrição</h3>
            <p className="text-zinc-400 leading-relaxed text-sm">
              {product.description || "Desenvolvida com algodão premium de alta gramatura, esta peça oferece o equilíbrio perfeito entre conforto e durabilidade. Modelagem exclusiva oversized que garante caimento estruturado e moderno. Ideal para compor looks streetwear autênticos."}
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}