export default function FormularioContacto() {
  return (
    <section id="contacto" className="py-20 md:py-28 bg-indigo-50">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 md:px-[32px] xl:px-[80px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-[32px] xl:gap-[80px]">
          
          {/* Info Block */}
          <div className="flex flex-col justify-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Inicia tu proceso de admisión</h2>
            <p className="text-lg text-gray-600 mb-8">
              Déjanos tus datos y nuestro equipo de admisiones se pondrá en contacto contigo para coordinar una visita y resolver todas tus dudas.
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 text-gray-600">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-200">
                  📍
                </div>
                <span>Av. Principal 123, Sector Educativo, Quito</span>
              </div>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-200">
                  📞
                </div>
                <span>+593 99 999 9999</span>
              </div>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-200">
                  ✉️
                </div>
                <span>admisiones@colegioseva.edu.ec</span>
              </div>
            </div>
          </div>

          {/* Form Block (Atomic Design Principles Applied) */}
          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100">
            <form className="flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Atomo: Input Group */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="nombre" className="text-sm font-semibold text-gray-900">Nombres <span className="text-red-500">*</span></label>
                  <input type="text" id="nombre" placeholder="Ej. Juan Pérez" required className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all" />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="telefono" className="text-sm font-semibold text-gray-900">Teléfono <span className="text-red-500">*</span></label>
                  <input type="tel" id="telefono" placeholder="Ej. 0991234567" required className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-sm font-semibold text-gray-900">Correo Electrónico <span className="text-red-500">*</span></label>
                <input type="email" id="email" placeholder="Ej. correo@ejemplo.com" required className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all" />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="nivel" className="text-sm font-semibold text-gray-900">Nivel de Interés</label>
                <select id="nivel" className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all text-gray-700">
                  <option value="">Selecciona un nivel...</option>
                  <option value="inicial">Educación Inicial</option>
                  <option value="basica">Educación Básica</option>
                  <option value="bachillerato">Bachillerato</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="mensaje" className="text-sm font-semibold text-gray-900">Mensaje</label>
                <textarea id="mensaje" rows={4} placeholder="¿Tienes alguna duda en específico?" className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all resize-none"></textarea>
              </div>

              <button type="submit" className="mt-2 w-full flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-indigo-600 rounded-xl shadow-md hover:bg-indigo-500 transition-all">
                Enviar Mensaje
              </button>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
}
