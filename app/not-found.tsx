import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 sm:p-12 text-center">
        <h1 className="text-6xl font-bold text-[#004a8f] mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Página no encontrada</h2>
        <p className="text-gray-500 mb-8">
          Lo sentimos, la página que buscas en EVA COLEGIOS no existe o ha sido movida.
        </p>
        <Link 
          href="/" 
          className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-3 bg-[#004a8f] text-white font-medium rounded-lg hover:bg-[#003870] transition-colors shadow-sm hover:shadow-md"
        >
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}
