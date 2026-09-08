import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AlumnoTareasPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>
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

  // Tareas de la materias en las que está el estudiante
  const materias = await prisma.materias.findMany({
    where: { GradoID: estudiante.matriculas[0].GradoID }
  })

  const tareas = await prisma.tareas.findMany({
    where: {
      MateriaID: { in: materias.map(m => m.MateriaID) },
      PeriodoID: selectedPeriodoId,
    },
    include: {
      materia: true,
      entregas: {
        where: { EstudianteID: estudiante.EstudianteID }
      }
    }
  })

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Mis Tareas</h2>

      <div className="bg-white p-4 shadow-sm ring-1 ring-gray-900/5 rounded-xl mb-6 flex gap-4 overflow-x-auto">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">Periodo</label>
          <div className="flex gap-2">
            {periodos.map(p => (
              <Link
                key={p.PeriodoID}
                href={`/alumno/tareas?periodo=${p.PeriodoID}`}
                className={`px-3 py-1 text-sm rounded-md whitespace-nowrap ${p.PeriodoID === selectedPeriodoId ? 'bg-indigo-100 text-indigo-700 font-bold' : 'bg-gray-100 text-gray-700'}`}
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
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{tarea.materia.Nombre}</span>
                  <span className="text-sm font-bold text-gray-900">Valor: {tarea.Porcentaje}%</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{tarea.Titulo}</h3>
                <p className="mt-2 text-sm text-gray-500 line-clamp-2">{tarea.Descripcion}</p>
                <div className="mt-4 inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                  {tarea.Tipo}
                </div>
              </div>
              <div className="border-t border-gray-100 bg-gray-50 px-6 py-4 flex justify-between items-center">
                {entrega ? (
                  <span className="text-sm font-semibold text-green-600">
                    Entregado {entrega.Calificacion !== null && `- Nota: ${entrega.Calificacion}`}
                  </span>
                ) : (
                  <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-900">Subir Entrega</button>
                )}
              </div>
            </div>
          )
        })}
        {tareas.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
            No hay tareas pendientes.
          </div>
        )}
      </div>
    </div>
  )
}
