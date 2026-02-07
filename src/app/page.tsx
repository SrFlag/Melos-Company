import Image from "next/image";
import { ShoppingBag, Menu, ArrowRight } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { CartTrigger } from "@/components/cart-trigger";
import { QuickBuyButton } from "@/components/quick-buy-button";

// 1. Definindo o tipo do Produto
interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string | null;
  badge?: string | null;
  slug: string;
}

export default async function Home() {
  // 2. Buscando APENAS OS 6 ULTIMOS produtos (Lançamentos)
  const { data: products, error } = await createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(6); // <--- AQUI ESTÁ O LIMITE PARA A HOME

  if (error) {
    console.error("Erro ao buscar produtos:", error);
  }

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-purple-600 selection:text-white font-sans">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <button className="p-2 hover:bg-white/5 rounded-full lg:hidden">
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-2">
            <span className="font-bold text-2xl tracking-tighter text-white cursor-pointer hover:opacity-80 transition-opacity">
              MELOS<span className="text-purple-600">.</span>CO
            </span>
          </div>

           <div className="relative group">
            <CartTrigger className="w-6 h-6 group-hover:text-purple-400 transition-colors" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-purple-600 rounded-full border-2 border-zinc-950"></span>
           </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-purple-900/10 blur-[120px] pointer-events-none rounded-full"></div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-8 animate-in slide-in-from-left duration-700 fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium tracking-wide text-purple-300">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
              NOVA COLEÇÃO DISPONÍVEL
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-[0.95]">
              VISTA O <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">
                EXTRAORDINÁRIO
              </span>
            </h1>
            
            <p className="text-lg text-zinc-400 max-w-md leading-relaxed">
              Qualidade premium, corte oversized e identidade única. 
              Feito para quem não aceita o básico.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold tracking-wide rounded-sm transition-all flex items-center justify-center gap-2 group shadow-lg shadow-purple-900/20">
                VER COLEÇÃO
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 bg-transparent border border-white/10 hover:bg-white/5 text-white font-medium tracking-wide rounded-sm transition-all">
                SOBRE A MARCA
              </button>
            </div>
          </div>

          <div className="relative h-[500px] lg:h-[600px] bg-zinc-900 rounded-lg border border-white/5 overflow-hidden group animate-in slide-in-from-right duration-1000 fade-in">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-600/20 blur-[100px] rounded-full pointer-events-none z-0"></div>
            <Image 
               src="/img/camisa-frente.png" 
               alt="Camisa Destaque"
               fill
               className="object-cover object-center group-hover:scale-105 transition-transform duration-700 z-10"
               priority
             />
          </div>
        </div>
      </section>

      {/* --- VITRINE / GRID --- */}
      <section className="py-20 bg-zinc-900/30 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">LATEST DROPS</h2>
              <p className="text-zinc-500 text-sm">Os lançamentos mais recentes.</p>
            </div>
            
            {/* LINK PARA A PÁGINA DE CATEGORIAS/TODOS */}
            <Link 
              href="/products" 
              className="text-sm text-zinc-400 hover:text-purple-400 transition-colors flex items-center gap-1"
            >
              Ver tudo <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product: Product) => (
                <Link href={`/product/${product.slug}`} key={product.id} className="group relative cursor-pointer block">
                  <div key={product.id} className="group relative cursor-pointer">
                    {/* Card Imagem */}
                    <div className="aspect-[4/5] bg-zinc-800 rounded-sm overflow-hidden border border-white/5 relative">
                      {product.badge && (
                        <span className="absolute top-4 left-4 bg-purple-600 text-white text-xs font-bold px-3 py-1 z-10 shadow-lg">
                          {product.badge.toUpperCase()}
                        </span>
                      )}
                      
                      <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-600 relative">
                        <Image 
                          src={product.image_url || '/img/camisa-frente.png'} 
                          alt={product.name}
                          fill
                          className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                      
                      <QuickBuyButton product={product} />
                    </div>

                    {/* Infos do Produto */}
                    <div className="mt-5 space-y-1">
                      <h3 className="text-lg font-medium text-white group-hover:text-purple-400 transition-colors truncate">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <p className="text-zinc-400 font-light">
                          {formatPrice(product.price)}
                        </p>
                        <div className="flex gap-1">
                          <div className="w-3 h-3 rounded-full bg-zinc-800 border border-zinc-700"></div>
                          <div className="w-3 h-3 rounded-full bg-zinc-900 border border-zinc-700"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border border-dashed border-white/10 rounded-lg">
              <p className="text-zinc-500">Nenhum lançamento recente encontrado.</p>
            </div>
          )}
        </div>
      </section>
      
      {/* Footer Simples */}
      <footer className="py-12 border-t border-white/5 mt-10 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="text-center md:text-left">
              <span className="font-bold text-lg tracking-tighter text-white">
                MELOS<span className="text-purple-600">.</span>CO
              </span>
              <p className="text-zinc-500 text-sm mt-2">Streetwear High Quality. São Paulo, BR.</p>
           </div>
           <p className="text-zinc-600 text-sm">&copy; 2026 Melos Company. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}