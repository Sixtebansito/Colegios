import { getSession, logout } from '@/lib/auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function PadreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (!session || session.roleId !== 3) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center text-xl font-bold text-indigo-600">
                Gesco
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link href="/padre" className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">
                  Inicio
                </Link>
                <Link href="/padre/notas" className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">
                  Notas de Hijos
                </Link>
                <Link href="/padre/recalificaciones" className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">
                  Recalificaciones
                </Link>
                <Link href="/padre/mensajes" className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">
                  Mensajes
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700 font-medium hidden sm:block">Familiar: {session.nombre} {session.apellido}</span>
              <form action={async () => {
                'use server'
                await logout()
                redirect('/login')
              }}>
                <button type="submit" className="text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors">
                  Salir
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}
