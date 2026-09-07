import prisma from '@/lib/db'

export default async function AdminDashboard() {
  const [totalUsuarios, totalEstudiantes, totalProfesores] = await Promise.all([
    prisma.usuarios.count(),
    prisma.estudiantes.count(),
    prisma.profesores.count(),
  ])

  return (
    <div>
      <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight mb-8">
        Panel de Administración
      </h1>

      <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 ring-1 ring-gray-900/5">
          <dt className="truncate text-sm font-medium text-gray-500">Usuarios Registrados</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{totalUsuarios}</dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 ring-1 ring-gray-900/5">
          <dt className="truncate text-sm font-medium text-gray-500">Estudiantes</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{totalEstudiantes}</dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 ring-1 ring-gray-900/5">
          <dt className="truncate text-sm font-medium text-gray-500">Profesores</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{totalProfesores}</dd>
        </div>
      </dl>
    </div>
  )
}
