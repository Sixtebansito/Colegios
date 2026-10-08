"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the user has already accepted cookies
    const cookieConsent = localStorage.getItem("cookieConsent");
    if (!cookieConsent) {
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookieConsent", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-gray-900 text-white p-4 z-50 shadow-lg">
      <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm md:text-base text-gray-300 flex-1 text-center md:text-left">
          Utilizamos cookies y tecnologías similares para mejorar su experiencia en nuestro sitio web. 
          Al continuar navegando, usted acepta nuestros{" "}
          <Link href="/protecciondedatos" className="text-blue-400 hover:text-blue-300 underline">
            Términos y Condiciones y Política de Protección de Datos
          </Link>.
        </p>
        <button
          onClick={acceptCookies}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors whitespace-nowrap"
        >
          Aceptar y cerrar
        </button>
      </div>
    </div>
  );
}
