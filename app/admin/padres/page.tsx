import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminPadresPage() {
  const session = await getSession()
  if (!session || session.roleId !== 1) redirect('/login')

  const padres = await prisma.padres.findMany({
    include: { _count: { select: { estudiantes: true } } },
    orderBy: [{ Apellido: 'asc' }, { Nombre: 'asc' }],
  })

  return (
    <div>
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-6 text-gray-900">Padres</h1>
          <p className="mt-2 text-sm text-gray-700">Representantes/contactos de los estudiantes.</p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link href="/admin/padres/nuevo" className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
            Agregar Padre
          </Link>
        </div>
      </div>
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Nombre</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Teléfono</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Dirección</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Estudiantes</th>
              <th className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Acciones</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {padres.map((padre) => (
              <tr key={padre.PadreID}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                  {padre.Nombre} {padre.Apellido}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{padre.Email || 'N/A'}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{padre.Telefono || 'N/A'}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{padre.Direccion || 'N/A'}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{padre._count.estudiantes}</td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <Link href={`/admin/padres/editar/${padre.PadreID}`} className="text-indigo-600 hover:text-indigo-900">Editar</Link>
                </td>
              </tr>
            ))}
            {padres.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-gray-500">No hay padres registrados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
