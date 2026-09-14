'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ActionLink, Badge } from '../atoms/Elements'
import HeroSlide, { ImageSlideData } from '../molecules/HeroSlide'

const IMAGE_SLIDES: ImageSlideData[] = [
  {
    badge: 'Campus Central',
    title: 'Patio de Honor y Campo de Paradas Militares',
    subtitle: 'Ceremonias de revista, izamiento del pabellón nacional y formación diaria de cadetes.',
    icon: '⚔️',
  },
  {
    badge: 'Área Académica',
    title: 'Complejo Científico y Laboratorios de Tecnología',
    subtitle: 'Aulas interactivas, laboratorios de física, química, robótica y preparación preuniversitaria.',
    icon: '🔬',
  },
  {
    badge: 'Instrucción Física',
    title: 'Polideportivo Militar y Pista Oficial de Obstáculos',
    subtitle: 'Circuito reglamentario de acondicionamiento físico, pista atlética y piscina semiolímpica.',
    icon: '🏅',
  },
  {
    badge: 'Doctrina y Liderazgo',
    title: 'Pabellón de Aulas Tácticas y Formación Cívica',
    subtitle: 'Espacios de debate, toma de decisiones estratégicas y cultivo del espíritu de cuerpo.',
    icon: '🏛️',
  },
]

const AUTOPLAY_INTERVAL = 6000 // Temporizador estricto de 6 segundos

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % IMAGE_SLIDES.length)
  }, [])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + IMAGE_SLIDES.length) % IMAGE_SLIDES.length)
  }, [])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  // Temporizador estricto de 6s con pausa en hover o focus
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    timerRef.current = setInterval(() => {
      nextSlide()
    }, AUTOPLAY_INTERVAL)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPaused, nextSlide])

  return (
    <section id="inicio" className="landing-hero-wrapper" aria-label="Portada e información institucional">
      {/* 1. CARRUSEL EXCLUSIVO DE IMÁGENES (Inmediatamente después del header) */}
      <div
        className="landing-image-carousel-section"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocusCapture={() => setIsPaused(true)}
        onBlurCapture={() => setIsPaused(false)}
        aria-label="Galería de imágenes institucionales"
      >
        <div className="landing-container">
          <div className="landing-image-carousel">
            {/* Pista de imágenes con transición fluida */}
            <div className="landing-carousel-track-wrapper">
              <div
                className="landing-carousel-track"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {IMAGE_SLIDES.map((slide, index) => (
                  <HeroSlide key={index} slide={slide} />
                ))}
              </div>
            </div>

            {/* Flechas de navegación previa / siguiente */}
            <button
              type="button"
              className="landing-carousel-arrow prev"
              onClick={prevSlide}
              aria-label="Ver imagen anterior"
            >
              ←
            </button>
            <button
              type="button"
              className="landing-carousel-arrow next"
              onClick={nextSlide}
              aria-label="Ver siguiente imagen"
            >
              →
            </button>

            {/* Barra de indicadores / Puntos de paginación */}
            <div className="landing-image-carousel-footer">
              <div className="landing-carousel-dots" role="tablist" aria-label="Seleccionar imagen">
                {IMAGE_SLIDES.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    role="tab"
                    className={`landing-carousel-dot ${currentSlide === index ? 'active' : ''}`}
                    onClick={() => goToSlide(index)}
                    aria-selected={currentSlide === index}
                    aria-label={`Ir a imagen ${index + 1} de ${IMAGE_SLIDES.length}: ${IMAGE_SLIDES[index].title}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. INFORMACIÓN DEL COLEGIO MILITAR (Bajo el carrusel de imágenes) */}
      <div className="landing-school-info-section">
        <div className="landing-container">
          <div className="landing-school-info-content">
            <div style={{ marginBottom: '16px' }}>
              <Badge>Colegio Militar Institucional</Badge>
            </div>

            <h1>
              Forjando líderes con <em>honor, disciplina</em> y excelencia académica.
            </h1>

            <p className="landing-school-description">
              Educamos a la juventud con sólidos valores patrios, rigurosa formación científica y carácter
              inquebrantable para servir a la nación con orgullo. Una institución que fusiona la tradición cívico-militar
              con metodologías de vanguardia.
            </p>

            <div className="landing-school-actions">
              <ActionLink href="#admisiones" variant="primary">
                Postular / Agendar Visita
              </ActionLink>
              <ActionLink href="#nosotros" variant="secondary">
                Conocer la propuesta
              </ActionLink>
            </div>

            {/* Fila de Pilares Rápidos Institucionales */}
            <div className="landing-school-highlights">
              <div className="landing-school-highlight-card">
                <span className="landing-highlight-icon">🛡️</span>
                <div>
                  <strong>Honor y Lealtad</strong>
                  <p>Principios cívicos y éticos inalterables en cada etapa de formación.</p>
                </div>
              </div>

              <div className="landing-school-highlight-card">
                <span className="landing-highlight-icon">📐</span>
                <div>
                  <strong>Rigor Científico</strong>
                  <p>Ciencias exactas, tecnología e investigación preuniversitaria de élite.</p>
                </div>
              </div>

              <div className="landing-school-highlight-card">
                <span className="landing-highlight-icon">⭐</span>
                <div>
                  <strong>Liderazgo y Temple</strong>
                  <p>Autodominio, espíritu de cuerpo y formación de oficiales del mañana.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
