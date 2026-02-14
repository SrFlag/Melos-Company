import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { CartSidebar } from "@/components/cart-sidebar"; // <--- Importe aqui

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MELOS.CO",
  description: "Streetwear",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className={inter.className}>
        <CartProvider>
          {children}
          <CartSidebar /> {/* <--- Adicione aqui, flutuando sobre tudo */}
        </CartProvider>
      </body>
    </html>
  );
}