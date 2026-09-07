import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import Link from 'next/link'

export default async function PadreDashboard() {
  const session = await getSession()
  
  // Find padre ID based on User ID
  const padre = await prisma.padres.findUnique({
    where: { UsuarioID: session?.userId as number },
    include: {
      estudiantes: {
        include: {
          grado: true,
          matriculas: true,
        }
      }
    }
  })

  if (!padre) {
    return <div>Perfil de familiar no encontrado.</div>
  }

  const estudiantesCount = padre.estudiantes.length

  // Obtener total de recalificaciones pendientes para este padre
  const pendingRecalifs = await prisma.solicitudesRecalificacion.count({
    where: {
      PadreID: padre.PadreID,
      Estado: 'Pendiente',
    }
  })

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Portal Familiar
          </h2>
          <p className="mt-1 flex text-sm text-gray-500">
            Representante: {padre.Nombre} {padre.Apellido}
          </p>
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm ring-1 ring-gray-900/5 sm:p-6 transition-all hover:shadow-md">
          <dt className="truncate text-sm font-medium text-gray-500">Estudiantes a Cargo</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-indigo-600">{estudiantesCount}</dd>
        </div>
        
        <Link href="/padre/recalificaciones" className="block overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm ring-1 ring-gray-900/5 sm:p-6 transition-all hover:shadow-md hover:ring-indigo-200">
          <dt className="truncate text-sm font-medium text-gray-500 flex items-center justify-between">
            Solicitudes Pendientes
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{pendingRecalifs}</dd>
        </Link>
      </dl>

      <h3 className="mt-10 mb-4 text-lg font-medium leading-6 text-gray-900">Sus Representados</h3>
      <div className="overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <ul role="list" className="divide-y divide-gray-100">
          {padre.estudiantes.map((estudiante) => (
            <li key={estudiante.EstudianteID} className="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6 transition-colors">
              <div className="flex min-w-0 gap-x-4">
                <div className="h-12 w-12 flex-none rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-lg ring-1 ring-inset ring-indigo-600/20">
                  {estudiante.Nombre.charAt(0)}{estudiante.Apellido.charAt(0)}
                </div>
                <div className="min-w-0 flex-auto">
                  <p className="text-sm font-semibold leading-6 text-gray-900">
                    <Link href={`/padre/notas?estudiante=${estudiante.EstudianteID}`}>
                      <span className="absolute inset-0" />
                      {estudiante.Nombre} {estudiante.Apellido}
                    </Link>
                  </p>
                  <p className="mt-1 flex text-xs leading-5 text-gray-500">
                    {estudiante.grado?.Nombre} {estudiante.grado?.Paralelo && `- Paralelo ${estudiante.grado.Paralelo}`}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-x-4">
                <span className="text-sm text-indigo-600 hover:text-indigo-500 font-medium">Ver Notas &rarr;</span>
              </div>
            </li>
          ))}
          {padre.estudiantes.length === 0 && (
            <li className="px-4 py-8 text-center text-sm text-gray-500">
              No tiene estudiantes asociados a su perfil.
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}
