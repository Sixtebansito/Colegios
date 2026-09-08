import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AlumnoNotasPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>
}) {
  const session = await getSession()
  const params = await searchParams
  
  const estudiante = await prisma.estudiantes.findUnique({
    where: { UsuarioID: session?.userId as number },
    include: {
      grado: true
    }
  })

  if (!estudiante) redirect('/login')

  const periodos = await prisma.periodos.findMany({
    orderBy: { FechaInicio: 'asc' }
  })

  const selectedPeriodoId = params.periodo ? parseInt(params.periodo) : periodos[0]?.PeriodoID

  const notas = await prisma.notas.findMany({
    where: {
      EstudianteID: estudiante.EstudianteID,
      PeriodoID: selectedPeriodoId
    },
    include: {
      materia: { include: { profesor: true } },
      recalifs: true
    }
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mis Notas</h1>

      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">{estudiante.Nombre} {estudiante.Apellido}</h2>
        <div className="flex gap-2">
          {periodos.map(p => (
            <Link
              key={p.PeriodoID}
              href={`/alumno/notas?periodo=${p.PeriodoID}`}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                p.PeriodoID === selectedPeriodoId 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {p.Nombre}
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Materia</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profesor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nota</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {notas.map(nota => (
              <tr key={nota.NotaID}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{nota.materia?.Nombre}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{nota.materia?.profesor?.Nombre} {nota.materia?.profesor?.Apellido}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">{nota.Nota.toString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <Link href={`/alumno/recalificaciones/nueva?notaId=${nota.NotaID}`} className="text-indigo-600 hover:text-indigo-900">
                    Solicitar Recalificación
                  </Link>
                </td>
              </tr>
            ))}
            {notas.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">No hay notas registradas.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
