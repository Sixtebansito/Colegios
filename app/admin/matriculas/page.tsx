import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { recalcularGradoEstudiante } from '@/lib/matriculas'

export default async function AdminMatriculasPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>
}) {
  const session = await getSession()
  if (!session || session.roleId !== 1) redirect('/login')

  const { estado } = await searchParams
  const mostrarTodos = estado === 'todos'

  const matriculas = await prisma.matriculas.findMany({
    where: mostrarTodos ? {} : { Estado: 'Activa' },
    include: { estudiante: true, grado: true },
    orderBy: { FechaMatricula: 'desc' },
  })

  async function retirarMatricula(formData: FormData) {
    'use server'
    const matriculaId = parseInt(formData.get('matriculaId') as string)

    const matricula = await prisma.matriculas.findUnique({ where: { MatriculaID: matriculaId } })
    if (!matricula || !matricula.EstudianteID) redirect('/admin/matriculas')

    await prisma.$transaction(async (tx) => {
      await tx.matriculas.update({
        where: { MatriculaID: matriculaId },
        data: { Estado: 'Retirada' },
      })
      await recalcularGradoEstudiante(tx, matricula!.EstudianteID as number)
    })

    redirect('/admin/matriculas')
  }

  return (
    <div>
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-6 text-gray-900">Matrículas</h1>
          <p className="mt-2 text-sm text-gray-700">
            Historial de matrículas por estudiante. Para asignar rápido por grado, usá{' '}
            <Link href="/admin/matriculacion" className="text-indigo-600 font-medium">Matriculación</Link>.{' '}
            <Link href={mostrarTodos ? '/admin/matriculas' : '/admin/matriculas?estado=todos'} className="text-indigo-600 font-medium">
              {mostrarTodos ? 'Ver solo activas' : 'Ver todas (incluye retiradas)'}
            </Link>
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link href="/admin/matriculas/nuevo" className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
            Nueva Matrícula
          </Link>
        </div>
      </div>
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Estudiante</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Grado</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Año Lectivo</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Fecha</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Estado</th>
              <th className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Acciones</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {matriculas.map((m) => {
              const activa = m.Estado === 'Activa'
              return (
                <tr key={m.MatriculaID}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                    {m.estudiante ? `${m.estudiante.Nombre} ${m.estudiante.Apellido}` : 'N/A'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {m.grado ? `${m.grado.Nombre} ${m.grado.Paralelo || ''}` : 'N/A'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{m.AnioLectivo || 'N/A'}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {m.FechaMatricula ? new Date(m.FechaMatricula).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                        activa ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-gray-100 text-gray-600 ring-gray-500/10'
                      }`}
                    >
                      {m.Estado}
                    </span>
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div className="flex justify-end gap-3">
                      <Link href={`/admin/matriculas/editar/${m.MatriculaID}`} className="text-indigo-600 hover:text-indigo-900">Editar</Link>
                      {activa && (
                        <form action={retirarMatricula}>
                          <input type="hidden" name="matriculaId" value={m.MatriculaID} />
                          <button type="submit" className="text-gray-500 hover:text-gray-800">Retirar</button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
            {matriculas.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-gray-500">No hay matrículas registradas.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
