import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminProfesoresPage() {
  const session = await getSession()
  if (!session || session.roleId !== 1) redirect('/login')

  const profesores = await prisma.profesores.findMany({
    include: {
      materias: { include: { grado: true } },
      usuario: true,
    }
  })

  async function toggleEstadoProfesor(formData: FormData) {
    'use server'
    const usuarioId = parseInt(formData.get('usuarioId') as string)

    const usuario = await prisma.usuarios.findUnique({ where: { UsuarioID: usuarioId } })
    if (!usuario) redirect('/admin/profesores')

    await prisma.usuarios.update({
      where: { UsuarioID: usuarioId },
      data: { EstadoID: usuario!.EstadoID === 2 ? 1 : 2 },
    })

    redirect('/admin/profesores')
  }

  return (
    <div>
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-6 text-gray-900">Profesores</h1>
          <p className="mt-2 text-sm text-gray-700">Listado de docentes del colegio.</p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link href="/admin/profesores/nuevo" className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
            Agregar Profesor
          </Link>
        </div>
      </div>
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Nombre</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Especialidad</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Materias Asignadas</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Estado</th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Acciones</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {profesores.map((prof) => {
              const activo = prof.usuario?.EstadoID === 2
              return (
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
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    {prof.usuario ? (
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                          activo ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-red-50 text-red-700 ring-red-600/10'
                        }`}
                      >
                        {activo ? 'Activo' : 'Inactivo'}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Sin cuenta de acceso</span>
                    )}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div className="flex justify-end gap-3">
                      <Link href={`/admin/profesores/editar/${prof.ProfesorID}`} className="text-indigo-600 hover:text-indigo-900">Editar</Link>
                      {prof.usuario && (
                        <form action={toggleEstadoProfesor}>
                          <input type="hidden" name="usuarioId" value={prof.usuario.UsuarioID} />
                          <button type="submit" className="text-gray-500 hover:text-gray-800">
                            {activo ? 'Desactivar' : 'Activar'}
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
