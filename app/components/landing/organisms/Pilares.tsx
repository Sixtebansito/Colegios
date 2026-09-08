import { BookOpen, Users, ShieldCheck, Monitor } from 'lucide-react';

export default function Pilares() {
  const pilares = [
    {
      title: 'Excelencia Académica',
      description: 'Metodologías actualizadas y un equipo docente altamente calificado para el éxito estudiantil.',
      icon: BookOpen,
    },
    {
      title: 'Tecnología de Punta',
      description: 'Entorno Virtual de Aprendizaje (EVA) y recursos digitales integrados en cada clase.',
      icon: Monitor,
    },
    {
      title: 'Comunidad Integrada',
      description: 'Comunicación fluida entre padres, profesores y alumnos a través de nuestro chat global.',
      icon: Users,
    },
    {
      title: 'Seguridad y Bienestar',
      description: 'Instalaciones seguras y un equipo de apoyo psicopedagógico permanente.',
      icon: ShieldCheck,
    },
  ];

  return (
    <section id="nosotros" className="py-20 md:py-28 bg-white">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 md:px-[32px] xl:px-[80px]">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">¿Por qué elegirnos?</h2>
          <p className="text-lg text-gray-600">Nuestra propuesta de valor se basa en cuatro pilares fundamentales que garantizan el desarrollo integral de nuestros estudiantes.</p>
        </div>

        {/* Grid Responsive: 1 col (mobile), 2 cols (tablet), 4 cols (desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-[24px]">
          {pilares.map((pilar, index) => {
            const Icon = pilar.icon;
            return (
              <div key={index} className="flex flex-col p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{pilar.title}</h3>
                <p className="text-gray-600 flex-1 leading-relaxed">
                  {pilar.description}
                </p>
                <a href="#contacto" className="mt-6 text-indigo-600 font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                  Saber más <span aria-hidden="true">&rarr;</span>
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
