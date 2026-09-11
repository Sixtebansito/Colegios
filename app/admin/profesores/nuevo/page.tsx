import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import bcrypt from 'bcryptjs'

export default async function NuevoProfesorPage() {
  const session = await getSession()
  if (!session || session.roleId !== 1) redirect('/login')

  async function registrarProfesor(formData: FormData) {
    'use server'
    const nombre = formData.get('nombre') as string
    const apellido = formData.get('apellido') as string
    const cedula = formData.get('cedula') as string
    const email = formData.get('email') as string
    const especialidad = formData.get('especialidad') as string
    const sueldoBase = parseFloat(formData.get('sueldo') as string)

    const hashedPassword = await bcrypt.hash(cedula, 10) // Password is CC initially

    await prisma.$transaction(async (tx) => {
      const user = await tx.usuarios.create({
        data: {
          Cedula: cedula,
          PasswordHash: hashedPassword,
          RoleID: 2, // Profesor
          EstadoID: 2 // Activo
        }
      })

      await tx.profesores.create({
        data: {
          UsuarioID: user.UsuarioID,
          Nombre: nombre,
          Apellido: apellido,
          Email: email,
          Especialidad: especialidad,
          SueldoBase: sueldoBase
        }
      })
    })
    
    redirect('/admin/profesores')
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Registrar Nuevo Profesor</h2>
        <Link href="/admin/profesores" className="text-sm text-indigo-600 font-semibold">&larr; Volver</Link>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm ring-1 ring-gray-900/5">
        <form action={registrarProfesor} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombres</label>
              <input required type="text" name="nombre" className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ring-1 ring-inset ring-gray-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Apellidos</label>
              <input required type="text" name="apellido" className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ring-1 ring-inset ring-gray-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Cédula</label>
              <input required type="text" name="cedula" className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ring-1 ring-inset ring-gray-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
              <input required type="email" name="email" className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ring-1 ring-inset ring-gray-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Especialidad</label>
              <input required type="text" name="especialidad" placeholder="Ej: Matemáticas, Lenguaje..." className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ring-1 ring-inset ring-gray-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Sueldo Base ($)</label>
              <input required type="number" step="0.01" name="sueldo" placeholder="800.00" className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ring-1 ring-inset ring-gray-300" />
            </div>
          </div>
          
          <div className="pt-4 border-t flex justify-end">
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 shadow-sm">
              Registrar Profesor
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
