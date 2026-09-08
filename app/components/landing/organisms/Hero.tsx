import Link from 'next/link';

export default function Hero() {
  return (
    <section id="inicio" className="bg-gray-50 py-16 md:py-24">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 md:px-[32px] xl:px-[80px]">
        {/* Layout a 2 columnas en Desktop usando Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-[24px] xl:gap-[32px] items-center">
          
          {/* Columna Texto */}
          <div className="flex flex-col gap-6">
            <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold w-max">
              Inscripciones Abiertas 2025-2026
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
              Formando líderes para el <span className="text-indigo-600">futuro</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-lg">
              Una plataforma educativa integral que conecta estudiantes, padres y profesores en un entorno virtual de aprendizaje moderno.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link
                href="#contacto"
                className="flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-indigo-600 rounded-xl shadow-md hover:bg-indigo-500 transition-all"
              >
                Solicitar Información
              </Link>
              <Link
                href="#nosotros"
                className="flex items-center justify-center px-8 py-4 text-base font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
              >
                Conocer más
              </Link>
            </div>
          </div>

          {/* Columna Imagen / Placeholder */}
          <div className="relative w-full aspect-video lg:aspect-[4/3] bg-gray-200 rounded-2xl overflow-hidden shadow-xl border border-gray-100 flex items-center justify-center">
            <span className="text-gray-400 font-medium flex flex-col items-center gap-2">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Imagen Hero (16:9 o 4:3)
            </span>
          </div>
          
        </div>
      </div>
    </section>
  );
}
