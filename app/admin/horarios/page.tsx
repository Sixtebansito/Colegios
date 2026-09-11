import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { redirect } from 'next/navigation'

export default async function AdminHorariosPage({
  searchParams
}: {
  searchParams: Promise<{ grado?: string }>
}) {
  const session = await getSession()
  if (!session || (session.roleId !== 1)) redirect('/login')

  const { grado: gradoIdStr } = await searchParams
  const grados = await prisma.grados.findMany({ orderBy: { Nombre: 'asc' } })
  
  const selectedGradoId = gradoIdStr ? parseInt(gradoIdStr) : grados[0]?.GradoID

  let horarios: any[] = []
  let materias: any[] = []

  if (selectedGradoId) {
    horarios = await prisma.horarios.findMany({
      where: { GradoID: selectedGradoId },
      include: { materia: { include: { profesor: true } } },
      orderBy: { HoraInicio: 'asc' }
    })
    materias = await prisma.materias.findMany({
      where: { GradoID: selectedGradoId }
    })
  }

  const dias = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes']
  const horas = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00']

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Gestión de Horarios</h2>
        <p className="mt-2 text-sm text-gray-500">Configura el horario de clases por curso.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm ring-1 ring-gray-900/5 mb-8">
        <form method="GET" className="flex items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Curso (Grado)</label>
            <select 
              name="grado" 
              defaultValue={selectedGradoId || ''} 
              className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm ring-1 ring-inset ring-gray-300"
            >
              {grados.map(g => (
                <option key={g.GradoID} value={g.GradoID}>{g.Nombre} {g.Paralelo}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="mb-1 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
            Cargar
          </button>
        </form>
      </div>

      {selectedGradoId && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm ring-1 ring-gray-900/5">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Añadir Clase</h3>
              <form action="/api/horarios" method="POST" className="space-y-4">
                <input type="hidden" name="gradoId" value={selectedGradoId} />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Día</label>
                  <select name="dia" required className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm ring-1 ring-inset ring-gray-300">
                    {dias.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Materia</label>
                  <select name="materiaId" required className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm ring-1 ring-inset ring-gray-300">
                    {materias.map(m => <option key={m.MateriaID} value={m.MateriaID}>{m.Nombre}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hora Inicio</label>
                    <input type="time" name="horaInicio" required className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm ring-1 ring-inset ring-gray-300" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hora Fin</label>
                    <input type="time" name="horaFin" required className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm ring-1 ring-inset ring-gray-300" />
                  </div>
                </div>

                <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Añadir al Horario
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-300 text-center">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3.5 pl-4 pr-3 text-sm font-semibold text-gray-900">Hora</th>
                      {dias.map(dia => (
                        <th key={dia} className="px-3 py-3.5 text-sm font-semibold text-gray-900">{dia}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {horas.map(hora => (
                      <tr key={hora}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-500 bg-gray-50">
                          {hora}
                        </td>
                        {dias.map(dia => {
                          const clasesEnEsteBloque = horarios.filter(h => h.DiaSemana === dia && h.HoraInicio <= hora && h.HoraFin > hora);
                          return (
                            <td key={`${dia}-${hora}`} className="px-3 py-4 text-sm text-gray-500 relative min-w-[120px] align-top border-l border-gray-100">
                              {clasesEnEsteBloque.map(clase => (
                                <div key={clase.HorarioID} className="bg-indigo-50 border border-indigo-100 rounded-md p-2 mb-2 text-left">
                                  <div className="font-semibold text-indigo-700 text-xs">{clase.materia?.Nombre}</div>
                                  <div className="text-[10px] text-gray-500">{clase.HoraInicio} - {clase.HoraFin}</div>
                                  <div className="text-[10px] font-medium text-gray-700 truncate">{clase.materia?.profesor?.Nombre} {clase.materia?.profesor?.Apellido}</div>
                                  <form action={`/api/horarios/${clase.HorarioID}/delete`} method="POST" className="mt-1">
                                    <input type="hidden" name="gradoId" value={selectedGradoId} />
                                    <button type="submit" className="text-[10px] text-red-500 hover:text-red-700 font-medium">Eliminar</button>
                                  </form>
                                </div>
                              ))}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
