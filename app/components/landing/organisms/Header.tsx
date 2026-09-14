'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ActionLink, Brand } from '../atoms/Elements'

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  const toggleDrawer = () => setDrawerOpen((prev) => !prev)
  const closeDrawer = () => setDrawerOpen(false)

  // Cerrar Drawer con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Bloquear scroll al abrir Drawer
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [drawerOpen])

  return (
    <header className="landing-header">
      <div className="landing-container landing-header-inner">
        <Brand />

        {/* Navegación Desktop (>= 768px) */}
        <nav className="landing-nav-desktop" aria-label="Navegación institucional">
          <a href="#inicio">Inicio</a>
          <a href="#nosotros">Propuesta</a>
          <a href="#niveles">Niveles</a>
          <a href="#instalaciones">Instalaciones</a>
          <a href="#admisiones">Admisiones</a>
          <Link href="/login" style={{ color: '#F59E0B' }}>
            Portal EVA ↗
          </Link>
        </nav>

        {/* Acciones y Botón Hamburguesa */}
        <div className="landing-header-actions">
          <ActionLink href="#admisiones" variant="primary">
            Postular / Agendar Visita
          </ActionLink>

          <button
            type="button"
            className="landing-menu-toggle"
            onClick={toggleDrawer}
            aria-label={drawerOpen ? 'Cerrar menú' : 'Abrir menú de navegación'}
            aria-expanded={drawerOpen}
            aria-controls="mobile-drawer"
          >
            {drawerOpen ? (
              <span aria-hidden="true" style={{ fontSize: '1.5rem', lineHeight: 1 }}>
                ✕
              </span>
            ) : (
              <span aria-hidden="true" style={{ fontSize: '1.5rem', lineHeight: 1 }}>
                ☰
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Backdrop oscuro para móvil */}
      <div
        className={`landing-backdrop ${drawerOpen ? 'active' : ''}`}
        onClick={closeDrawer}
        aria-hidden={!drawerOpen}
      />

      {/* Drawer lateral para móvil (< 768px) */}
      <aside
        id="mobile-drawer"
        className={`landing-drawer ${drawerOpen ? 'active' : ''}`}
        aria-hidden={!drawerOpen}
        aria-label="Menú móvil de navegación"
      >
        <div className="landing-drawer-header">
          <Brand />
          <button
            type="button"
            className="landing-drawer-close"
            onClick={closeDrawer}
            aria-label="Cerrar menú lateral"
          >
            ✕
          </button>
        </div>

        <nav className="landing-drawer-nav">
          <a href="#inicio" onClick={closeDrawer}>
            Inicio
          </a>
          <a href="#nosotros" onClick={closeDrawer}>
            Propuesta Institucional
          </a>
          <a href="#niveles" onClick={closeDrawer}>
            Niveles Educativos
          </a>
          <a href="#instalaciones" onClick={closeDrawer}>
            Instalaciones Militares
          </a>
          <a href="#admisiones" onClick={closeDrawer}>
            Proceso de Admisiones
          </a>
          <Link href="/login" onClick={closeDrawer} style={{ color: '#F59E0B' }}>
            Acceder al Portal Académico ↗
          </Link>
        </nav>

        <div className="landing-drawer-footer">
          <ActionLink href="#admisiones" variant="primary" onClick={closeDrawer}>
            Postular / Agendar Visita
          </ActionLink>
          <ActionLink href="/login" variant="secondary-light" onClick={closeDrawer}>
            Ingreso Cadetes y Padres
          </ActionLink>
        </div>
      </aside>
    </header>
  )
}
