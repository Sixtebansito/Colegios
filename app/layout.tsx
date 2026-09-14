import type { Metadata } from "next";
import { institutionalSans, institutionalSerif } from '@/lib/fonts';
import "./globals.css";
import "./portal.css";

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
    <html lang="es" className={`${institutionalSans.variable} ${institutionalSerif.variable} antialiased h-full`}>
      <body className="font-sans h-full bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
