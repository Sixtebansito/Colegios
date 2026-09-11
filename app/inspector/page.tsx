import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, Plus } from 'lucide-react'

export default async function InspectorDashboard() {
  const session = await getSession()
  if (!session) redirect('/login')

  const inspector = await prisma.inspectores.findUnique({
    where: { UsuarioID: session.userId as number },
    include: { usuario: true, reportes: { include: { estudiante: true }, orderBy: { Fecha: 'desc' }, take: 5 } }
  })

  if (!inspector) redirect('/login')

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Panel de Inspección</h1>
          <p className="mt-2 text-sm text-gray-500">Niveles asignados: <span className="font-semibold text-gray-900">{inspector.Nivel}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-amber-500" />
              Reportes Disciplinarios
            </h3>
            <Link href="/inspector/reportes/nuevo" className="bg-amber-500 text-white p-2 rounded-full hover:bg-amber-600 transition-colors shadow-sm" title="Nuevo Reporte">
              <Plus className="w-5 h-5" />
            </Link>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {inspector.reportes.length > 0 ? (
              <div className="space-y-4">
                {inspector.reportes.map(r => (
                  <div key={r.ReporteID} className="flex flex-col gap-1 p-4 rounded-xl bg-gray-50 border border-gray-100 relative">
                    <span className={`absolute top-4 right-4 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${
                      r.Gravedad === 'Grave' ? 'bg-red-100 text-red-700' :
                      r.Gravedad === 'Moderada' ? 'bg-amber-100 text-amber-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {r.Gravedad}
                    </span>
                    <h4 className="font-semibold text-gray-900 pr-16">{r.Motivo}</h4>
                    <p className="text-xs text-gray-500">Estudiante: {r.estudiante.Nombre} {r.estudiante.Apellido}</p>
                    <p className="text-xs text-gray-400 mt-2 border-t pt-2 flex justify-between">
                      <span>{new Date(r.Fecha).toLocaleDateString()}</span>
                      <span className="font-medium text-indigo-600">{r.Estado}</span>
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <AlertCircle className="w-12 h-12 mb-2 text-gray-200" />
                <p>No tienes reportes recientes.</p>
              </div>
            )}
          </div>
          <Link href="/inspector/reportes" className="mt-6 text-center text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors block border-t pt-4">
            Ver todos los reportes &rarr;
          </Link>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-sm p-8 text-white flex flex-col justify-center items-start relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"></path></svg>
          </div>
          <h3 className="text-2xl font-bold mb-4 z-10">Comunicaciones Centrales</h3>
          <p className="text-indigo-100 mb-8 z-10 max-w-sm text-sm">
            Manten contacto directo con el Rectorado y los profesores de los niveles que supervisas para dar seguimiento a los estudiantes.
          </p>
          <p className="text-xs text-indigo-200 bg-black/20 px-4 py-2 rounded-lg z-10 backdrop-blur-sm">
            💡 Utiliza el botón de "Mensajes" en la barra superior.
          </p>
        </div>
      </div>
    </div>
  )
}
