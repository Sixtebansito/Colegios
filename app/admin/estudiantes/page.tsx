import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { redirect } from 'next/navigation'

export default async function AdminEstudiantesPage() {
  const session = await getSession()
  if (!session || session.roleId !== 1) redirect('/login')

  const estudiantes = await prisma.estudiantes.findMany({
    include: {
      padre: true,
      matriculas: {
        where: { Estado: 'Activa' },
        include: { grado: true }
      }
    }
  })

  return (
    <div>
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-6 text-gray-900">Estudiantes</h1>
          <p className="mt-2 text-sm text-gray-700">Listado de todos los estudiantes registrados en el colegio.</p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button type="button" className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
            Agregar Estudiante
          </button>
        </div>
      </div>
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Nombre</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Representante</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Grado Actual</th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Acciones</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {estudiantes.map((estudiante) => (
              <tr key={estudiante.EstudianteID}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                  {estudiante.Nombre} {estudiante.Apellido}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {estudiante.padre ? `${estudiante.padre.Nombre} ${estudiante.padre.Apellido}` : 'N/A'}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {estudiante.matriculas.length > 0 ? estudiante.matriculas[0].grado?.Nombre : 'No matriculado'}
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
