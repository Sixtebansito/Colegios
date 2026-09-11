import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Award } from 'lucide-react'

export default async function AlumnoNotasPage({
  searchParams,
}: {
  searchParams: Promise<{ materia?: string, periodo?: string }>
}) {
  const session = await getSession()
  const params = await searchParams
  
  const estudiante = await prisma.estudiantes.findUnique({
    where: { UsuarioID: session?.userId as number },
    include: { matriculas: true }
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
    // Vista de Cursos (Materias) para ver Notas
    return (
      <div className="max-w-6xl mx-auto py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">Mis Cursos - Notas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materias.map(materia => (
            <div key={materia.MateriaID} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-teal-50 text-teal-600 rounded-lg">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 leading-tight">{materia.Nombre}</h3>
                  <p className="text-sm text-gray-500 mt-1">Prof. {materia.profesor?.Apellido}</p>
                </div>
              </div>
              <Link 
                href={`/alumno/notas?materia=${materia.MateriaID}&periodo=${selectedPeriodoId}`} 
                className="mt-4 w-full block text-center bg-teal-50 text-teal-700 font-semibold py-2 rounded-lg hover:bg-teal-100 transition-colors"
              >
                Ver notas
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

  // Vista de Notas Detalladas de una Materia
  const materiaInfo = materias.find(m => m.MateriaID === selectedMateriaId)

  // Nota general (Libreta)
  const notaGeneral = await prisma.notas.findFirst({
    where: {
      EstudianteID: estudiante.EstudianteID,
      MateriaID: selectedMateriaId,
      PeriodoID: selectedPeriodoId
    },
    include: { recalifs: true }
  })

  // Tareas calificadas
  const entregas = await prisma.entregas.findMany({
    where: {
      EstudianteID: estudiante.EstudianteID,
      tarea: {
        MateriaID: selectedMateriaId,
        PeriodoID: selectedPeriodoId
      }
    },
    include: { tarea: true },
    orderBy: { FechaEntrega: 'desc' }
  })

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/alumno/notas" className="text-teal-600 font-medium hover:underline text-sm">&larr; Volver a Cursos</Link>
        <h2 className="text-2xl font-bold text-gray-900">Libreta de {materiaInfo?.Nombre}</h2>
      </div>

      <div className="bg-white p-4 shadow-sm ring-1 ring-gray-900/5 rounded-xl mb-8 flex gap-4 overflow-x-auto">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">Periodo Lectivo</label>
          <div className="flex gap-2">
            {periodos.map(p => (
              <Link
                key={p.PeriodoID}
                href={`/alumno/notas?materia=${selectedMateriaId}&periodo=${p.PeriodoID}`}
                className={`px-4 py-1.5 text-sm rounded-md whitespace-nowrap transition-colors ${
                  p.PeriodoID === selectedPeriodoId 
                    ? 'bg-teal-600 text-white font-medium shadow-sm' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {p.Nombre}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Promedio General / Nota de Libreta */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl shadow-sm p-6 text-white text-center">
            <Award className="w-12 h-12 mx-auto text-teal-100 mb-4" />
            <h3 className="text-lg font-medium text-teal-50 mb-1">Nota Promedio del Periodo</h3>
            <div className="text-5xl font-extrabold tracking-tight mb-6">
              {notaGeneral?.Nota != null ? notaGeneral.Nota.toString() : '--'}
            </div>

            {notaGeneral && (
              <div className="border-t border-teal-400/30 pt-4">
                {notaGeneral.recalifs.some(r => r.Estado === 'Pendiente') ? (
                  <span className="inline-block bg-amber-500/20 text-amber-100 px-4 py-2 rounded-full text-sm font-medium">
                    Recalificación en Revisión
                  </span>
                ) : (
                  <Link 
                    href={`/alumno/recalificaciones/nueva?notaId=${notaGeneral.NotaID}`} 
                    className="inline-block bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-sm font-medium transition-colors"
                  >
                    Solicitar Recalificación
                  </Link>
                )}
              </div>
            )}
            {!notaGeneral && (
              <p className="text-sm text-teal-100 bg-black/10 rounded-lg p-3">El profesor aún no ha registrado la nota final de este periodo.</p>
            )}
          </div>
        </div>

        {/* Desglose de Tareas */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">Desglose de Calificaciones</h3>
              <span className="text-xs text-gray-500">{entregas.length} actividades</span>
            </div>
            
            <ul className="divide-y divide-gray-100">
              {entregas.map(entrega => (
                <li key={entrega.EntregaID} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900">{entrega.tarea.Titulo}</span>
                    <span className="text-xs text-gray-500 mt-1">{entrega.tarea.Tipo} • {entrega.tarea.Porcentaje}%</span>
                  </div>
                  <div className="flex flex-col items-end">
                    {entrega.Calificacion != null ? (
                      <span className="text-lg font-bold text-teal-700">{entrega.Calificacion.toString()} <span className="text-xs text-gray-400 font-normal">/10</span></span>
                    ) : (
                      <span className="text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded font-medium">Sin calificar</span>
                    )}
                  </div>
                </li>
              ))}
              {entregas.length === 0 && (
                <li className="px-6 py-8 text-center text-sm text-gray-500">
                  No hay entregas registradas.
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
