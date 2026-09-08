import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 md:px-[32px] xl:px-[80px] h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Logo Placeholder */}
          <div className="w-10 h-10 bg-indigo-600 rounded-md flex items-center justify-center text-white font-bold text-xl">
            C
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">Colegios EVA</span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="#inicio" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Inicio</Link>
          <Link href="#nosotros" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Nosotros</Link>
          <Link href="#niveles" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Niveles Académicos</Link>
          <Link href="#instalaciones" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Instalaciones</Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="hidden sm:flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            Portal Web
          </Link>
          <Link
            href="#contacto"
            className="flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-500 transition-colors"
          >
            Admisiones
          </Link>
        </div>
      </div>
    </header>
  );
}
