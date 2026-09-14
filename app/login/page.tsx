'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/app/actions/auth'
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setError(null)
    setLoading(true)
    try {
      const result = await login(formData)
      if (result.error) {
        setError(result.error)
        setLoading(false)
      } else if (result.success) {
        const destinations: Record<number, string> = {
          1: '/admin', 2: '/profesor', 3: '/alumno', 4: '/contabilidad',
        }
        router.push(destinations[result.roleId ?? 0] || '/')
      }
    } catch {
      setError('No pudimos iniciar sesión. Intenta nuevamente.')
      setLoading(false)
    }
  }

  return (
    <main className="portal-login">
      <section className="portal-login-form" aria-labelledby="login-title">
        <div className="portal-login-card">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-brand-600 mb-10">
            <ArrowLeft size={16} aria-hidden="true" /> Volver al inicio
          </Link>
          <div className="flex items-center gap-3 mb-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-institutional text-gold">
              <ShieldCheck size={28} aria-hidden="true" />
            </div>
            <div>
              <p className="portal-brand text-gray-900">Colegio Militar</p>
              <p className="text-xs uppercase tracking-widest text-gray-500">Honor · Disciplina · Ciencia</p>
            </div>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand-600 mb-3">Portal educativo · EVA</p>
          <h1 id="login-title" className="text-3xl font-bold text-gray-900 leading-tight">Bienvenido de vuelta</h1>
          <p className="mt-3 text-gray-600">Accede a tu espacio académico e institucional.</p>

          <form action={handleSubmit} className="mt-8 space-y-6" aria-busy={loading}>
            <div className="flex flex-col gap-2">
              <label htmlFor="cedula" className="text-sm font-semibold">Cédula o usuario</label>
              <input id="cedula" name="cedula" type="text" required autoComplete="username"
                placeholder="Ingresa tu cédula o usuario" className="px-4 py-3 w-full" />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-semibold">Contraseña</label>
              <input id="password" name="password" type="password" required autoComplete="current-password"
                placeholder="Ingresa tu contraseña" className="px-4 py-3 w-full" />
            </div>
            {error && <p role="alert" className="rounded-md bg-red-50 p-4 border border-red-200 text-sm text-red-800">{error}</p>}
            <button type="submit" disabled={loading}
              className="portal-primary flex w-full items-center justify-center gap-3 px-6 py-3.5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {loading ? 'Iniciando sesión…' : 'Ingresar al portal'}
              {!loading && <ArrowRight size={18} aria-hidden="true" />}
            </button>
          </form>
          <p className="mt-8 text-sm text-gray-600 text-center">
            ¿Necesitas una cuenta?{' '}
            <Link href="/#admisiones" className="font-semibold text-brand-600 hover:underline">Contacta con admisiones</Link>
          </p>
          <p className="mt-10 pt-6 border-t border-gray-200 text-xs text-gray-500 text-center">Entorno Virtual de Aprendizaje · Colegio Militar</p>
        </div>
      </section>
      <aside className="portal-login-story" aria-label="Valores institucionales">
        <p className="text-xs font-bold tracking-widest uppercase text-brand-200">Formamos para la vida</p>
        <h2>Honor, disciplina y excelencia.</h2>
        <p className="text-lg text-gray-300 max-w-lg">Un espacio que une a nuestra comunidad educativa. Aprende, acompaña y gestiona cada etapa de la formación académica.</p>
        <div className="portal-login-values">
          <div><strong>Aprendizaje</strong><p>Tareas, cursos y calificaciones en un solo lugar.</p></div>
          <div><strong>Comunidad</strong><p>Comunicación entre alumnos y docentes.</p></div>
          <div><strong>Gestión</strong><p>Organización al servicio de la educación.</p></div>
        </div>
      </aside>
    </main>
  )
}
