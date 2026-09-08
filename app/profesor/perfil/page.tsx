import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { redirect } from 'next/navigation'

export default async function PerfilProfesorPage() {
  const session = await getSession()
  if (!session || session.roleId !== 2) redirect('/login')

  const profesor = await prisma.profesores.findUnique({
    where: { UsuarioID: session.userId as number },
    include: { usuario: true }
  })

  if (!profesor) redirect('/login')

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Mi Cuenta</h2>
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
        <div className="bg-indigo-600 px-6 py-8 sm:p-10">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-white text-indigo-600 flex items-center justify-center font-bold text-4xl shadow-lg">
              {profesor.Nombre.charAt(0)}{profesor.Apellido.charAt(0)}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">{profesor.Nombre} {profesor.Apellido}</h3>
              <p className="text-indigo-200 mt-1">Profesor - Especialidad: {profesor.Especialidad}</p>
            </div>
          </div>
        </div>
        <div className="px-6 py-6 sm:p-10 space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Cédula de Identidad</h4>
            <p className="mt-1 text-base text-gray-900">{profesor.usuario.Cedula}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Correo Electrónico</h4>
            <p className="mt-1 text-base text-gray-900">{profesor.Email}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Estado de la cuenta</h4>
            <span className="inline-flex mt-1 items-center rounded-md bg-green-50 px-2 py-1 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
              Activo
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
