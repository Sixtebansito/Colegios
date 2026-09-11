import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, Calendar, ClipboardList } from 'lucide-react'

export default async function RectorDashboard() {
  const session = await getSession()
  if (!session) redirect('/login')

  const rector = await prisma.rectores.findUnique({
    where: { UsuarioID: session.userId as number },
    include: { usuario: true }
  })

  if (!rector) redirect('/login')

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Panel de Rectorado</h1>
        <p className="mt-2 text-sm text-gray-500">Bienvenido/a {rector.usuario.Cedula}. Gestión global de la institución.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/horarios" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center">
          <Calendar className="h-12 w-12 text-indigo-600 mb-4" />
          <h3 className="text-lg font-bold text-gray-900">Gestión de Horarios</h3>
          <p className="text-sm text-gray-500 mt-2">Crear y asignar horarios por cursos</p>
        </Link>
        
        <Link href="/admin/cursos" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center">
          <Users className="h-12 w-12 text-teal-600 mb-4" />
          <h3 className="text-lg font-bold text-gray-900">Asignación de Cursos</h3>
          <p className="text-sm text-gray-500 mt-2">Administrar profesores y alumnos por curso</p>
        </Link>
        
        <Link href="/rector/reportes" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center">
          <ClipboardList className="h-12 w-12 text-amber-500 mb-4" />
          <h3 className="text-lg font-bold text-gray-900">Reportes de Inspectores</h3>
          <p className="text-sm text-gray-500 mt-2">Revisar reportes disciplinarios</p>
        </Link>
      </div>
    </div>
  )
}
