import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { redirect } from 'next/navigation'

export default async function NuevaTareaPage({
  searchParams
}: {
  searchParams: Promise<{ materiaId?: string }>
}) {
  const session = await getSession()
  if (!session || session.roleId !== 2) redirect('/login')
  
  const params = await searchParams

  const profesor = await prisma.profesores.findUnique({
    where: { UsuarioID: session.userId as number },
    include: { materias: true }
  })

  if (!profesor) redirect('/login')

  // Obtener periodos (semestres/parciales)
  const periodos = await prisma.periodos.findMany({
    orderBy: { FechaInicio: 'asc' }
  })

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Crear Nueva Tarea
        </h2>
        <p className="mt-2 text-sm text-gray-500">Agrega una tarea, prueba o trabajo para tus estudiantes.</p>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-6 md:p-8">
        <form action="/api/tareas" method="POST" className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="materiaId" className="block text-sm font-medium leading-6 text-gray-900">Materia</label>
              <select id="materiaId" name="materiaId" defaultValue={params.materiaId || ''} required className="mt-2 block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
                {profesor.materias.map(m => (
                  <option key={m.MateriaID} value={m.MateriaID}>{m.Nombre}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="periodoId" className="block text-sm font-medium leading-6 text-gray-900">Periodo (Semestre/Parcial)</label>
              <select id="periodoId" name="periodoId" required className="mt-2 block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
                {periodos.map(p => (
                  <option key={p.PeriodoID} value={p.PeriodoID}>{p.Nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="titulo" className="block text-sm font-medium leading-6 text-gray-900">Título de la Tarea</label>
            <input type="text" id="titulo" name="titulo" required placeholder="Ej. Ejercicios de Ecuaciones" className="mt-2 block w-full rounded-md border-0 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3" />
          </div>

          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium leading-6 text-gray-900">Descripción / Instrucciones</label>
            <textarea id="descripcion" name="descripcion" rows={4} className="mt-2 block w-full rounded-md border-0 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="tipo" className="block text-sm font-medium leading-6 text-gray-900">Tipo de Actividad</label>
              <select id="tipo" name="tipo" required className="mt-2 block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
                <option value="Tarea en Clase">Tarea en Clase</option>
                <option value="Tarea a la Casa">Tarea a la Casa</option>
                <option value="Prueba">Prueba</option>
                <option value="Proyecto">Proyecto</option>
                <option value="Examen">Examen</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="porcentaje" className="block text-sm font-medium leading-6 text-gray-900">Ponderación (%)</label>
              <div className="relative mt-2 rounded-md shadow-sm">
                <input type="number" step="0.01" min="0" max="100" id="porcentaje" name="porcentaje" required placeholder="33.33" className="block w-full rounded-md border-0 py-2 pr-12 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3" />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-gray-500 sm:text-sm">%</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="fechaVencimiento" className="block text-sm font-medium leading-6 text-gray-900">Fecha Límite</label>
            <input type="date" id="fechaVencimiento" name="fechaVencimiento" className="mt-2 block w-full rounded-md border-0 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3" />
          </div>

          <div className="flex items-center justify-end gap-x-4 border-t border-gray-900/10 pt-6">
            <a href="/profesor/tareas" className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-700">Cancelar</a>
            <button type="submit" className="rounded-md bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
              Crear Tarea
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
