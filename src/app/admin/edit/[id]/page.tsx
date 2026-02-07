"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "../../../../../public/lib/supabase";
import { ArrowLeft, Upload, Package, DollarSign, Archive, Layers, Save, Loader2, ImageIcon, Camera } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null); // Referência para o input invisível

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "Camisetas", // Valor padrão para evitar erro
    stock: "0",
    image_url: ""
  });

  // 1. CARREGAR DADOS
  useEffect(() => {
    async function fetchProduct() {
      if (!params.id) return;
      const { data, error } = await supabase.from('products').select('*').eq('id', params.id).single();
      
      if (error) {
        alert("Erro ao buscar produto.");
        router.push("/admin");
      } else if (data) {
        setFormData({
          name: data.name,
          price: data.price.toString(),
          category: data.category || "Camisetas",
          stock: data.stock?.toString() || "0",
          image_url: data.image_url
        });
        setPreviewUrl(data.image_url);
      }
      setLoading(false);
    }
    fetchProduct();
  }, [params.id, router]);

  // Função Auxiliar de Slug
  const generateSlug = (text: string) => {
    return text.toString().toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-").replace(/[^\w\-]+/g, "").replace(/\-\-+/g, "-");
  };

  // 2. LÓGICA DE TROCA DE IMAGEM
  const handleTriggerFile = () => {
    // Clica no input escondido via código
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Atualiza o preview na hora
    }
  };

  // 3. SALVAR
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let finalImageUrl = formData.image_url;

      // Se usuário subiu nova foto, faz upload
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('images').getPublicUrl(fileName);
        finalImageUrl = data.publicUrl;
      }

      const { error: dbError } = await supabase
        .from('products')
        .update({
          name: formData.name,
          slug: generateSlug(formData.name),
          price: parseFloat(formData.price.replace(',', '.')),
          image_url: finalImageUrl,
          category: formData.category,
          stock: parseInt(formData.stock),
        })
        .eq('id', params.id);

      if (dbError) throw dbError;

      alert("Produto atualizado com sucesso!");
      router.push("/admin");
      
    } catch (error: any) {
      console.error(error);
      alert("Erro ao salvar: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center gap-4 text-zinc-500">
      <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      <p>Carregando dados...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans pb-20">
      
      {/* HEADER */}
      <div className="border-b border-white/5 bg-[#09090b] sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center gap-4">
          <Link href="/admin" className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div>
             <h1 className="text-xl font-bold tracking-tight text-white">Editar Produto</h1>
             <p className="text-xs text-zinc-500 font-mono">ID: {params.id}</p>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-10 items-start">
          
          {/* --- COLUNA ESQUERDA: FOTO --- */}
          <div className="space-y-4">
            <p className="text-sm font-bold text-zinc-400 ml-1">Imagem do Produto</p>
            
            {/* Container da Imagem */}
            <div className="relative w-full aspect-[3/4] bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden shadow-lg">
              {previewUrl ? (
                <Image 
                  src={previewUrl} 
                  alt="Preview" 
                  fill 
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 gap-2">
                  <ImageIcon className="w-12 h-12 opacity-20" />
                  <p className="text-xs">Sem imagem</p>
                </div>
              )}
            </div>

            {/* BOTÃO EXTERNO PARA TROCAR FOTO (Mais seguro que input invisível) */}
            <button 
              type="button"
              onClick={handleTriggerFile}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 rounded-xl border border-white/5 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Camera className="w-4 h-4" />
              {previewUrl ? "Trocar Foto" : "Adicionar Foto"}
            </button>

            {/* Input Oculto */}
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              onChange={handleImageChange} 
              className="hidden" 
            />
          </div>

          {/* --- COLUNA DIREITA: DADOS --- */}
          <div className="space-y-6 bg-zinc-900/40 p-8 rounded-2xl border border-white/5">
            
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-zinc-400">
                <Package className="w-4 h-4" /> Nome do Produto
              </label>
              <input 
                required
                type="text" 
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
                  required type="number" step="0.01"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-all placeholder:text-zinc-600"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-zinc-400">
                  <Archive className="w-4 h-4" /> Estoque
                </label>
                <input 
                  required type="number"
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
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white focus:border-purple-500 outline-none appearance-none cursor-pointer"
              >
                <option value="Camisetas">Camisetas</option>
                <option value="Hoodies">Hoodies</option>
                <option value="Acessórios">Acessórios</option>
                <option value="Calças">Calças</option>
              </select>
            </div>

            <div className="pt-4 border-t border-white/5 mt-6">
              <button 
                type="submit" 
                disabled={saving}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(147,51,234,0.2)] flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
              >
                {saving ? (
                  <> <Loader2 className="w-5 h-5 animate-spin" /> SALVANDO... </>
                ) : (
                  <> <Save className="w-5 h-5" /> SALVAR ALTERAÇÕES </>
                )}
              </button>
            </div>

          </div>
        </form>
      </main>
    </div>
  );
}