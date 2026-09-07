import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import Link from 'next/link'

export default async function ProfesorDashboard() {
  const session = await getSession()
  
  // Find profesor ID based on User ID
  const profesor = await prisma.profesores.findUnique({
    where: { UsuarioID: session?.userId as number },
    include: {
      materias: {
        include: {
          grado: true
        }
      }
    }
  })

  if (!profesor) {
    return <div>Perfil de profesor no encontrado.</div>
  }

  const materiasCount = profesor.materias.length

  // Obtener total de solicitudes pendientes para las notas dadas por este profesor
  const pendingRequests = await prisma.solicitudesRecalificacion.count({
    where: {
      Estado: 'Pendiente',
      nota: {
        ProfesorID: profesor.ProfesorID
      }
    }
  })

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Bienvenido, Prof. {profesor.Nombre}
          </h2>
          <p className="mt-1 flex text-sm text-gray-500">
            Especialidad: {profesor.Especialidad || 'General'}
          </p>
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm ring-1 ring-gray-900/5 sm:p-6 transition-all hover:shadow-md">
          <dt className="truncate text-sm font-medium text-gray-500">Materias Asignadas</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-indigo-600">{materiasCount}</dd>
        </div>
        
        <Link href="/profesor/recalificaciones" className="block overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm ring-1 ring-gray-900/5 sm:p-6 transition-all hover:shadow-md hover:ring-indigo-200">
          <dt className="truncate text-sm font-medium text-gray-500 flex items-center justify-between">
            Solicitudes Pendientes
            {pendingRequests > 0 && (
              <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                Acción Requerida
              </span>
            )}
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{pendingRequests}</dd>
        </Link>
      </dl>

      <h3 className="mt-10 mb-4 text-lg font-medium leading-6 text-gray-900">Tus Materias</h3>
      <div className="overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <ul role="list" className="divide-y divide-gray-100">
          {profesor.materias.map((materia) => (
            <li key={materia.MateriaID} className="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6 transition-colors">
              <div className="flex min-w-0 gap-x-4">
                <div className="min-w-0 flex-auto">
                  <p className="text-sm font-semibold leading-6 text-gray-900">
                    <Link href={`/profesor/notas?materia=${materia.MateriaID}`}>
                      <span className="absolute inset-0" />
                      {materia.Nombre}
                    </Link>
                  </p>
                  <p className="mt-1 flex text-xs leading-5 text-gray-500">
                    {materia.grado?.Nombre} {materia.grado?.Paralelo && `- Paralelo ${materia.grado.Paralelo}`}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-x-4">
                <span className="text-sm text-indigo-600 hover:text-indigo-500 font-medium">Gestionar Notas &rarr;</span>
              </div>
            </li>
          ))}
          {profesor.materias.length === 0 && (
            <li className="px-4 py-8 text-center text-sm text-gray-500">
              No tienes materias asignadas actualmente.
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}
