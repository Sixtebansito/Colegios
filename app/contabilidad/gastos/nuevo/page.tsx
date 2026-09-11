import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { redirect } from 'next/navigation'

export default async function NuevoGastoPage() {
  const session = await getSession()
  if (!session || session.roleId !== 4) redirect('/login')

  async function registrarGasto(formData: FormData) {
    'use server'
    const descripcion = formData.get('descripcion') as string
    const monto = parseFloat(formData.get('monto') as string)
    const categoria = formData.get('categoria') as string

    await prisma.gastos.create({
      data: { Descripcion: descripcion, Monto: monto, Categoria: categoria }
    })
    
    redirect('/contabilidad')
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm ring-1 ring-gray-900/5">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Registrar Nuevo Gasto</h2>
      <form action={registrarGasto} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Descripción</label>
          <input required type="text" name="descripcion" className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm ring-1 ring-inset ring-gray-300" placeholder="Ej: Pago de Internet" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Categoría</label>
          <select required name="categoria" className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm ring-1 ring-inset ring-gray-300">
            <option value="Servicios Básicos">Servicios Básicos</option>
            <option value="Mantenimiento">Mantenimiento</option>
            <option value="Suministros">Suministros Escolares</option>
            <option value="Tecnología">Tecnología</option>
            <option value="Otros">Otros</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Monto ($)</label>
          <input required type="number" step="0.01" name="monto" className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm ring-1 ring-inset ring-gray-300" placeholder="0.00" />
        </div>
        <div className="flex gap-4 pt-4 border-t">
          <a href="/contabilidad" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancelar</a>
          <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 shadow-sm">Guardar Gasto</button>
        </div>
      </form>
    </div>
  )
}
