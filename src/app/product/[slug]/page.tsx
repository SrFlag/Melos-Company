import { notFound } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Check, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";
import { supabase } from "../../../../public/lib/supabase";
import { ProductControls } from "@/components/product-controls";

// Define o tempo de cache (revalidação) para a página não ficar estática para sempre
export const revalidate = 60; 

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  // 1. Busca o produto no Supabase pelo SLUG
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();

  // Se der erro ou não achar o produto, manda para a página 404
  if (error || !product) {
    return notFound();
  }

  // Formatador de Preço
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(product.price);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans pb-20">
      
      {/* Header Simples de Navegação */}
      <header className="fixed top-0 w-full z-50 bg-zinc-950/80 backdrop-blur-md border-b border-white/5">
         <div className="max-w-7xl mx-auto px-6 h-16 flex items-center">
            <Link href="/" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
               <ArrowLeft className="w-4 h-4" />
               Voltar para a Loja
            </Link>
         </div>
      </header>

      <main className="pt-24 lg:pt-32 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          
          {/* COLUNA ESQUERDA: Galeria de Imagens */}
          <div className="space-y-4">
             {/* Imagem Principal Grande */}
             <div className="relative aspect-[4/5] bg-zinc-900 rounded-sm border border-white/5 overflow-hidden">
                <Image
                  src={product.image_url || "/img/camisa-frente.png"}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
             </div>
             {/* Miniaturas (Visual apenas por enquanto) */}
             <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((_, i) => (
                   <div key={i} className={`aspect-square bg-zinc-900 rounded-sm border ${i === 0 ? 'border-purple-600' : 'border-white/5'} cursor-pointer hover:border-zinc-500`}>
                      {/* Aqui iriam mais fotos no futuro */}
                   </div>
                ))}
             </div>
          </div>

          {/* COLUNA DIREITA: Detalhes e Compra */}
          <div className="lg:py-8 sticky top-24 h-fit">
             
             {/* Cabeçalho do Produto */}
             <div className="mb-8 border-b border-white/5 pb-8">
                <span className="text-purple-400 text-sm font-bold tracking-wider mb-2 block uppercase">
                   {product.category || "Streetwear"}
                </span>
                <h1 className="text-4xl lg:text-5xl font-bold tracking-tighter mb-4 text-white">
                   {product.name}
                </h1>
                <p className="text-2xl font-light text-zinc-200">
                   {formattedPrice}
                   <span className="text-sm text-zinc-500 ml-2 font-normal">em até 3x sem juros</span>
                </p>
             </div>

             {/* Seletor de Tamanhos */}
             <ProductControls product={product} />

             {/* Descrição */}
             <div className="prose prose-invert prose-zinc mb-8">
                <p className="text-zinc-400 leading-relaxed">
                   {product.description || "Descrição do produto indisponível."}
                </p>
             </div>

             {/* Selos de Confiança (Psychological Triggers) */}
             <div className="grid grid-cols-2 gap-4 text-xs text-zinc-500">
                <div className="flex items-center gap-2 p-3 bg-zinc-900/50 rounded-sm border border-white/5">
                   <Truck className="w-4 h-4 text-purple-400" />
                   <span>Envio para todo Brasil</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-zinc-900/50 rounded-sm border border-white/5">
                   <ShieldCheck className="w-4 h-4 text-purple-400" />
                   <span>Compra 100% Segura</span>
                </div>
             </div>

          </div>
        </div>
      </main>
    </div>
  );
}