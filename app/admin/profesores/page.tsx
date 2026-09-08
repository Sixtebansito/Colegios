import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { redirect } from 'next/navigation'

export default async function AdminProfesoresPage() {
  const session = await getSession()
  if (!session || session.roleId !== 1) redirect('/login')

  const profesores = await prisma.profesores.findMany({
    include: {
      materias: { include: { grado: true } }
    }
  })

  return (
    <div>
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-6 text-gray-900">Profesores</h1>
          <p className="mt-2 text-sm text-gray-700">Listado de docentes del colegio.</p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button type="button" className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
            Agregar Profesor
          </button>
        </div>
      </div>
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Nombre</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Especialidad</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Materias Asignadas</th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Acciones</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {profesores.map((prof) => (
              <tr key={prof.ProfesorID}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                  {prof.Nombre} {prof.Apellido}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {prof.Especialidad || 'N/A'}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {prof.materias.map(m => m.Nombre).join(', ') || 'Ninguna'}
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <a href="#" className="text-indigo-600 hover:text-indigo-900">Editar</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
