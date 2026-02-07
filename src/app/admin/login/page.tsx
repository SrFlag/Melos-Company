"use client";

import { useState } from "react";
import { supabase } from "../../../../public/lib/supabase";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2, ArrowRight, ShieldCheck } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg("Acesso negado. Verifique seus dados.");
      setLoading(false);
    } else {
      router.push("/admin");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#050505] flex items-center justify-center p-4 selection:bg-purple-500/30 font-sans">
      
      {/* Background Decorativo (Luz Roxa) */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

      {/* --- CARTÃO DE LOGIN (Centralizado e Largura Fixa) --- */}
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl relative z-10 overflow-hidden">
        
        {/* Barra Superior Colorida */}
        <div className="h-2 w-full bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600"></div>

        <div className="px-8 py-10"> {/* Margem interna generosa */}
          
          {/* Cabeçalho */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-800 text-white mb-4 shadow-inner border border-zinc-700">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black italic tracking-tighter text-white">
              MELOS<span className="text-purple-600">.</span>CO
            </h1>
            <p className="text-zinc-500 text-xs font-medium uppercase tracking-widest mt-2">Acesso Administrativo</p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleLogin} className="space-y-5">
            
            {/* Campo E-mail */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">E-mail</label>
              <div className="relative flex items-center">
                {/* Ícone (Fixo na esquerda) */}
                <div className="absolute left-0 w-12 h-full flex items-center justify-center text-zinc-500 pointer-events-none z-10">
                  <Mail className="w-5 h-5" />
                </div>
                {/* Input com padding esquerdo forçado (pl-12) */}
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@melos.co"
                  className="w-full bg-zinc-950/50 border border-zinc-700/50 rounded-xl h-12 pl-12 pr-4 text-sm text-white focus:border-purple-500 focus:bg-zinc-950 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder:text-zinc-700"
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Senha</label>
              <div className="relative flex items-center">
                <div className="absolute left-0 w-12 h-full flex items-center justify-center text-zinc-500 pointer-events-none z-10">
                  <Lock className="w-5 h-5" />
                </div>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-950/50 border border-zinc-700/50 rounded-xl h-12 pl-12 pr-4 text-sm text-white focus:border-purple-500 focus:bg-zinc-950 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder:text-zinc-700"
                />
              </div>
            </div>

            {/* Mensagem de Erro */}
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold px-4 py-3 rounded-lg text-center animate-pulse">
                {errorMsg}
              </div>
            )}

            {/* Botão */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold h-12 rounded-xl transition-all shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40 hover:-translate-y-0.5 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2 text-sm uppercase tracking-wide"
            >
              {loading ? (
                <> <Loader2 className="w-4 h-4 animate-spin" /> Verificando... </>
              ) : (
                <> Entrar no Painel <ArrowRight className="w-4 h-4" /> </>
              )}
            </button>
          </form>

        </div>
        
        {/* Rodapé do Cartão */}
        <div className="bg-zinc-950/50 px-8 py-4 border-t border-zinc-800 text-center">
          <p className="text-[10px] text-zinc-600">Sistema Seguro v2.0 • Melos Company</p>
        </div>
      </div>
    </div>
  );
}