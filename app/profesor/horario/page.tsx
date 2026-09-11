import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { redirect } from 'next/navigation'

export default async function ProfesorHorarioPage() {
  const session = await getSession()
  if (!session || session.roleId !== 2) redirect('/login')

  const profesor = await prisma.profesores.findUnique({
    where: { UsuarioID: session.userId as number },
    include: { materias: true }
  })

  if (!profesor) redirect('/login')

  const materiaIds = profesor.materias.map(m => m.MateriaID)

  const horarios = await prisma.horarios.findMany({
    where: { MateriaID: { in: materiaIds } },
    include: { materia: true, grado: true },
    orderBy: { HoraInicio: 'asc' }
  })

  const dias = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes']
  const horas = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00']

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Mi Horario de Clases</h2>
        <p className="mt-2 text-sm text-gray-500">Consulta los bloques de tiempo que tienes asignados.</p>
      </div>

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
                          <div key={clase.HorarioID} className="bg-teal-50 border border-teal-100 rounded-md p-3 mb-2 text-left shadow-sm">
                            <div className="font-bold text-teal-800 text-sm">{clase.materia?.Nombre}</div>
                            <div className="text-xs text-gray-600 mt-1">{clase.HoraInicio} - {clase.HoraFin}</div>
                            <div className="text-xs font-medium text-gray-800 mt-2 bg-teal-100 inline-block px-2 py-0.5 rounded">{clase.grado?.Nombre} {clase.grado?.Paralelo}</div>
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
  )
}
