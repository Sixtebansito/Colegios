import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 pt-16 pb-8 text-gray-300">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 md:px-[32px] xl:px-[80px]">
        
        {/* 4 columns on Desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center text-white font-bold text-lg">
                C
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Colegios EVA</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400 pr-4">
              Formando líderes con excelencia académica y valores, a través de innovación tecnológica y entornos de aprendizaje modernos.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-lg font-bold text-white mb-2">Enlaces Rápidos</h4>
            <Link href="#inicio" className="text-sm hover:text-indigo-400 transition-colors">Inicio</Link>
            <Link href="#nosotros" className="text-sm hover:text-indigo-400 transition-colors">Nuestra Institución</Link>
            <Link href="#niveles" className="text-sm hover:text-indigo-400 transition-colors">Oferta Académica</Link>
            <Link href="#instalaciones" className="text-sm hover:text-indigo-400 transition-colors">Instalaciones</Link>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-lg font-bold text-white mb-2">Plataforma</h4>
            <Link href="/login" className="text-sm hover:text-indigo-400 transition-colors">Portal de Alumnos</Link>
            <Link href="/login" className="text-sm hover:text-indigo-400 transition-colors">Portal de Padres</Link>
            <Link href="/login" className="text-sm hover:text-indigo-400 transition-colors">Portal de Profesores</Link>
            <Link href="/admin" className="text-sm hover:text-indigo-400 transition-colors">Administración</Link>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-lg font-bold text-white mb-2">Legal</h4>
            <Link href="#" className="text-sm hover:text-indigo-400 transition-colors">Términos y Condiciones</Link>
            <Link href="#" className="text-sm hover:text-indigo-400 transition-colors">Políticas de Privacidad</Link>
            <Link href="#" className="text-sm hover:text-indigo-400 transition-colors">Uso de Cookies</Link>
          </div>

        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Colegios EVA. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4">
            {/* Social placehodlers */}
            <div className="w-8 h-8 rounded-full bg-gray-800 hover:bg-indigo-600 transition-colors cursor-pointer flex items-center justify-center">
              <span className="sr-only">Facebook</span>
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" /></svg>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-800 hover:bg-indigo-600 transition-colors cursor-pointer flex items-center justify-center">
              <span className="sr-only">Instagram</span>
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
