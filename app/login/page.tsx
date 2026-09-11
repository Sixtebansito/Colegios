'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/app/actions/auth'
import Link from 'next/link'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setError(null)
    setLoading(true)
    
    const result = await login(formData)
    
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else if (result.success) {
      if (result.roleId === 1) router.push('/admin')
      else if (result.roleId === 2) router.push('/profesor')
      else if (result.roleId === 3) router.push('/alumno')
      else if (result.roleId === 4) router.push('/contabilidad')
      else router.push('/')
    }
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sección Izquierda - Formulario */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:w-[480px] xl:w-[560px] lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md">
              C
            </div>
            <span className="text-2xl font-bold text-gray-900 tracking-tight">Colegios EVA</span>
          </div>

          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
              Bienvenido de vuelta
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Ingresa tus credenciales para acceder a la plataforma.
            </p>
          </div>

          <div className="mt-8">
            <form action={handleSubmit} className="space-y-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="cedula" className="text-sm font-semibold text-gray-900">
                  Cédula <span className="text-red-500">*</span>
                </label>
                <input
                  id="cedula"
                  name="cedula"
                  type="text"
                  required
                  placeholder="Ej. 1712345678"
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="password" className="text-sm font-semibold text-gray-900">
                  Contraseña <span className="text-red-500">*</span>
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Recordarme
                  </label>
                </div>

                <div className="text-sm leading-6">
                  <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 p-4 border border-red-100">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">{error}</h3>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center px-8 py-4 text-base font-bold text-white bg-indigo-600 rounded-xl shadow-md hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? 'Iniciando...' : 'Iniciar Sesión'}
                </button>
              </div>
            </form>

            <div className="mt-8 text-center text-sm text-gray-600">
              ¿No tienes cuenta?{' '}
              <Link href="/#contacto" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                Contacta con admisiones
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Sección Derecha - Imagen/Visual */}
      <div className="relative hidden w-0 flex-1 lg:block bg-indigo-900">
        <div className="absolute inset-0 h-full w-full object-cover opacity-20 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
        <div className="absolute inset-0 flex flex-col justify-center items-start px-20">
          <h2 className="text-5xl font-bold text-white mb-6 leading-tight max-w-2xl">
            La plataforma educativa que potencia el aprendizaje
          </h2>
          <p className="text-xl text-indigo-200 max-w-xl leading-relaxed">
            Conéctate, colabora y gestiona tus actividades académicas desde un solo lugar. Entorno Virtual de Aprendizaje (EVA) diseñado para la excelencia.
          </p>
        </div>
      </div>
    </div>
  )
}
