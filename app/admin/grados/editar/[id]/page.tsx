import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function EditarGradoPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session || session.roleId !== 1) redirect('/login')

  const { id } = await params
  const gradoId = parseInt(id)

  const grado = await prisma.grados.findUnique({ where: { GradoID: gradoId } })
  if (!grado) redirect('/admin/grados')

  async function actualizarGrado(formData: FormData) {
    'use server'
    const nombre = formData.get('nombre') as string
    const nivel = formData.get('nivel') as string
    const paralelo = formData.get('paralelo') as string
    const cupoMaximoRaw = formData.get('cupoMaximo') as string
    const cupoMaximo = cupoMaximoRaw ? parseInt(cupoMaximoRaw) : null

    await prisma.grados.update({
      where: { GradoID: gradoId },
      data: {
        Nombre: nombre,
        Nivel: nivel || null,
        Paralelo: paralelo || 'A',
        CupoMaximo: cupoMaximo,
      },
    })

    redirect('/admin/grados')
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Editar Grado</h2>
        <Link href="/admin/grados" className="text-sm text-indigo-600 font-semibold">&larr; Volver</Link>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm ring-1 ring-gray-900/5">
        <form action={actualizarGrado} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input required type="text" name="nombre" defaultValue={grado.Nombre} className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ring-1 ring-inset ring-gray-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nivel</label>
              <input type="text" name="nivel" defaultValue={grado.Nivel || ''} className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ring-1 ring-inset ring-gray-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Paralelo</label>
              <input type="text" name="paralelo" defaultValue={grado.Paralelo || 'A'} className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ring-1 ring-inset ring-gray-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Cupo Máximo</label>
              <input type="number" name="cupoMaximo" defaultValue={grado.CupoMaximo ?? 30} className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ring-1 ring-inset ring-gray-300" />
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
