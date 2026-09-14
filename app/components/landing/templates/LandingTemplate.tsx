import Header from '../organisms/Header'
import Hero from '../organisms/Hero'
import Pilares from '../organisms/Pilares'
import { NivelesEducativos, Instalaciones } from '../organisms/Sections'
import FormularioContacto from '../organisms/FormularioContacto'
import Footer from '../organisms/Footer'
import './landing.css'

export default function LandingTemplate() {
  return (
    <div className="landing">
      {/* Enlace accesible para saltar directo al contenido */}
      <a href="#contenido" className="landing-skip">
        Saltar al contenido principal
      </a>

      {/* Organismo 1: Header con navegación desktop y Drawer móvil */}
      <Header />

      {/* Contenedor principal semántico */}
      <main id="contenido">
        {/* Organismo 2: Hero con Carrusel interactivo (6 segundos) */}
        <Hero />

        {/* Organismo 3: Propuesta Académica y Valores (Disciplina, Honor, Ciencia, Liderazgo) */}
        <Pilares />

        {/* Organismo 4: Niveles Educativos (Inicial, Básica, Bachillerato Militar) */}
        <NivelesEducativos />

        {/* Organismo 5: Infraestructura e Instrucción Militar */}
        <Instalaciones />

        {/* Organismo 6: Admisiones y Postulaciones con Formulario UI Kit */}
        <FormularioContacto />
      </main>

      {/* Organismo 7: Footer Institucional a 4 columnas con Negro Antracita */}
      <Footer />
    </div>
  )
}
