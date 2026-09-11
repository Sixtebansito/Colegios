import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Fragment } from 'react'
import { NOTA_MAX, NOTA_MIN } from '@/lib/recalificaciones'

const ESTADO_BADGE: Record<string, string> = {
  Pendiente: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  Aprobada: 'bg-green-50 text-green-700 ring-green-600/20',
  Rechazada: 'bg-red-50 text-red-700 ring-red-600/10',
}

const ERROR_MESSAGES: Record<string, string> = {
  FORBIDDEN: 'No tienes permiso para resolver esa solicitud.',
  ALREADY_RESOLVED: 'Esa solicitud ya fue resuelta anteriormente.',
  INVALID_DECISION: 'La decisión debe ser "Aprobar" o "Rechazar".',
  NOTA_INVALIDA: `Debes ingresar una nota válida entre ${NOTA_MIN} y ${NOTA_MAX} para aprobar.`,
  NO_ENCONTRADA: 'No se encontró la solicitud indicada.',
}

export default async function ProfesorRecalificacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ resolve?: string; error?: string }>
}) {
  const session = await getSession()
  if (!session || session.roleId !== 2) redirect('/login')

  const profesor = await prisma.profesores.findUnique({
    where: { UsuarioID: session.userId as number },
  })
  if (!profesor) redirect('/login')

  const { resolve: resolveStr, error } = await searchParams

  const solicitudes = await prisma.solicitudesRecalificacion.findMany({
    where: { nota: { ProfesorID: profesor.ProfesorID } },
    include: { nota: { include: { materia: true, periodo: true, estudiante: true } } },
    orderBy: { FechaSolicitud: 'desc' },
  })

  return (
    <div>
      <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight mb-8">
        Solicitudes de Recalificación
      </h2>

      {error && ERROR_MESSAGES[error] && (
        <div className="rounded-xl bg-red-50 p-4 border border-red-100 mb-6">
          <p className="text-sm font-medium text-red-800">{ERROR_MESSAGES[error]}</p>
        </div>
      )}

      {solicitudes.length === 0 ? (
        <div className="bg-white p-12 text-center shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
          <p className="text-gray-500">No tienes solicitudes de recalificación pendientes.</p>
        </div>
      ) : (
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Estudiante</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Materia / Periodo</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Motivo</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Nota Actual</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Estado</th>
                <th className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {solicitudes.map((s) => {
                const isPendiente = s.Estado === 'Pendiente'
                const isResolving = isPendiente && resolveStr === s.SolicitudID.toString()

                return (
                  <Fragment key={s.SolicitudID}>
                    <tr>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {s.nota?.estudiante?.Nombre} {s.nota?.estudiante?.Apellido}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {s.nota?.materia?.Nombre}
                        <p className="text-xs text-gray-400">{s.nota?.periodo?.Nombre}</p>
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500 max-w-xs truncate" title={s.Motivo}>
                        {s.Motivo}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-semibold">
                        {s.nota?.Nota.toString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                            ESTADO_BADGE[s.Estado ?? ''] ?? 'bg-gray-50 text-gray-700 ring-gray-600/20'
                          }`}
                        >
                          {s.Estado}
                        </span>
                        {!isPendiente && s.NotaNueva !== null && (
                          <p className="text-xs text-gray-500 mt-1">Nueva nota: {s.NotaNueva.toString()}</p>
                        )}
                        {!isPendiente && s.ComentarioProfesor && (
                          <p className="text-xs text-gray-500 mt-1 max-w-xs truncate" title={s.ComentarioProfesor}>
                            "{s.ComentarioProfesor}"
                          </p>
                        )}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        {isPendiente && !isResolving && (
                          <Link
                            href={`/profesor/recalificaciones?resolve=${s.SolicitudID}`}
                            className="text-indigo-600 hover:text-indigo-900 font-medium"
                          >
                            Resolver
                          </Link>
                        )}
                      </td>
                    </tr>

                    {isResolving && (
                      <tr>
                        <td colSpan={6} className="bg-gray-50 px-4 py-4 sm:px-6">
                          <form
                            action={`/api/recalificaciones/${s.SolicitudID}`}
                            method="POST"
                            className="flex flex-wrap items-center gap-3"
                          >
                            <select
                              name="decision"
                              required
                              className="rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                            >
                              <option value="Aprobada">Aprobar</option>
                              <option value="Rechazada">Rechazar</option>
                            </select>
                            <input
                              type="number"
                              step="0.01"
                              min={NOTA_MIN}
                              max={NOTA_MAX}
                              name="notaNueva"
                              placeholder="Nueva nota"
                              defaultValue={s.nota?.Nota.toString()}
                              className="w-28 rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                            />
                            <input
                              type="text"
                              name="comentario"
                              placeholder="Comentario (opcional)"
                              className="flex-1 min-w-[200px] rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                            />
                            <button
                              type="submit"
                              className="text-xs bg-indigo-50 text-indigo-600 font-semibold px-3 py-1.5 rounded hover:bg-indigo-100"
                            >
                              Guardar
                            </button>
                            <Link href="/profesor/recalificaciones" className="text-xs text-gray-500 hover:text-gray-700">
                              Cancelar
                            </Link>
                          </form>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
