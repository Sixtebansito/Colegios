import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function PadreNotasPage({
  searchParams,
}: {
  searchParams: Promise<{ estudiante?: string, periodo?: string }>
}) {
  const session = await getSession()
  const { estudiante: estudianteIdStr, periodo: periodoIdStr } = await searchParams
  
  const padre = await prisma.padres.findUnique({
    where: { UsuarioID: session?.userId as number },
    include: {
      estudiantes: {
        include: {
          grado: true
        }
      }
    }
  })

  if (!padre) redirect('/login')

  const periodos = await prisma.periodos.findMany({
    orderBy: { FechaInicio: 'desc' }
  })

  const selectedEstudianteId = estudianteIdStr ? parseInt(estudianteIdStr) : padre.estudiantes[0]?.EstudianteID
  const selectedPeriodoId = periodoIdStr ? parseInt(periodoIdStr) : periodos[0]?.PeriodoID

  let notasData: any[] = []

  if (selectedEstudianteId && selectedPeriodoId) {
    const notas = await prisma.notas.findMany({
      where: {
        EstudianteID: selectedEstudianteId,
        PeriodoID: selectedPeriodoId,
      },
      include: {
        materia: {
          include: {
            profesor: true
          }
        }
      }
    })
    notasData = notas
  }

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Reporte de Notas
          </h2>
        </div>
      </div>

      <div className="bg-white p-6 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl mb-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium leading-6 text-gray-900">Estudiante (Hijo)</label>
            <div className="mt-2 flex space-x-2 overflow-x-auto pb-2">
              {padre.estudiantes.map(e => (
                <Link
                  key={e.EstudianteID}
                  href={`/padre/notas?estudiante=${e.EstudianteID}&periodo=${selectedPeriodoId}`}
                  className={`px-4 py-2 text-sm rounded-md whitespace-nowrap transition-colors ${
                    e.EstudianteID === selectedEstudianteId
                      ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {e.Nombre} {e.Apellido}
                </Link>
              ))}
              {padre.estudiantes.length === 0 && <span className="text-sm text-gray-500">No tiene estudiantes registrados.</span>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium leading-6 text-gray-900">Periodo Académico</label>
            <div className="mt-2 flex space-x-2 overflow-x-auto pb-2">
              {periodos.map(p => (
                <Link
                  key={p.PeriodoID}
                  href={`/padre/notas?estudiante=${selectedEstudianteId}&periodo=${p.PeriodoID}`}
                  className={`px-4 py-2 text-sm rounded-md whitespace-nowrap transition-colors ${
                    p.PeriodoID === selectedPeriodoId
                      ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {p.Nombre}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedEstudianteId && selectedPeriodoId ? (
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Materia</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Profesor</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Calificación</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Observaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {notasData.map((nota) => (
                <tr key={nota.NotaID}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {nota.materia?.Nombre}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {nota.materia?.profesor?.Nombre} {nota.materia?.profesor?.Apellido}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                      Number(nota.Nota) >= 7 ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-red-50 text-red-700 ring-red-600/10'
                    }`}>
                      {nota.Nota.toString()} / 10
                    </span>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500 max-w-xs truncate" title={nota.Observaciones || ''}>
                    {nota.Observaciones || '-'}
                  </td>
                </tr>
              ))}
              {notasData.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-sm text-gray-500">
                    No se encontraron notas publicadas para este periodo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          Seleccione un estudiante y un periodo para visualizar las calificaciones.
        </div>
      )}
    </div>
  )
}
