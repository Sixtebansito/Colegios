import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function TodosPagosPage() {
  const session = await getSession()
  if (!session || session.roleId !== 4) redirect('/login')

  const pagos = await prisma.pagosAlumnos.findMany({
    include: { estudiante: true },
    orderBy: { CreatedAt: 'desc' }
  })

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Todos los Pagos de Alumnos</h2>
          <p className="mt-1 text-sm text-gray-500">Historial completo de mensualidades de estudiantes.</p>
        </div>
        <Link href="/contabilidad" className="text-sm text-emerald-600 font-semibold">&larr; Volver al Dashboard</Link>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Estudiante</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Mes</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Monto</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Vencimiento</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {pagos.map((pago) => (
              <tr key={pago.PagoID}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  {pago.estudiante.Apellido}, {pago.estudiante.Nombre}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{pago.Mes}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-gray-900">${pago.Monto}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {pago.FechaVencimiento ? pago.FechaVencimiento.toLocaleDateString() : 'N/A'}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">
                  <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                    pago.Estado === 'Pagado' ? 'bg-green-50 text-green-700 ring-green-600/20' : 
                    pago.Estado === 'Atrasado' ? 'bg-red-50 text-red-700 ring-red-600/10' : 
                    'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
                  }`}>
                    {pago.Estado}
                  </span>
                </td>
              </tr>
            ))}
            {pagos.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-sm text-gray-500">No hay pagos registrados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
