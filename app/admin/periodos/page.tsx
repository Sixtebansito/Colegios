import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminPeriodosPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>
}) {
  const session = await getSession()
  if (!session || session.roleId !== 1) redirect('/login')

  const { estado } = await searchParams
  const mostrarTodos = estado === 'todos'

  const periodos = await prisma.periodos.findMany({
    where: mostrarTodos ? {} : { EstadoID: 2 },
    orderBy: { FechaInicio: 'asc' },
  })

  async function toggleEstadoPeriodo(formData: FormData) {
    'use server'
    const periodoId = parseInt(formData.get('periodoId') as string)
    const periodo = await prisma.periodos.findUnique({ where: { PeriodoID: periodoId } })
    if (!periodo) redirect('/admin/periodos')

    await prisma.periodos.update({
      where: { PeriodoID: periodoId },
      data: { EstadoID: periodo!.EstadoID === 2 ? 1 : 2 },
    })

    redirect('/admin/periodos')
  }

  const formatFecha = (d: Date | null) => (d ? new Date(d).toLocaleDateString() : '—')

  return (
    <div>
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-6 text-gray-900">Periodos</h1>
          <p className="mt-2 text-sm text-gray-700">
            Periodos lectivos del colegio.{' '}
            <Link href={mostrarTodos ? '/admin/periodos' : '/admin/periodos?estado=todos'} className="text-indigo-600 font-medium">
              {mostrarTodos ? 'Ver solo activos' : 'Ver todos (incluye inactivos)'}
            </Link>
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link href="/admin/periodos/nuevo" className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
            Agregar Periodo
          </Link>
        </div>
      </div>
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Nombre</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Año Lectivo</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Semestre</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Inicio</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Fin</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Estado</th>
              <th className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Acciones</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {periodos.map((periodo) => {
              const activo = periodo.EstadoID === 2
              return (
                <tr key={periodo.PeriodoID}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{periodo.Nombre}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{periodo.AnioLectivo || 'N/A'}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{periodo.Semestre || 'N/A'}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{formatFecha(periodo.FechaInicio)}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{formatFecha(periodo.FechaFin)}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                        activo ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-red-50 text-red-700 ring-red-600/10'
                      }`}
                    >
                      {activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div className="flex justify-end gap-3">
                      <Link href={`/admin/periodos/editar/${periodo.PeriodoID}`} className="text-indigo-600 hover:text-indigo-900">Editar</Link>
                      <form action={toggleEstadoPeriodo}>
                        <input type="hidden" name="periodoId" value={periodo.PeriodoID} />
                        <button type="submit" className="text-gray-500 hover:text-gray-800">
                          {activo ? 'Desactivar' : 'Activar'}
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              )
            })}
            {periodos.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-sm text-gray-500">No hay periodos registrados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
