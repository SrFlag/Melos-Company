import type { Metadata } from "next";
import { Inter } from "next/font/google"; // ou a fonte que você escolheu
import "./globals.css";
import { CartProvider } from "@/context/CartContext"; // <--- Importe 1
import { CartSidebar } from "@/components/cart-sidebar"; // <--- Importe 2

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Melos.Co",
  description: "Streetwear High Quality",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className={inter.className}>
        {/* Envolvendo tudo com o Provider */}
        <CartProvider>
          {children}
          <CartSidebar /> {/* A gaveta fica aqui, disponível pra todo o site */}
        </CartProvider>
      </body>
    </html>
  );
}
