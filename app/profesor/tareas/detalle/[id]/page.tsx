import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function RevisarEntregasPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  const resolvedParams = await params
  const tareaId = parseInt(resolvedParams.id)

  const profesor = await prisma.profesores.findUnique({
    where: { UsuarioID: session?.userId as number }
  })

  if (!profesor) redirect('/login')

  const tarea = await prisma.tareas.findUnique({
    where: { TareaID: tareaId },
    include: {
      materia: true,
      entregas: {
        include: {
          estudiante: true
        }
      }
    }
  })

  if (!tarea) redirect('/profesor/tareas')

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-6">
        <Link href="/profesor/tareas" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Volver a Tareas
        </Link>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden mb-8">
        <div className="bg-[#004a8f] px-6 py-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">{tarea.materia.Nombre}</span>
            <span className="text-sm font-bold text-white bg-blue-800 px-3 py-1 rounded-full">{tarea.Porcentaje}% del Parcial</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-2">{tarea.Titulo}</h2>
        </div>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900">Entregas de Estudiantes</h3>
        </div>
        
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estudiante</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Entrega</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Respuesta</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Calificación</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tarea.entregas.map(entrega => (
              <tr key={entrega.EntregaID}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {entrega.estudiante.Nombre} {entrega.estudiante.Apellido}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {entrega.FechaEntrega.toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                  {entrega.TextoRespuesta}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <form action="/api/calificar" method="POST" className="flex items-center gap-2">
                    <input type="hidden" name="entregaId" value={entrega.EntregaID} />
                    <input type="hidden" name="tareaId" value={tarea.TareaID} />
                    <div className="relative shadow-sm rounded-md">
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <span className="text-gray-400 sm:text-xs font-semibold">/ 10</span>
                      </div>
                      <input 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        max="10" 
                        name="calificacion" 
                        defaultValue={entrega.Calificacion || ''}
                        required
                        className="w-24 rounded-md border-0 py-1.5 pr-8 pl-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 font-medium transition-all shadow-inner"
                      />
                    </div>
                    <button type="submit" className="text-xs bg-indigo-600 text-white font-semibold px-3 py-1.5 rounded-md hover:bg-indigo-500 shadow-sm transition-colors">
                      Guardar
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {tarea.entregas.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">No hay entregas registradas.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
