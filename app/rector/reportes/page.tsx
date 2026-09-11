import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, CheckCircle } from 'lucide-react'

export default async function RectorReportesPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const rector = await prisma.rectores.findUnique({
    where: { UsuarioID: session.userId as number }
  })

  if (!rector) redirect('/login')

  const reportes = await prisma.reportesDisciplinarios.findMany({
    include: {
      estudiante: { include: { grado: true } },
      inspector: { include: { usuario: true } }
    },
    orderBy: { Fecha: 'desc' }
  })

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/rector" className="text-indigo-600 font-medium hover:underline">&larr; Volver</Link>
        <h1 className="text-3xl font-bold text-gray-900">Reportes Disciplinarios</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estudiante</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motivo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inspector</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gravedad</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reportes.map(r => (
              <tr key={r.ReporteID} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.Fecha.toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{r.estudiante.Apellido} {r.estudiante.Nombre}</div>
                  <div className="text-xs text-gray-500">{r.estudiante.grado?.Nombre}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={r.Comentarios || r.Motivo}>{r.Motivo}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Inspector ID {r.inspector.InspectorID}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    r.Gravedad === 'Grave' ? 'bg-red-100 text-red-800' :
                    r.Gravedad === 'Moderada' ? 'bg-amber-100 text-amber-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {r.Gravedad}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {r.Estado === 'Pendiente' ? (
                    <form action={async () => {
                      'use server'
                      await prisma.reportesDisciplinarios.update({
                        where: { ReporteID: r.ReporteID },
                        data: { Estado: 'Revisado' }
                      })
                      const { revalidatePath } = require('next/cache')
                      revalidatePath('/rector/reportes')
                    }}>
                      <button type="submit" className="text-sm font-medium text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded border border-indigo-200">
                        Marcar Revisado
                      </button>
                    </form>
                  ) : (
                    <span className="flex items-center gap-1 text-sm font-medium text-green-600">
                      <CheckCircle className="w-4 h-4" /> Revisado
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {reportes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                  No hay reportes disciplinarios registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
