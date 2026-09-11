import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'

const ESTADO_BADGE: Record<string, string> = {
  Pendiente: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  Aprobada: 'bg-green-50 text-green-700 ring-green-600/20',
  Rechazada: 'bg-red-50 text-red-700 ring-red-600/10',
}

export default async function AlumnoRecalificacionesPage() {
  const session = await getSession()
  if (!session || session.roleId !== 3) redirect('/login')

  const estudiante = await prisma.estudiantes.findUnique({
    where: { UsuarioID: session.userId as number },
  })
  if (!estudiante) redirect('/login')

  const solicitudes = await prisma.solicitudesRecalificacion.findMany({
    where: { nota: { EstudianteID: estudiante.EstudianteID } },
    include: { nota: { include: { materia: true, periodo: true } } },
    orderBy: { FechaSolicitud: 'desc' },
  })

  return (
    <div>
      <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight mb-8">
        Mis Solicitudes de Recalificación
      </h2>

      {solicitudes.length === 0 ? (
        <div className="bg-white p-12 text-center shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
          <p className="text-gray-500">
            No has solicitado ninguna recalificación. Puedes hacerlo desde la sección "Mis Notas".
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Materia</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Motivo</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Nota Anterior</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Nota Nueva</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Estado</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Comentario Profesor</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Fecha Solicitud</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {solicitudes.map((s) => (
                <tr key={s.SolicitudID}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {s.nota?.materia?.Nombre}
                    <p className="text-xs text-gray-500 font-normal">{s.nota?.periodo?.Nombre}</p>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500 max-w-xs truncate" title={s.Motivo}>
                    {s.Motivo}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {s.NotaAnterior?.toString() ?? '—'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-gray-900">
                    {s.NotaNueva?.toString() ?? '—'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                        ESTADO_BADGE[s.Estado ?? ''] ?? 'bg-gray-50 text-gray-700 ring-gray-600/20'
                      }`}
                    >
                      {s.Estado}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500 max-w-xs truncate" title={s.ComentarioProfesor ?? undefined}>
                    {s.ComentarioProfesor ?? '—'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {s.FechaSolicitud ? format(new Date(s.FechaSolicitud), 'dd/MM/yyyy') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
