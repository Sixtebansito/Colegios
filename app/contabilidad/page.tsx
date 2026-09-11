import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { DollarSign, Wallet, Users, CheckCircle, Clock } from 'lucide-react'

export default async function ContabilidadDashboard() {
  const session = await getSession()
  if (!session || session.roleId !== 4) redirect('/login')

  const pagos = await prisma.pagosAlumnos.findMany({
    include: { estudiante: true },
    orderBy: { CreatedAt: 'desc' },
    take: 10
  })

  const sueldos = await prisma.sueldosProfesores.findMany({
    include: { profesor: true },
    orderBy: { Mes: 'desc' },
    take: 10
  })

  const gastos = await prisma.gastos.findMany({
    orderBy: { Fecha: 'desc' },
    take: 10
  })

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Dashboard Financiero</h2>
        <p className="mt-2 text-sm text-gray-500">Resumen de ingresos, egresos y nómina de la institución.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pagos de Alumnos */}
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6 lg:col-span-2">
          <div className="flex items-center justify-between border-b pb-4 mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              Últimos Pagos de Alumnos
            </h3>
            <button className="text-sm font-semibold text-emerald-600 hover:text-emerald-800">Ver todos &rarr;</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3">Estudiante</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3">Mes</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3">Monto</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pagos.map(pago => (
                  <tr key={pago.PagoID}>
                    <td className="py-3 whitespace-nowrap text-sm font-medium text-gray-900">{pago.estudiante.Apellido}, {pago.estudiante.Nombre}</td>
                    <td className="py-3 whitespace-nowrap text-sm text-gray-500">{pago.Mes}</td>
                    <td className="py-3 whitespace-nowrap text-sm font-semibold text-gray-900">${pago.Monto}</td>
                    <td className="py-3 whitespace-nowrap">
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
                    <td colSpan={4} className="py-4 text-center text-sm text-gray-500">No hay pagos registrados.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Nómina de Profesores */}
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6">
          <div className="flex items-center justify-between border-b pb-4 mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              Nómina Reciente
            </h3>
          </div>
          <ul className="divide-y divide-gray-100">
            {sueldos.map(sueldo => (
              <li key={sueldo.SueldoID} className="py-3 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-900">{sueldo.profesor.Nombre} {sueldo.profesor.Apellido}</p>
                  <p className="text-xs text-gray-500">{sueldo.Mes} • <span className="font-semibold">${sueldo.Monto}</span></p>
                </div>
                {sueldo.Estado === 'Pagado' ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <Clock className="w-5 h-5 text-yellow-500" />
                )}
              </li>
            ))}
            {sueldos.length === 0 && (
              <li className="py-4 text-center text-sm text-gray-500">No hay sueldos registrados.</li>
            )}
          </ul>
        </div>

        {/* Gastos Operativos */}
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6 lg:col-span-3">
          <div className="flex items-center justify-between border-b pb-4 mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-600" />
              Gastos Operativos
            </h3>
            <button className="text-sm font-semibold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-md hover:bg-emerald-100 transition-colors">
              + Registrar Gasto
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {gastos.map(gasto => (
              <div key={gasto.GastoID} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">{gasto.Categoria}</span>
                <p className="font-medium text-gray-900 mt-1">{gasto.Descripcion}</p>
                <p className="text-lg font-bold text-gray-900 mt-2">${gasto.Monto}</p>
                <p className="text-xs text-gray-400 mt-1">{gasto.Fecha.toLocaleDateString()}</p>
              </div>
            ))}
            {gastos.length === 0 && (
              <div className="col-span-full py-4 text-center text-sm text-gray-500">No hay gastos registrados.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
