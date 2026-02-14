"use client";

import { useState, useRef } from "react";
import { supabase } from "../../../../public/lib/supabase";
import { ArrowLeft, Upload, Package, DollarSign, Archive, Layers, Save, Loader2, ImageIcon, Plus, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Imagem Principal
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainPreview, setMainPreview] = useState<string | null>(null);

  // Galeria (4 slots)
  const [galleryFiles, setGalleryFiles] = useState<(File | null)[]>([null, null, null, null]);
  const [galleryPreviews, setGalleryPreviews] = useState<(string | null)[]>([null, null, null, null]);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "Camisetas",
    stock: "10",
  });

  const generateSlug = (text: string) => {
    return text.toString().toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-").replace(/[^\w\-]+/g, "").replace(/\-\-+/g, "-")
      .replace(/^-+/, "").replace(/-+$/, "");
  };

  // Upload Helper
  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const { error } = await supabase.storage.from('images').upload(fileName, file);
    if (error) throw error;
    const { data } = supabase.storage.from('images').getPublicUrl(fileName);
    return data.publicUrl;
  };

  // Handlers
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setMainImage(file);
      setMainPreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      
      const newFiles = [...galleryFiles];
      newFiles[index] = file;
      setGalleryFiles(newFiles);

      const newPreviews = [...galleryPreviews];
      newPreviews[index] = URL.createObjectURL(file);
      setGalleryPreviews(newPreviews);
    }
  };

  const removeGalleryImage = (index: number) => {
    const newFiles = [...galleryFiles];
    newFiles[index] = null;
    setGalleryFiles(newFiles);

    const newPreviews = [...galleryPreviews];
    newPreviews[index] = null;
    setGalleryPreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let mainImageUrl = "";
      const galleryUrls: string[] = [];

      // 1. Upload Principal
      if (mainImage) {
        mainImageUrl = await uploadImage(mainImage);
      }

      // 2. Upload Galeria
      for (const file of galleryFiles) {
        if (file) {
          const url = await uploadImage(file);
          galleryUrls.push(url);
        }
      }

      // 3. Salvar no Banco
      const { error } = await supabase.from('products').insert([{
        name: formData.name,
        slug: generateSlug(formData.name),
        price: parseFloat(formData.price.replace(',', '.')),
        image_url: mainImageUrl, // Foto Principal
        gallery: galleryUrls,    // Array com as outras fotos
        category: formData.category,
        stock: parseInt(formData.stock),
      }]);

      if (error) throw error;

      alert("Produto criado com sucesso!");
      router.push("/admin");
      
    } catch (error: any) {
      alert("Erro: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans pb-20 selection:bg-purple-500/30">
      
      {/* Header */}
      <div className="border-b border-white/5 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center gap-4">
          <Link href="/admin" className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-white">Novo Produto</h1>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-[350px_1fr] gap-12 items-start">
          
          {/* --- ÁREA DE FOTOS --- */}
          <div className="space-y-6">
            <p className="text-sm font-bold text-zinc-400 ml-1 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" /> Fotos do Produto
            </p>
            
            {/* Foto Principal (Capa) */}
            <div className="relative w-full aspect-[3/4] bg-zinc-900 rounded-2xl border-2 border-dashed border-zinc-700 hover:border-purple-500 transition-colors overflow-hidden group">
              {mainPreview ? (
                <>
                  <Image src={mainPreview} alt="Preview" fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-white font-bold text-sm">Trocar Capa</p>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 pointer-events-none">
                  <Upload className="w-10 h-10 mb-2 opacity-50" />
                  <p className="text-sm font-medium">Foto Principal</p>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleMainImageChange} className="absolute inset-0 opacity-0 cursor-pointer" required />
            </div>

            {/* Galeria (4 slots menores) */}
            <div className="grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((index) => (
                <div key={index} className="relative aspect-square bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-600 transition-colors overflow-hidden group">
                  
                  {galleryPreviews[index] ? (
                    <>
                      <Image src={galleryPreviews[index]!} alt={`Gallery ${index}`} fill className="object-cover" />
                      {/* Botão Remover */}
                      <button 
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full hover:bg-red-600 transition-colors z-20"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-700 pointer-events-none">
                      <Plus className="w-5 h-5" />
                    </div>
                  )}
                  
                  {/* Input individual para cada slot */}
                  {!galleryPreviews[index] && (
                     <input 
                       type="file" 
                       accept="image/*" 
                       onChange={(e) => handleGalleryChange(index, e)} 
                       className="absolute inset-0 opacity-0 cursor-pointer" 
                     />
                  )}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-zinc-500 text-center">A primeira foto é a capa. As outras aparecem nos detalhes.</p>
          </div>

          {/* --- FORMULÁRIO DE DADOS --- */}
          <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-3xl space-y-8">
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-400 ml-1">Nome do Produto</label>
              <div className="relative">
                <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 w-5 h-5" />
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 pl-12 pr-4 text-white focus:border-purple-500 outline-none transition-all" placeholder="Ex: Camiseta Crow" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-400 ml-1">Preço (R$)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 w-4 h-4" />
                  <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 pl-10 pr-4 text-white focus:border-purple-500 outline-none transition-all" placeholder="0.00" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-400 ml-1">Estoque</label>
                <div className="relative">
                  <Archive className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 w-4 h-4" />
                  <input required type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 pl-10 pr-4 text-white focus:border-purple-500 outline-none transition-all" placeholder="10" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-400 ml-1">Categoria</label>
              <div className="relative">
                <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 w-5 h-5" />
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 pl-12 pr-4 text-white focus:border-purple-500 outline-none appearance-none cursor-pointer">
                  <option value="Camisetas">Camisetas</option>
                  <option value="Hoodies">Hoodies</option>
                  <option value="Acessórios">Acessórios</option>
                  <option value="Calças">Calças</option>
                </select>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5">
              <button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)] flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {loading ? "CRIANDO..." : "CRIAR PRODUTO"}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}