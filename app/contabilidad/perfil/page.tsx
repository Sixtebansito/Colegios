import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { redirect } from 'next/navigation'

export default async function PerfilContabilidadPage() {
  const session = await getSession()
  if (!session || session.roleId !== 4) redirect('/login')

  const user = await prisma.usuarios.findUnique({
    where: { UsuarioID: session.userId as number },
    include: { rol: true }
  })

  if (!user) redirect('/login')

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Perfil Contabilidad</h2>
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
        <div className="bg-emerald-700 px-6 py-8 sm:p-10">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-emerald-900 text-white flex items-center justify-center font-bold text-4xl shadow-lg ring-2 ring-emerald-600">
              CO
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Usuario de Contabilidad</h3>
              <p className="text-emerald-200 mt-1">Gestión Financiera</p>
            </div>
          </div>
        </div>
        <div className="px-6 py-6 sm:p-10 space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Cédula / Usuario</h4>
            <p className="mt-1 text-base text-gray-900">{user.Cedula}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Rol</h4>
            <p className="mt-1 text-base text-gray-900">{user.rol.Nombre}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
