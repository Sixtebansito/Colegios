import { Placeholder, SectionTitle } from '../atoms/Elements'
import NivelCard, { NivelCardProps } from '../molecules/NivelCard'

export function NivelesEducativos() {
  const niveles: NivelCardProps[] = [
    {
      badge: 'Nivel Inicial (3 a 5 años)',
      title: 'Educación Inicial y Preparatoria',
      description:
        'Estimulación temprana, psicomotricidad y descubrimiento del entorno con enfoque en virtudes, afecto y hábitos de orden.',
      achievements: [
        'Desarrollo psicomotriz y esquema corporal',
        'Primeros hábitos de orden y puntualidad',
        'Iniciación en valores patrios y convivencia',
        'Estimulación del lenguaje y creatividad',
      ],
      icon: '🌱',
      ratioLabel: '16:9 · Pabellón Infantil',
    },
    {
      badge: 'Educación Básica (1° a 10°)',
      title: 'Educación General Básica (EGB)',
      description:
        'Crecimiento académico riguroso en ciencias y letras, reforzado con doctrina cívica, liderazgo juvenil y actividades deportivas.',
      achievements: [
        'Sólida base en matemáticas y ciencias exactas',
        'Instrucción cívica, orden cerrado y bandas de gala',
        'Bilingüismo y pensamiento computacional',
        'Deporte formativo y trabajo cooperativo',
      ],
      icon: '📚',
      ratioLabel: '16:9 · Pabellón de Básica',
    },
    {
      badge: 'Bachillerato (1° a 3° BGU)',
      title: 'Bachillerato General y Técnico',
      description:
        'Formación de oficiales cadetes con mando de escuadrón, rigurosa preparación preuniversitaria y proyección militar o profesional.',
      achievements: [
        'Liderazgo de escuadrón y toma de decisiones tácticas',
        'Preparación de élite para universidades y escuelas militares',
        'Proyectos de investigación y ciencias aplicadas',
        'Instrucción premilitar avanzada y supervivencia',
      ],
      icon: '🎖️',
      ratioLabel: '16:9 · Pabellón de Cadetes',
    },
  ]

  return (
    <section id="niveles" className="landing-section tinted-bg">
      <div className="landing-container">
        <SectionTitle
          title="Niveles Educativos y Formativos"
          description="Acompañamos cada etapa del desarrollo del cadete con altos estándares pedagógicos y formación en virtudes cívicas."
        />
        <div className="landing-grid">
          {niveles.map((nivel) => (
            <NivelCard key={nivel.title} {...nivel} />
          ))}
        </div>
      </div>
    </section>
  )
}

export function Instalaciones() {
  const facilities = [
    {
      label: 'Campo de Maniobras y Patio de Honor',
      icon: '🏛️',
      title: 'Patio de Ceremonias y Paradas',
      description: 'Superficie de instrucción cívica, revistas militares, izamiento de pabellón y desfiles solemnes.',
    },
    {
      label: 'Laboratorios de Ciencias y Robótica',
      icon: '🔬',
      title: 'Complejo Científico y Tecnológico',
      description: 'Espacios de experimentación química, física, robótica y programación de alto rendimiento.',
    },
    {
      label: 'Villa Deportiva y Pista de Obstáculos',
      icon: '🏃',
      title: 'Polideportivo y Pista Atlética',
      description: 'Pista de tartán reglamentaria, piscina semiolímpica, canchas múltiples y circuito de resistencia militar.',
    },
    {
      label: 'Aulas Tácticas y Centro de Cómputo',
      icon: '💻',
      title: 'Aulas Multimedia y Biblioteca',
      description: 'Entornos interactivos con conectividad avanzada para el estudio estratégico, simulación y lectura.',
    },
  ]

  return (
    <section id="instalaciones" className="landing-section alt-bg">
      <div className="landing-container">
        <SectionTitle
          title="Instalaciones e Instrucción Militar"
          description="Espacios concebidos para fortalecer armónicamente el espíritu de cuerpo, la destreza física y la capacidad intelectual."
        />
        <div className="landing-grid">
          {facilities.map((item, i) => (
            <article key={i} className="landing-gallery-item">
              <Placeholder label={item.label} icon={item.icon} ratioLabel="16:9 · Instalación Oficial" />
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

// Compatibilidad retroactiva
export const Servicios = NivelesEducativos
