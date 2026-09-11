import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { redirect } from 'next/navigation'

export default async function AlumnoHorarioPage() {
  const session = await getSession()
  if (!session || session.roleId !== 3) redirect('/login')

  const estudiante = await prisma.estudiantes.findUnique({
    where: { UsuarioID: session.userId as number },
    include: { matriculas: true }
  })

  if (!estudiante || estudiante.matriculas.length === 0) {
    return <div className="p-8 text-gray-500">No estás matriculado en ningún curso actualmente.</div>
  }

  const gradoId = estudiante.matriculas[0].GradoID
  if (!gradoId) return <div className="p-8 text-gray-500">Tu matrícula no tiene un curso válido.</div>

  const horarios = await prisma.horarios.findMany({
    where: { GradoID: gradoId },
    include: { materia: { include: { profesor: true } } },
    orderBy: { HoraInicio: 'asc' }
  })

  const dias = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes']
  const horas = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00']

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Mi Horario de Clases</h2>
        <p className="mt-2 text-sm text-gray-500">Aquí puedes ver tu horario semanal de clases.</p>
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
                          <div key={clase.HorarioID} className="bg-indigo-50 border border-indigo-100 rounded-md p-3 mb-2 text-left shadow-sm">
                            <div className="font-bold text-indigo-800 text-sm">{clase.materia?.Nombre}</div>
                            <div className="text-xs text-gray-600 mt-1">{clase.HoraInicio} - {clase.HoraFin}</div>
                            <div className="text-xs font-medium text-gray-700 mt-2">Prof. {clase.materia?.profesor?.Apellido}</div>
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
