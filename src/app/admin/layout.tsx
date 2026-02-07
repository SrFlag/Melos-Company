"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../public/lib/supabase";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname(); // Para saber em qual página estamos
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      // Se já estiver na página de login, não precisa verificar (evita loop infinito)
      if (pathname === "/admin/login") {
        setLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // Se não tem sessão, chuta pro login
        router.push("/admin/login");
      } else {
        // Se tem sessão, libera o acesso
        setLoading(false);
      }
    }

    checkUser();
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-purple-500">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}