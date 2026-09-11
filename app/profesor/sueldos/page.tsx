import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { redirect } from 'next/navigation'
import { DollarSign, AlertCircle, CheckCircle } from 'lucide-react'

export default async function ProfesorSueldosPage() {
  const session = await getSession()
  if (!session || session.roleId !== 2) redirect('/login')

  const profesor = await prisma.profesores.findUnique({
    where: { UsuarioID: session.userId as number },
    include: {
      sueldos: {
        orderBy: { Mes: 'desc' }
      }
    }
  })

  if (!profesor) redirect('/login')

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Mi Nómina y Sueldos</h2>
        <p className="mt-2 text-sm text-gray-500">Revisa el estado de tus pagos mensuales por parte de la institución.</p>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Mes de Nómina</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Monto Depositado</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Fecha de Pago</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {profesor.sueldos.map((sueldo) => (
              <tr key={sueldo.SueldoID}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  {sueldo.Mes}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-gray-900">
                  ${sueldo.Monto}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {sueldo.FechaPago ? sueldo.FechaPago.toLocaleDateString() : 'Por depositar'}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {sueldo.Estado === 'Pagado' ? (
                    <span className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-green-700 bg-green-50 ring-1 ring-inset ring-green-600/20">
                      <CheckCircle className="w-3 h-3" /> Pagado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-50 ring-1 ring-inset ring-yellow-600/20">
                      <AlertCircle className="w-3 h-3" /> Pendiente
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {profesor.sueldos.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-sm text-gray-500 bg-gray-50">
                  No tienes roles de pago registrados en el sistema.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
