import Link from 'next/link'
import { Badge } from '../atoms/Elements'

export interface ContentCardProps {
  number: string
  title: string
  description: string
  icon?: string
  badge?: string
  href?: string
  actionLabel?: string
}

export default function ContentCard({
  number,
  title,
  description,
  icon = '🎖️',
  badge,
  href = '#contacto',
  actionLabel = 'Conocer más',
}: ContentCardProps) {
  return (
    <article className="landing-card">
      <div className="landing-card-header">
        <div className="landing-card-icon" aria-hidden="true">
          <span>{icon}</span>
        </div>
        <span className="landing-card-number">{number}</span>
      </div>
      {badge && (
        <div style={{ marginBottom: '12px' }}>
          <Badge>{badge}</Badge>
        </div>
      )}
      <h3>{title}</h3>
      <p>{description}</p>
      <div className="landing-card-footer">
        <Link href={href} className="landing-text-link">
          <span>{actionLabel}</span>
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  )
}
