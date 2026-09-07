import { getSession } from '@/lib/auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function Home() {
  const session = await getSession()

  // Redirect users to their respective dashboards based on role
  if (session) {
    if (session.roleId === 1) redirect('/admin')
    if (session.roleId === 2) redirect('/profesor')
    if (session.roleId === 3) redirect('/padre')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl bg-white shadow-xl ring-1 ring-gray-900/5 sm:rounded-2xl sm:p-12 p-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-6">
          Sistema de Gestión Escolar
        </h1>
        <p className="text-lg leading-8 text-gray-600 mb-10">
          Una plataforma moderna e intuitiva para gestionar todos los procesos educativos de su institución, diseñada con los más altos estándares.
        </p>
        <div className="flex items-center justify-center gap-x-6">
          <Link
            href="/login"
            className="rounded-md bg-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  )
}
