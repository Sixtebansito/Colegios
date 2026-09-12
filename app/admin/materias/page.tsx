import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminMateriasPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>
}) {
  const session = await getSession()
  if (!session || session.roleId !== 1) redirect('/login')

  const { estado } = await searchParams
  const mostrarTodos = estado === 'todos'

  const materias = await prisma.materias.findMany({
    where: mostrarTodos ? {} : { EstadoID: 2 },
    include: { profesor: true, grado: true },
    orderBy: { Nombre: 'asc' },
  })

  async function toggleEstadoMateria(formData: FormData) {
    'use server'
    const materiaId = parseInt(formData.get('materiaId') as string)
    const materia = await prisma.materias.findUnique({ where: { MateriaID: materiaId } })
    if (!materia) redirect('/admin/materias')

    await prisma.materias.update({
      where: { MateriaID: materiaId },
      data: { EstadoID: materia!.EstadoID === 2 ? 1 : 2 },
    })

    redirect('/admin/materias')
  }

  return (
    <div>
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-6 text-gray-900">Materias</h1>
          <p className="mt-2 text-sm text-gray-700">
            Asignaturas del colegio.{' '}
            <Link href={mostrarTodos ? '/admin/materias' : '/admin/materias?estado=todos'} className="text-indigo-600 font-medium">
              {mostrarTodos ? 'Ver solo activas' : 'Ver todas (incluye inactivas)'}
            </Link>
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link href="/admin/materias/nuevo" className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
            Agregar Materia
          </Link>
        </div>
      </div>
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Nombre</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Profesor</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Grado</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Estado</th>
              <th className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Acciones</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {materias.map((materia) => {
              const activa = materia.EstadoID === 2
              return (
                <tr key={materia.MateriaID}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{materia.Nombre}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {materia.profesor ? `${materia.profesor.Nombre} ${materia.profesor.Apellido}` : 'Sin asignar'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {materia.grado ? `${materia.grado.Nombre} ${materia.grado.Paralelo || ''}` : 'Sin asignar'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                        activa ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-red-50 text-red-700 ring-red-600/10'
                      }`}
                    >
                      {activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div className="flex justify-end gap-3">
                      <Link href={`/admin/materias/editar/${materia.MateriaID}`} className="text-indigo-600 hover:text-indigo-900">Editar</Link>
                      <form action={toggleEstadoMateria}>
                        <input type="hidden" name="materiaId" value={materia.MateriaID} />
                        <button type="submit" className="text-gray-500 hover:text-gray-800">
                          {activa ? 'Desactivar' : 'Activar'}
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              )
            })}
            {materias.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-sm text-gray-500">No hay materias registradas.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
