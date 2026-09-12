import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function EditarPadrePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session || session.roleId !== 1) redirect('/login')

  const { id } = await params
  const padreId = parseInt(id)

  const padre = await prisma.padres.findUnique({ where: { PadreID: padreId } })
  if (!padre) redirect('/admin/padres')

  async function actualizarPadre(formData: FormData) {
    'use server'
    const nombre = formData.get('nombre') as string
    const apellido = formData.get('apellido') as string
    const email = formData.get('email') as string
    const telefono = formData.get('telefono') as string
    const direccion = formData.get('direccion') as string

    await prisma.padres.update({
      where: { PadreID: padreId },
      data: {
        Nombre: nombre,
        Apellido: apellido,
        Email: email || null,
        Telefono: telefono || null,
        Direccion: direccion || null,
      },
    })

    redirect('/admin/padres')
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Editar Padre</h2>
        <Link href="/admin/padres" className="text-sm text-indigo-600 font-semibold">&larr; Volver</Link>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm ring-1 ring-gray-900/5">
        <form action={actualizarPadre} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombres</label>
              <input required type="text" name="nombre" defaultValue={padre.Nombre} className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ring-1 ring-inset ring-gray-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Apellidos</label>
              <input required type="text" name="apellido" defaultValue={padre.Apellido} className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ring-1 ring-inset ring-gray-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
              <input type="email" name="email" defaultValue={padre.Email || ''} className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ring-1 ring-inset ring-gray-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Teléfono</label>
              <input type="text" name="telefono" defaultValue={padre.Telefono || ''} className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ring-1 ring-inset ring-gray-300" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Dirección</label>
              <input type="text" name="direccion" defaultValue={padre.Direccion || ''} className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ring-1 ring-inset ring-gray-300" />
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
