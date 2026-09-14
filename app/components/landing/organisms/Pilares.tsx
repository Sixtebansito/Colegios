import { SectionTitle } from '../atoms/Elements'
import ContentCard, { ContentCardProps } from '../molecules/ContentCard'

export default function Pilares() {
  const cards: ContentCardProps[] = [
    {
      number: '01',
      title: 'Disciplina Consciente',
      description:
        'Cultivamos el orden, la puntualidad y la constancia no por imposición, sino como la vía para alcanzar la maestría en cada desafío.',
      icon: '🛡️',
      badge: 'Carácter',
      actionLabel: 'Conocer doctrina',
      href: '#contacto',
    },
    {
      number: '02',
      title: 'Honor y Lealtad',
      description:
        'Inculcamos el amor a la patria, la integridad moral intachable y el respeto profundo a los símbolos patrios y a la sociedad.',
      icon: '⚔️',
      badge: 'Ética',
      actionLabel: 'Código de honor',
      href: '#contacto',
    },
    {
      number: '03',
      title: 'Excelencia Científica',
      description:
        'Combinamos el método científico con una sólida preparación en matemáticas, ciencias experimentales, tecnología y pensamiento crítico.',
      icon: '📐',
      badge: 'Academia',
      actionLabel: 'Ver investigación',
      href: '#niveles',
    },
    {
      number: '04',
      title: 'Liderazgo y Servicio',
      description:
        'Formamos cadetes capaces de asumir la iniciativa, trabajar en equipo bajo presión y actuar con vocación de servicio hacia la nación.',
      icon: '⭐',
      badge: 'Liderazgo',
      actionLabel: 'Plan formativo',
      href: '#admisiones',
    },
  ]

  return (
    <section id="nosotros" className="landing-section alt-bg">
      <div className="landing-container">
        <SectionTitle
          title="Propuesta y Valores Institucionales"
          description="Nuestra formación integra el rigor académico y los valores marciales para forjar ciudadanos de honor, temple y excelencia."
        />
        <div className="landing-grid">
          {cards.map((card) => (
            <ContentCard key={card.number} {...card} />
          ))}
        </div>
      </div>
    </section>
  )
}
