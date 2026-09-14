import Link from 'next/link'
import { Brand } from '../atoms/Elements'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="landing-footer" role="contentinfo">
      <div className="landing-container">
        <div className="landing-footer-grid">
          {/* Columna 1: Identidad Militar y Lema */}
          <div className="landing-footer-col">
            <Brand />
            <p>
              Institución educativa militarizada líder en formación cívica, rigor científico, disciplina consciente y
              cultivo del honor patriótico.
            </p>
            <p style={{ fontSize: '0.8125rem', color: '#CBD5E1' }}>
              <em>&ldquo;Vivir con honor, servir con lealtad, vencer con ciencia.&rdquo;</em>
            </p>
          </div>

          {/* Columna 2: Navegación Institucional */}
          <div className="landing-footer-col">
            <h4>Navegación</h4>
            <nav aria-label="Navegación del pie de página" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a href="#inicio">Inicio institucional</a>
              <a href="#nosotros">Propuesta y valores marciales</a>
              <a href="#niveles">Niveles de formación cadete</a>
              <a href="#instalaciones">Campos e instalaciones</a>
              <a href="#admisiones">Proceso de admisiones</a>
            </nav>
          </div>

          {/* Columna 3: Canales Oficiales y Atención */}
          <div className="landing-footer-col">
            <h4>Atención Oficial</h4>
            <div className="landing-footer-contact-list">
              <span>📍 Av. de los Héroes y Patria s/n, Cuartel Central</span>
              <span>📞 Central: (02) 299-8000 / Ext. Admisiones 104</span>
              <span>✉️ admisiones@colegiomilitar.edu</span>
              <span>⏰ Atención: Lun - Vie | 07:30 a 16:30</span>
            </div>
          </div>

          {/* Columna 4: Acreditación y Plataforma */}
          <div className="landing-footer-col">
            <h4>Portal & Acreditaciones</h4>
            <p>
              Acreditado por el Ministerio de Educación y el Comando de Educación y Doctrina Militar.
            </p>
            <div style={{ marginTop: '8px' }}>
              <Link
                href="/login"
                className="landing-button secondary-light"
                style={{ width: '100%', fontSize: '0.875rem' }}
              >
                Acceder al Sistema EVA ↗
              </Link>
            </div>
          </div>
        </div>

        {/* Barra Inferior: Copyright y Legales */}
        <div className="landing-footer-bottom">
          <span>
            © {currentYear} Colegio Militar Institucional. Todos los derechos reservados.
          </span>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <a href="#inicio">Reglamento Interno</a>
            <a href="#inicio">Política de Privacidad</a>
            <a href="#inicio">Términos del Servicio</a>
            <a href="#inicio" aria-label="Volver arriba al inicio de la página">
              Volver al inicio ↑
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
