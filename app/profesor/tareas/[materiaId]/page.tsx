import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, ArrowLeft } from 'lucide-react'

export default async function TareasPorMateriaPage({
  params,
  searchParams,
}: {
  params: Promise<{ materiaId: string }>
  searchParams: Promise<{ periodo?: string }>
}) {
  const session = await getSession()
  const { materiaId } = await params
  const search = await searchParams
  
  const materia = await prisma.materias.findUnique({
    where: { MateriaID: parseInt(materiaId) },
    include: { grado: true }
  })

  if (!materia) redirect('/profesor/tareas')

  const periodos = await prisma.periodos.findMany({
    orderBy: { FechaInicio: 'asc' }
  })

  const selectedPeriodoId = search.periodo ? parseInt(search.periodo) : periodos[0]?.PeriodoID

  const tareas = await prisma.tareas.findMany({
    where: {
      MateriaID: materia.MateriaID,
      PeriodoID: selectedPeriodoId,
    },
    include: {
      entregas: true
    },
    orderBy: { FechaVencimiento: 'desc' }
  })

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/profesor/tareas" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 ring-1 ring-gray-200">
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
                href={`/profesor/tareas/${materia.MateriaID}?periodo=${p.PeriodoID}`}
                className={`px-4 py-1.5 text-sm rounded-lg whitespace-nowrap transition-colors ${p.PeriodoID === selectedPeriodoId ? 'bg-indigo-600 text-white font-medium shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {p.Nombre}
              </Link>
            ))}
          </div>
        </div>
        <Link
          href={`/profesor/tareas/nueva?materiaId=${materia.MateriaID}`}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors whitespace-nowrap ml-4"
        >
          <Plus className="h-4 w-4" />
          Nueva Tarea
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tareas.map(tarea => (
          <div key={tarea.TareaID} className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 overflow-hidden flex flex-col">
            <div className="p-6 flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                  {tarea.Tipo}
                </span>
                <span className="text-sm font-bold text-gray-900">{tarea.Porcentaje}%</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mt-2">{tarea.Titulo}</h3>
              <p className="mt-2 text-sm text-gray-500 line-clamp-2">{tarea.Descripcion}</p>
            </div>
            <div className="border-t border-gray-100 bg-gray-50 px-6 py-4 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">{tarea.entregas.length} entregas</span>
              <Link href={`/profesor/tareas/${tarea.TareaID}`} className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors">Ver Detalles &rarr;</Link>
            </div>
          </div>
        ))}
        {tareas.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-1">No hay tareas</h3>
            <p className="text-gray-500">Aún no has creado tareas para este periodo.</p>
          </div>
        )}
      </div>
    </div>
  )
}
