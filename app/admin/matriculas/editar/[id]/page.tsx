import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { recalcularGradoEstudiante } from '@/lib/matriculas'

export default async function EditarMatriculaPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session || session.roleId !== 1) redirect('/login')

  const { id } = await params
  const matriculaId = parseInt(id)

  const matricula = await prisma.matriculas.findUnique({
    where: { MatriculaID: matriculaId },
    include: { estudiante: true },
  })
  if (!matricula || !matricula.EstudianteID) redirect('/admin/matriculas')

  const grados = await prisma.grados.findMany({
    where: { OR: matricula.GradoID ? [{ EstadoID: 2 }, { GradoID: matricula.GradoID }] : [{ EstadoID: 2 }] },
    orderBy: { Nombre: 'asc' },
  })

  async function actualizarMatricula(formData: FormData) {
    'use server'
    const gradoIdRaw = formData.get('gradoId') as string
    const anioLectivo = formData.get('anioLectivo') as string
    const nuevoEstado = formData.get('estado') as string
    const gradoId = gradoIdRaw ? parseInt(gradoIdRaw) : null
    const estudianteId = matricula!.EstudianteID as number

    await prisma.$transaction(async (tx) => {
      if (nuevoEstado === 'Activa') {
        // Solo puede haber una matricula Activa por estudiante: se retira
        // cualquier OTRA fila Activa antes de dejar esta como la vigente.
        await tx.matriculas.updateMany({
          where: { EstudianteID: estudianteId, Estado: 'Activa', NOT: { MatriculaID: matriculaId } },
          data: { Estado: 'Retirada' },
        })
      }

      await tx.matriculas.update({
        where: { MatriculaID: matriculaId },
        data: { GradoID: gradoId, AnioLectivo: anioLectivo || null, Estado: nuevoEstado },
      })

      await recalcularGradoEstudiante(tx, estudianteId)
    })

    redirect('/admin/matriculas')
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Editar Matrícula</h2>
        <Link href="/admin/matriculas" className="text-sm text-indigo-600 font-semibold">&larr; Volver</Link>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm ring-1 ring-gray-900/5">
        <form action={actualizarMatricula} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Estudiante</label>
            <input
              disabled
              type="text"
              value={matricula.estudiante ? `${matricula.estudiante.Nombre} ${matricula.estudiante.Apellido}` : ''}
              className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 bg-gray-50 text-gray-500 shadow-sm sm:text-sm ring-1 ring-inset ring-gray-300"
            />
            <p className="mt-1 text-xs text-gray-500">Para reasignar de estudiante, creá una matrícula nueva.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Grado</label>
              <select name="gradoId" defaultValue={matricula.GradoID ?? ''} className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ring-1 ring-inset ring-gray-300">
                <option value="">Sin asignar</option>
                {grados.map((g) => (
                  <option key={g.GradoID} value={g.GradoID}>
                    {g.Nombre} {g.Paralelo}{g.EstadoID !== 2 ? ' (Inactivo)' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Año Lectivo</label>
              <input type="text" name="anioLectivo" defaultValue={matricula.AnioLectivo || ''} className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ring-1 ring-inset ring-gray-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Estado</label>
              <select name="estado" defaultValue={matricula.Estado || 'Activa'} className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ring-1 ring-inset ring-gray-300">
                <option value="Activa">Activa</option>
                <option value="Retirada">Retirada</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t flex justify-end">
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 shadow-sm">
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
