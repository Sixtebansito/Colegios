import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'

export default async function AlumnoTareasPage({
  searchParams,
}: {
  searchParams: Promise<{ materia?: string, periodo?: string }>
}) {
  const session = await getSession()
  const params = await searchParams
  
  const estudiante = await prisma.estudiantes.findUnique({
    where: { UsuarioID: session?.userId as number },
    include: { matriculas: { where: { Estado: 'Activa' } } }
  })

  if (!estudiante || estudiante.matriculas.length === 0) redirect('/login')

  const periodos = await prisma.periodos.findMany({
    orderBy: { FechaInicio: 'asc' }
  })

  const selectedPeriodoId = params.periodo ? parseInt(params.periodo) : periodos[0]?.PeriodoID
  const selectedMateriaId = params.materia ? parseInt(params.materia) : null

  const materias = await prisma.materias.findMany({
    where: { GradoID: estudiante.matriculas[0].GradoID },
    include: { profesor: true }
  })

  if (!selectedMateriaId) {
    // Vista de Cursos (Materias)
    return (
      <div className="max-w-6xl mx-auto py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">Mis Cursos - Tareas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materias.map(materia => (
            <div key={materia.MateriaID} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 leading-tight">{materia.Nombre}</h3>
                  <p className="text-sm text-gray-500 mt-1">Prof. {materia.profesor?.Apellido}</p>
                </div>
              </div>
              <Link 
                href={`/alumno/tareas?materia=${materia.MateriaID}&periodo=${selectedPeriodoId}`} 
                className="mt-4 w-full block text-center bg-indigo-50 text-indigo-700 font-semibold py-2 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                Ver tareas
              </Link>
            </div>
          ))}
          {materias.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              No tienes materias asignadas.
            </div>
          )}
        </div>
      </div>
    )
  }

  // Vista de Tareas de una Materia
  const materiaInfo = materias.find(m => m.MateriaID === selectedMateriaId)

  const tareas = await prisma.tareas.findMany({
    where: {
      MateriaID: selectedMateriaId,
      PeriodoID: selectedPeriodoId,
    },
    include: {
      entregas: {
        where: { EstudianteID: estudiante.EstudianteID }
      }
    }
  })

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/alumno/tareas" className="text-indigo-600 font-medium hover:underline text-sm">&larr; Volver a Cursos</Link>
        <h2 className="text-2xl font-bold text-gray-900">Tareas de {materiaInfo?.Nombre}</h2>
      </div>

      <div className="bg-white p-4 shadow-sm ring-1 ring-gray-900/5 rounded-xl mb-6 flex gap-4 overflow-x-auto">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">Periodo</label>
          <div className="flex gap-2">
            {periodos.map(p => (
              <Link
                key={p.PeriodoID}
                href={`/alumno/tareas?materia=${selectedMateriaId}&periodo=${p.PeriodoID}`}
                className={`px-3 py-1 text-sm rounded-md whitespace-nowrap ${p.PeriodoID === selectedPeriodoId ? 'bg-indigo-100 text-indigo-700 font-bold' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors'}`}
              >
                {p.Nombre}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tareas.map(tarea => {
          const entrega = tarea.entregas[0]
          return (
            <div key={tarea.TareaID} className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 overflow-hidden flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-indigo-600">Valor: {tarea.Porcentaje}%</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{tarea.Titulo}</h3>
                <p className="mt-2 text-sm text-gray-500 line-clamp-3">{tarea.Descripcion}</p>
                <div className="mt-4 flex gap-2">
                  <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                    {tarea.Tipo}
                  </span>
                  {tarea.FechaVencimiento && (
                    <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                      Hasta: {tarea.FechaVencimiento.toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="border-t border-gray-100 bg-gray-50 px-6 py-4 flex justify-between items-center">
                {entrega ? (
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-green-600">Entregado</span>
                    {entrega.Calificacion !== null && <span className="text-xs font-bold text-gray-900">Nota: {entrega.Calificacion}/10</span>}
                  </div>
                ) : (
                  <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-900">Subir Entrega</button>
                )}
              </div>
            </div>
          )
        })}
        {tareas.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
            No hay tareas registradas en este periodo.
          </div>
        )}
      </div>
    </div>
  )
}
