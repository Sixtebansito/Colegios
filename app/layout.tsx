import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import CookieBanner from "./components/CookieBanner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Sistema de Gestión Escolar",
  description: "Plataforma de gestión para instituciones educativas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} antialiased h-full`}>
      <body className="font-sans h-full bg-gray-50 text-gray-900">
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
