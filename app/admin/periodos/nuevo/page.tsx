import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function NuevoPeriodoPage() {
  const session = await getSession()
  if (!session || session.roleId !== 1) redirect('/login')

  async function crearPeriodo(formData: FormData) {
    'use server'
    const nombre = formData.get('nombre') as string
    const anioLectivo = formData.get('anioLectivo') as string
    const semestre = formData.get('semestre') as string
    const fechaInicioRaw = formData.get('fechaInicio') as string
    const fechaFinRaw = formData.get('fechaFin') as string

    await prisma.periodos.create({
      data: {
        Nombre: nombre,
        AnioLectivo: anioLectivo || null,
        Semestre: semestre || null,
        FechaInicio: fechaInicioRaw ? new Date(fechaInicioRaw) : null,
        FechaFin: fechaFinRaw ? new Date(fechaFinRaw) : null,
      },
    })

    redirect('/admin/periodos')
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Registrar Nuevo Periodo</h2>
        <Link href="/admin/periodos" className="text-sm text-indigo-600 font-semibold">&larr; Volver</Link>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm ring-1 ring-gray-900/5">
        <form action={crearPeriodo} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input required type="text" name="nombre" placeholder="Ej: Primer Quimestre" className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ring-1 ring-inset ring-gray-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Año Lectivo</label>
              <input type="text" name="anioLectivo" placeholder="Ej: 2025-2026" className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ring-1 ring-inset ring-gray-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Semestre</label>
              <select name="semestre" className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ring-1 ring-inset ring-gray-300">
                <option value="">Sin especificar</option>
                <option value="Primer">Primer Semestre</option>
                <option value="Segundo">Segundo Semestre</option>
              </select>
            </div>
            <div />
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha de Inicio</label>
              <input type="date" name="fechaInicio" className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ring-1 ring-inset ring-gray-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha de Fin</label>
              <input type="date" name="fechaFin" className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ring-1 ring-inset ring-gray-300" />
            </div>
          </div>

          <div className="pt-4 border-t flex justify-end">
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 shadow-sm">
              Registrar Periodo
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
