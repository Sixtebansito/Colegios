import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AdminMatriculacionPage() {
  const session = await getSession()
  if (!session || session.roleId !== 1) redirect('/login')

  return (
    <div>
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-6 text-gray-900">Matriculación</h1>
          <p className="mt-2 text-sm text-gray-700">Módulo de gestión de matrículas para el periodo actual.</p>
        </div>
      </div>
      <div className="bg-white p-12 text-center shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <h3 className="mt-2 text-sm font-semibold text-gray-900">Módulo en Construcción</h3>
        <p className="mt-1 text-sm text-gray-500">Aquí se podrán asignar estudiantes a grados y cursos.</p>
      </div>
    </div>
  )
}
