"use client";

import { useState } from "react";
import { supabase } from "../../../../public/lib/supabase";
import { ArrowLeft, Upload, Package, DollarSign, Archive, Layers, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "Camisetas",
    stock: "10",
  });

  // Função Robusta para gerar o Slug
  const generateSlug = (text: string) => {
    if (!text) return `produto-${Date.now()}`; // Fallback de segurança
    
    return text
      .toString()
      .toLowerCase()
      .normalize("NFD") // Separa acentos
      .replace(/[\u0300-\u036f]/g, "") // Remove acentos
      .replace(/\s+/g, "-") // Espaço vira hífen
      .replace(/[^\w\-]+/g, "") // Remove caracteres especiais
      .replace(/\-\-+/g, "-") // Remove hífens duplicados
      .replace(/^-+/, "")
      .replace(/-+$/, "");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let publicUrl = "";

      // 1. Upload da Imagem
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('images').getPublicUrl(fileName);
        publicUrl = data.publicUrl;
      }

      // 2. Prepara dados
      const numericPrice = parseFloat(formData.price.replace(',', '.'));
      const finalSlug = generateSlug(formData.name); 

      // DEBUG: Verifique se o slug está sendo gerado
      console.log("Tentando salvar:", { name: formData.name, slug: finalSlug });

      // 3. Salva no Banco
      const { error: dbError } = await supabase
        .from('products')
        .insert([
          {
            name: formData.name,
            slug: finalSlug, // OBRIGATÓRIO
            price: numericPrice,
            image_url: publicUrl,
            category: formData.category,
            stock: parseInt(formData.stock),
          }
        ]);

      if (dbError) throw dbError;

      alert("Produto criado com sucesso!");
      router.push("/admin");
      
    } catch (error: any) {
      console.error(error);
      alert("Erro ao criar produto: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans pb-20">
      
      {/* HEADER */}
      <div className="border-b border-white/5 bg-[#09090b] sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center gap-4">
          <Link href="/admin" className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold tracking-tight">Novo Produto</h1>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-10 items-start">
          
          {/* LADO ESQUERDO: FOTO */}
          <div className="space-y-4">
            <p className="text-sm font-bold text-zinc-400 ml-1">Imagem do Produto</p>
            <div className={`relative w-full aspect-[3/4] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden group ${previewUrl ? 'border-purple-500/50 bg-zinc-900' : 'border-zinc-700 bg-zinc-900/50 hover:bg-zinc-900 hover:border-zinc-500'}`}>
              
              {previewUrl ? (
                <>
                  <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white font-medium text-sm">Trocar foto</p>
                  </div>
                </>
              ) : (
                <div className="text-center p-6 space-y-2 pointer-events-none">
                  <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-zinc-400">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm text-zinc-400">Clique para upload</p>
                  <p className="text-xs text-zinc-600">JPG, PNG ou WEBP</p>
                </div>
              )}
              
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
                required={!previewUrl}
              />
            </div>
          </div>

          {/* LADO DIREITO: DADOS */}
          <div className="space-y-6 bg-zinc-900/40 p-8 rounded-2xl border border-white/5">
            
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-zinc-400">
                <Package className="w-4 h-4" /> Nome do Produto
              </label>
              <input 
                required
                type="text" 
                placeholder="Ex: Camiseta Oversized Crow"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-all placeholder:text-zinc-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-zinc-400">
                  <DollarSign className="w-4 h-4" /> Preço (R$)
                </label>
                <input 
                  required
                  type="number" 
                  step="0.01"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-all placeholder:text-zinc-600"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-zinc-400">
                  <Archive className="w-4 h-4" /> Estoque Inicial
                </label>
                <input 
                  required
                  type="number" 
                  placeholder="10"
                  value={formData.stock}
                  onChange={e => setFormData({...formData, stock: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-all placeholder:text-zinc-600"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-zinc-400">
                <Layers className="w-4 h-4" /> Categoria
              </label>
              <select 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="Camisetas">Camisetas</option>
                <option value="Hoodies">Hoodies</option>
                <option value="Acessórios">Acessórios</option>
                <option value="Calças">Calças</option>
              </select>
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(147,51,234,0.2)] flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> SALVANDO...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" /> SALVAR PRODUTO (V2)
                  </>
                )}
              </button>
            </div>

          </div>
        </form>
      </main>
    </div>
  );
}