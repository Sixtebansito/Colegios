import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function TareasPage({
  searchParams,
}: {
  searchParams: Promise<{ materia?: string, periodo?: string }>
}) {
  const session = await getSession()
  const params = await searchParams
  
  const profesor = await prisma.profesores.findUnique({
    where: { UsuarioID: session?.userId as number },
    include: { materias: true }
  })

  if (!profesor) redirect('/login')

  const periodos = await prisma.periodos.findMany({
    orderBy: { FechaInicio: 'asc' }
  })

  const selectedMateriaId = params.materia ? parseInt(params.materia) : profesor.materias[0]?.MateriaID
  const selectedPeriodoId = params.periodo ? parseInt(params.periodo) : periodos[0]?.PeriodoID

  let tareas: any[] = []

  if (selectedMateriaId && selectedPeriodoId) {
    tareas = await prisma.tareas.findMany({
      where: {
        MateriaID: selectedMateriaId,
        PeriodoID: selectedPeriodoId,
      },
      include: {
        entregas: true
      }
    })
  }

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Gestión de Tareas
          </h2>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Link
            href="/profesor/tareas/nueva"
            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nueva Tarea
          </Link>
        </div>
      </div>

      <div className="bg-white p-4 shadow-sm ring-1 ring-gray-900/5 rounded-xl mb-6 flex gap-4 overflow-x-auto">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">Materia</label>
          <div className="flex gap-2">
            {profesor.materias.map(m => (
              <Link
                key={m.MateriaID}
                href={`/profesor/tareas?materia=${m.MateriaID}&periodo=${selectedPeriodoId}`}
                className={`px-3 py-1 text-sm rounded-md whitespace-nowrap ${m.MateriaID === selectedMateriaId ? 'bg-indigo-100 text-indigo-700 font-bold' : 'bg-gray-100 text-gray-700'}`}
              >
                {m.Nombre}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">Periodo</label>
          <div className="flex gap-2">
            {periodos.map(p => (
              <Link
                key={p.PeriodoID}
                href={`/profesor/tareas?materia=${selectedMateriaId}&periodo=${p.PeriodoID}`}
                className={`px-3 py-1 text-sm rounded-md whitespace-nowrap ${p.PeriodoID === selectedPeriodoId ? 'bg-indigo-100 text-indigo-700 font-bold' : 'bg-gray-100 text-gray-700'}`}
              >
                {p.Nombre}
              </Link>
            ))}
          </div>
        </div>
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
              <h3 className="text-lg font-semibold text-gray-900">{tarea.Titulo}</h3>
              <p className="mt-2 text-sm text-gray-500 line-clamp-2">{tarea.Descripcion}</p>
            </div>
            <div className="border-t border-gray-100 bg-gray-50 px-6 py-4 flex justify-between items-center">
              <span className="text-sm text-gray-500">{tarea.entregas.length} entregas</span>
              <Link href={`/profesor/tareas/${tarea.TareaID}`} className="text-sm font-semibold text-indigo-600 hover:text-indigo-900">Ver Entregas &rarr;</Link>
            </div>
          </div>
        ))}
        {tareas.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
            No hay tareas creadas en esta materia y periodo.
          </div>
        )}
      </div>
    </div>
  )
}
