import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Award, Users } from 'lucide-react'

export default async function CalificacionesDashboardPage() {
  const session = await getSession()
  
  const profesor = await prisma.profesores.findUnique({
    where: { UsuarioID: session?.userId as number },
    include: {
      materias: {
        include: {
          grado: true
        }
      }
    }
  })

  if (!profesor) redirect('/login')

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Calificaciones</h2>
        <p className="mt-2 text-sm text-gray-500">Selecciona una materia para gestionar las notas de los estudiantes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profesor.materias.map(materia => (
          <div key={materia.MateriaID} className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5 hover:shadow-md transition-shadow flex flex-col overflow-hidden">
            <div className="p-6 flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{materia.Nombre}</h3>
                  <p className="text-sm text-gray-500 font-medium">{materia.grado?.Nombre} {materia.grado?.Paralelo}</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <Link 
                href={`/profesor/calificaciones/${materia.MateriaID}`}
                className="flex w-full items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                Ingresar Calificaciones &rarr;
              </Link>
            </div>
          </div>
        ))}

        {profesor.materias.length === 0 && (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl ring-1 ring-gray-900/5">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Sin materias asignadas</h3>
            <p className="text-gray-500">No tienes ninguna materia asignada para calificar.</p>
          </div>
        )}
      </div>
    </div>
  )
}
