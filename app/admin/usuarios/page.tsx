import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { redirect } from 'next/navigation'
import { hashPassword } from '@/lib/passwords'

export default async function AdminUsuariosPage() {
  const session = await getSession()
  if (!session || session.roleId !== 1) redirect('/login')

  const usuarios = await prisma.usuarios.findMany({
    include: {
      rol: true,
      profesor: true,
      estudiante: true,
      inspector: true,
      rector: true,
    },
    orderBy: { Cedula: 'asc' },
  })

  async function toggleEstadoUsuario(formData: FormData) {
    'use server'
    const usuarioId = parseInt(formData.get('usuarioId') as string)

    const usuario = await prisma.usuarios.findUnique({ where: { UsuarioID: usuarioId } })
    if (!usuario) redirect('/admin/usuarios')

    await prisma.usuarios.update({
      where: { UsuarioID: usuarioId },
      data: { EstadoID: usuario!.EstadoID === 2 ? 1 : 2 },
    })

    redirect('/admin/usuarios')
  }

  async function resetPasswordUsuario(formData: FormData) {
    'use server'
    const usuarioId = parseInt(formData.get('usuarioId') as string)

    const usuario = await prisma.usuarios.findUnique({ where: { UsuarioID: usuarioId } })
    if (!usuario) redirect('/admin/usuarios')

    const nuevaPasswordHash = await hashPassword(usuario!.Cedula)

    await prisma.usuarios.update({
      where: { UsuarioID: usuarioId },
      data: { PasswordHash: nuevaPasswordHash },
    })

    redirect('/admin/usuarios')
  }

  const getEntidadVinculada = (u: (typeof usuarios)[number]) => {
    if (u.profesor) return `${u.profesor.Nombre} ${u.profesor.Apellido} (Profesor)`
    if (u.estudiante) return `${u.estudiante.Nombre} ${u.estudiante.Apellido} (Estudiante)`
    if (u.rector) return 'Rector'
    if (u.inspector) return `Inspector (${u.inspector.Nivel})`
    return '—'
  }

  return (
    <div>
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-6 text-gray-900">Usuarios</h1>
          <p className="mt-2 text-sm text-gray-700">Todas las cuentas del sistema, sin importar el rol.</p>
        </div>
      </div>
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Cédula</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Rol</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Entidad Vinculada</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Estado</th>
              <th className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Acciones</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {usuarios.map((u) => {
              const activo = u.EstadoID === 2
              return (
                <tr key={u.UsuarioID}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{u.Cedula}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{u.rol?.Nombre || 'Sin rol'}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{getEntidadVinculada(u)}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                        activo ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-red-50 text-red-700 ring-red-600/10'
                      }`}
                    >
                      {activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div className="flex justify-end gap-3">
                      <form action={toggleEstadoUsuario}>
                        <input type="hidden" name="usuarioId" value={u.UsuarioID} />
                        <button type="submit" className="text-indigo-600 hover:text-indigo-900">
                          {activo ? 'Desactivar' : 'Activar'}
                        </button>
                      </form>
                      <form action={resetPasswordUsuario}>
                        <input type="hidden" name="usuarioId" value={u.UsuarioID} />
                        <button
                          type="submit"
                          className="text-gray-500 hover:text-gray-800"
                          title="Restablece la contraseña a la cédula del usuario"
                        >
                          Resetear contraseña
                        </button>
                      </form>
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
