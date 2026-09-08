import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function ProfesorNotasPage({
  searchParams,
}: {
  searchParams: Promise<{ materia?: string, periodo?: string }>
}) {
  const session = await getSession()
  const { materia: materiaIdStr, periodo: periodoIdStr } = await searchParams
  
  const profesor = await prisma.profesores.findUnique({
    where: { UsuarioID: session?.userId as number },
    include: {
      materias: true
    }
  })

  if (!profesor) redirect('/login')

  const periodos = await prisma.periodos.findMany({
    where: { EstadoID: 2 }, // Activos
    orderBy: { FechaInicio: 'asc' }
  })

  const selectedMateriaId = materiaIdStr ? parseInt(materiaIdStr) : profesor.materias[0]?.MateriaID
  const selectedPeriodoId = periodoIdStr ? parseInt(periodoIdStr) : periodos[0]?.PeriodoID
  const { edit: editStr } = await searchParams

  let estudiantesConNotas: any[] = []

  if (selectedMateriaId && selectedPeriodoId) {
    const materiaInfo = await prisma.materias.findUnique({
      where: { MateriaID: selectedMateriaId },
    })
    
    if (materiaInfo?.GradoID) {
      // Estudiantes matriculados en el grado de esta materia
      const matriculados = await prisma.matriculas.findMany({
        where: { GradoID: materiaInfo.GradoID, Estado: 'Activa' },
        include: {
          estudiante: true
        }
      })
      
      const notas = await prisma.notas.findMany({
        where: {
          MateriaID: selectedMateriaId,
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
  }

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Gestión de Notas
          </h2>
        </div>
      </div>

      <div className="bg-white p-6 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl mb-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium leading-6 text-gray-900">Materia</label>
            <div className="mt-2 flex space-x-2 overflow-x-auto pb-2">
              {profesor.materias.map(m => (
                <Link
                  key={m.MateriaID}
                  href={`/profesor/calificaciones?materia=${m.MateriaID}&periodo=${selectedPeriodoId}`}
                  className={`px-4 py-2 text-sm rounded-md whitespace-nowrap transition-colors ${
                    m.MateriaID === selectedMateriaId
                      ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {m.Nombre}
                </Link>
              ))}
              {profesor.materias.length === 0 && <span className="text-sm text-gray-500">No tiene materias asignadas.</span>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium leading-6 text-gray-900">Periodo</label>
            <div className="mt-2 flex space-x-2 overflow-x-auto pb-2">
              {periodos.map(p => (
                <Link
                  key={p.PeriodoID}
                  href={`/profesor/calificaciones?materia=${selectedMateriaId}&periodo=${p.PeriodoID}`}
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

      {selectedMateriaId && selectedPeriodoId ? (
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
                          <input type="hidden" name="materiaId" value={selectedMateriaId} />
                          <input type="hidden" name="periodoId" value={selectedPeriodoId} />
                          <input 
                            type="number" step="0.01" min="0" max="10" name="nota" 
                            defaultValue={estudiante.notaObj?.Nota || ''} 
                            required
                            className="w-20 rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                          />
                          <button type="submit" className="text-xs bg-indigo-50 text-indigo-600 font-semibold px-2 py-1 rounded hover:bg-indigo-100">Guardar</button>
                          <Link href={`/profesor/calificaciones?materia=${selectedMateriaId}&periodo=${selectedPeriodoId}`} className="text-xs text-gray-500 hover:text-gray-700 ml-1">Cancelar</Link>
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
                          href={`/profesor/calificaciones?materia=${selectedMateriaId}&periodo=${selectedPeriodoId}&edit=${estudiante.EstudianteID}`}
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
                  <td colSpan={3} className="py-8 text-center text-sm text-gray-500">
                    No hay estudiantes matriculados en el grado de esta materia.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          Seleccione una materia y un periodo para ver a los estudiantes.
        </div>
      )}
    </div>
  )
}
