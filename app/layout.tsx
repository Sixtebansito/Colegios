import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "EVA COLEGIOS",
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
      </body>
    </html>
  );
}
