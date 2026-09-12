import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function NuevaMateriaPage() {
  const session = await getSession()
  if (!session || session.roleId !== 1) redirect('/login')

  const profesores = await prisma.profesores.findMany({
    where: { OR: [{ UsuarioID: null }, { usuario: { EstadoID: 2 } }] },
    orderBy: [{ Apellido: 'asc' }, { Nombre: 'asc' }],
  })
  const grados = await prisma.grados.findMany({
    where: { EstadoID: 2 },
    orderBy: { Nombre: 'asc' },
  })

  async function crearMateria(formData: FormData) {
    'use server'
    const nombre = formData.get('nombre') as string
    const descripcion = formData.get('descripcion') as string
    const profesorIdRaw = formData.get('profesorId') as string
    const gradoIdRaw = formData.get('gradoId') as string

    await prisma.materias.create({
      data: {
        Nombre: nombre,
        Descripcion: descripcion || null,
        ProfesorID: profesorIdRaw ? parseInt(profesorIdRaw) : null,
        GradoID: gradoIdRaw ? parseInt(gradoIdRaw) : null,
      },
    })

    redirect('/admin/materias')
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Registrar Nueva Materia</h2>
        <Link href="/admin/materias" className="text-sm text-indigo-600 font-semibold">&larr; Volver</Link>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm ring-1 ring-gray-900/5">
        <form action={crearMateria} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input required type="text" name="nombre" placeholder="Ej: Matemáticas Avanzadas" className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ring-1 ring-inset ring-gray-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Descripción</label>
            <textarea name="descripcion" rows={3} className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ring-1 ring-inset ring-gray-300" />
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Profesor</label>
              <select name="profesorId" className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ring-1 ring-inset ring-gray-300">
                <option value="">Sin asignar</option>
                {profesores.map((p) => (
                  <option key={p.ProfesorID} value={p.ProfesorID}>{p.Nombre} {p.Apellido}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Grado</label>
              <select name="gradoId" className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ring-1 ring-inset ring-gray-300">
                <option value="">Sin asignar</option>
                {grados.map((g) => (
                  <option key={g.GradoID} value={g.GradoID}>{g.Nombre} {g.Paralelo}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 border-t flex justify-end">
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 shadow-sm">
              Registrar Materia
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
