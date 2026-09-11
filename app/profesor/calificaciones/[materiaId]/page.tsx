import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function CalificacionesPorMateriaPage({
  params,
  searchParams,
}: {
  params: Promise<{ materiaId: string }>
  searchParams: Promise<{ periodo?: string, edit?: string }>
}) {
  const session = await getSession()
  const { materiaId } = await params
  const search = await searchParams
  const editStr = search.edit
  
  const materia = await prisma.materias.findUnique({
    where: { MateriaID: parseInt(materiaId) },
    include: { grado: true }
  })

  if (!materia) redirect('/profesor/calificaciones')

  const periodos = await prisma.periodos.findMany({
    orderBy: { FechaInicio: 'asc' }
  })

  const selectedPeriodoId = search.periodo ? parseInt(search.periodo) : periodos[0]?.PeriodoID

  let estudiantesConNotas: any[] = []

  if (materia.GradoID) {
    // Estudiantes matriculados en el grado de esta materia
    const matriculados = await prisma.matriculas.findMany({
      where: { GradoID: materia.GradoID, Estado: 'Activa' },
      include: {
        estudiante: true
      }
    })
    
    const notas = await prisma.notas.findMany({
      where: {
        MateriaID: materia.MateriaID,
        PeriodoID: selectedPeriodoId,
      }
    })
    
    estudiantesConNotas = matriculados.map(m => {
      const nota = notas.find(n => n.EstudianteID === m.EstudianteID)
      return {
        ...m.estudiante,
        notaObj: nota
      }
    })
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/profesor/calificaciones" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 ring-1 ring-gray-200">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{materia.Nombre}</h2>
          <p className="text-sm text-gray-500">{materia.grado?.Nombre} {materia.grado?.Paralelo}</p>
        </div>
      </div>

      <div className="bg-white p-4 shadow-sm ring-1 ring-gray-900/5 rounded-xl mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4 overflow-x-auto">
          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Periodo:</span>
          <div className="flex gap-2">
            {periodos.map(p => (
              <Link
                key={p.PeriodoID}
                href={`/profesor/calificaciones/${materia.MateriaID}?periodo=${p.PeriodoID}`}
                className={`px-4 py-1.5 text-sm rounded-lg whitespace-nowrap transition-colors ${p.PeriodoID === selectedPeriodoId ? 'bg-indigo-600 text-white font-medium shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {p.Nombre}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Estudiante</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Nota Actual</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {estudiantesConNotas.map((estudiante) => {
              const isEditing = editStr === estudiante.EstudianteID.toString();
              return (
                <tr key={estudiante.EstudianteID}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {estudiante.Nombre} {estudiante.Apellido}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {isEditing ? (
                      <form action="/api/calificaciones/override" method="POST" className="flex items-center gap-2">
                        <input type="hidden" name="estudianteId" value={estudiante.EstudianteID} />
                        <input type="hidden" name="materiaId" value={materia.MateriaID} />
                        <input type="hidden" name="periodoId" value={selectedPeriodoId} />
                        <div className="relative shadow-sm rounded-md">
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <span className="text-gray-400 sm:text-xs font-semibold">/ 10</span>
                          </div>
                          <input 
                            type="number" step="0.01" min="0" max="10" name="nota" 
                            defaultValue={estudiante.notaObj?.Nota || ''} 
                            required
                            className="w-24 rounded-md border-0 py-1.5 pr-8 pl-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm shadow-inner transition-all font-medium"
                          />
                        </div>
                        <button type="submit" className="text-xs bg-indigo-600 text-white font-semibold px-3 py-1.5 rounded-md hover:bg-indigo-500 shadow-sm transition-colors">Guardar</button>
                        <Link href={`/profesor/calificaciones/${materia.MateriaID}?periodo=${selectedPeriodoId}`} className="text-xs font-medium text-gray-500 hover:text-gray-900 ml-2">Cancelar</Link>
                      </form>
                    ) : (
                      estudiante.notaObj ? (
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                          Number(estudiante.notaObj.Nota) >= 7 ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-red-50 text-red-700 ring-red-600/10'
                        }`}>
                          {estudiante.notaObj.Nota.toString()}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Sin calificar</span>
                      )
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {!isEditing && (
                      <Link
                        href={`/profesor/calificaciones/${materia.MateriaID}?periodo=${selectedPeriodoId}&edit=${estudiante.EstudianteID}`}
                        className="text-indigo-600 hover:text-indigo-900 font-medium"
                      >
                        {estudiante.notaObj ? 'Editar' : 'Calificar'}
                      </Link>
                    )}
                  </td>
                </tr>
              )
            })}
            {estudiantesConNotas.length === 0 && (
              <tr>
                <td colSpan={3} className="py-12 text-center text-sm text-gray-500 bg-gray-50">
                  No hay estudiantes matriculados en el grado de esta materia.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
