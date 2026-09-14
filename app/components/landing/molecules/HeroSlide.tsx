export interface ImageSlideData {
  title: string
  subtitle: string
  badge: string
  icon?: string
}

export default function HeroSlide({ slide }: { slide: ImageSlideData }) {
  return (
    <div className="landing-carousel-slide">
      <div className="landing-image-banner">
        {/* Placeholder visual preparado para imagen institucional */}
        <div className="landing-image-banner-visual" aria-hidden="true">
          <div className="landing-image-banner-emblem">{slide.icon || '⚔️'}</div>
          <span className="landing-image-banner-hint">Fotografía Institucional · Formato Panorámico</span>
        </div>

        {/* Overlay informativo sobre la imagen */}
        <div className="landing-image-banner-caption">
          <span className="landing-image-badge">{slide.badge}</span>
          <strong className="landing-image-title">{slide.title}</strong>
          <span className="landing-image-sub">{slide.subtitle}</span>
        </div>
      </div>
    </div>
  )
}
