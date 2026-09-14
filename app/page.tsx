import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import LandingTemplate from './components/landing/templates/LandingTemplate'

export const metadata: Metadata = {
  title: 'Colegio Militar Institucional | Honor, Disciplina y Excelencia',
  description:
    'Formación cívico-militar, excelencia académica, liderazgo y valores para cadetes de Educación Inicial, Básica y Bachillerato.',
}

export default async function Home() {
  const session = await getSession()

  // Redireccionar si ya hay sesión activa
  if (session) {
    if (session.roleId === 1) redirect('/admin')
    if (session.roleId === 2) redirect('/profesor')
    if (session.roleId === 3) redirect('/alumno')
    if (session.roleId === 4) redirect('/contabilidad')
  }

  return <LandingTemplate />
}
