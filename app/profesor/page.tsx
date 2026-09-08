import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import Link from 'next/link'

export default async function ProfesorDashboard() {
  const session = await getSession()
  
  const profesor = await prisma.profesores.findUnique({
    where: { UsuarioID: session?.userId as number },
    include: {
      materias: { include: { grado: true } }
    }
  })

  if (!profesor) {
    return <div>Perfil de profesor no encontrado.</div>
  }

  return (
    <div className="max-w-[1440px] mx-auto">
      {/* Header EVA PUCE style */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Área Personal Docente</h1>
        <p className="mt-2 text-sm text-gray-500">Bienvenido/a Prof. {profesor.Nombre}, aquí encontrarás el resumen de tus cursos asignados.</p>
      </div>

      <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Vista general de cursos</h2>
      
      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {profesor.materias.map(materia => (
          <Link href={`/profesor/tareas?materia=${materia.MateriaID}`} key={materia.MateriaID} className="group flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            {/* Header / Pattern */}
            <div className="h-32 bg-teal-600 relative overflow-hidden flex items-center justify-center p-6">
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
              <h3 className="text-xl font-bold text-white text-center z-10 drop-shadow-md">{materia.Nombre}</h3>
            </div>
            
            {/* Body */}
            <div className="p-6 flex flex-col flex-1">
              <p className="text-sm text-gray-500 mb-4 font-medium">{materia.grado?.Nombre} {materia.grado?.Paralelo}</p>
              
              <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm font-medium text-teal-600">Administrar Curso &rarr;</span>
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                  Activo
                </span>
              </div>
            </div>
          </Link>
        ))}

        {profesor.materias.length === 0 && (
          <div className="col-span-full bg-gray-50 p-12 text-center rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-500">No tienes materias asignadas este período.</p>
          </div>
        )}
      </div>
    </div>
  )
}
