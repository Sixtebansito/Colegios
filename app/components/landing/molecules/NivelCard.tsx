import Link from 'next/link'
import { Badge, Placeholder } from '../atoms/Elements'

export interface NivelCardProps {
  badge: string
  title: string
  description: string
  achievements: string[]
  ratioLabel?: string
  icon?: string
}

export default function NivelCard({
  badge,
  title,
  description,
  achievements,
  ratioLabel = '16:9 · Instalaciones de Nivel',
  icon = '🎓',
}: NivelCardProps) {
  return (
    <article className="landing-level-card">
      <Placeholder label={title} icon={icon} ratioLabel={ratioLabel} />
      <div className="landing-level-body">
        <div className="landing-level-badge-row">
          <Badge>{badge}</Badge>
        </div>
        <h3>{title}</h3>
        <p>{description}</p>
        <ul className="landing-level-list" aria-label={`Logros y competencias de ${title}`}>
          {achievements.map((achievement, idx) => (
            <li key={idx}>
              <span>{achievement}</span>
            </li>
          ))}
        </ul>
        <div className="landing-level-action">
          <Link href="#contacto" className="landing-button secondary" style={{ width: '100%' }}>
            Conocer Malla Curricular →
          </Link>
        </div>
      </div>
    </article>
  )
}
