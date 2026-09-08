import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { redirect } from 'next/navigation'

export default async function PerfilAlumnoPage() {
  const session = await getSession()
  if (!session || session.roleId !== 3) redirect('/login')

  const estudiante = await prisma.estudiantes.findUnique({
    where: { UsuarioID: session.userId as number },
    include: { usuario: true, grado: true, padre: true }
  })

  if (!estudiante) redirect('/login')

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Mi Perfil Estudiantil</h2>
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
        <div className="bg-[#004a8f] px-6 py-8 sm:p-10">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-white text-[#004a8f] flex items-center justify-center font-bold text-4xl shadow-lg">
              {estudiante.Nombre.charAt(0)}{estudiante.Apellido.charAt(0)}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">{estudiante.Nombre} {estudiante.Apellido}</h3>
              <p className="text-blue-200 mt-1">
                Estudiante - {estudiante.grado ? `${estudiante.grado.Nombre} "${estudiante.grado.Paralelo}"` : 'Sin grado asignado'}
              </p>
            </div>
          </div>
        </div>
        <div className="px-6 py-6 sm:p-10 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Cédula de Identidad</h4>
              <p className="mt-1 text-base text-gray-900">{estudiante.usuario.Cedula}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Representante Legal</h4>
              <p className="mt-1 text-base text-gray-900">
                {estudiante.padre ? `${estudiante.padre.Nombre} ${estudiante.padre.Apellido}` : 'No registrado'}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Estado de Matrícula</h4>
              <span className="inline-flex mt-1 items-center rounded-md bg-green-50 px-2 py-1 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                Regular
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
