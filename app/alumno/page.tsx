import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import Link from 'next/link'

export default async function AlumnoDashboard() {
  const session = await getSession()
  
  const estudiante = await prisma.estudiantes.findUnique({
    where: { UsuarioID: session?.userId as number },
    include: {
      grado: true,
      padre: true,
      matriculas: true,
    }
  })

  if (!estudiante) {
    return <div>Perfil de alumno no encontrado.</div>
  }

  // Find materias based on GradoID
  let materias: any[] = []
  if (estudiante.matriculas.length > 0) {
    materias = await prisma.materias.findMany({
      where: { GradoID: estudiante.matriculas[0].GradoID },
      include: { profesor: true }
    })
  }

  return (
    <div className="max-w-[1440px] mx-auto">
      {/* Header EVA PUCE style */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Área Personal</h1>
        <p className="mt-2 text-sm text-gray-500">Bienvenido/a {estudiante.Nombre}, aquí encontrarás el resumen de tus cursos.</p>
      </div>

      <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Vista general de curso</h2>
      
      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {materias.map(materia => (
          <Link href={`/alumno/tareas`} key={materia.MateriaID} className="group flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            {/* Header / Pattern */}
            <div className="h-32 bg-indigo-600 relative overflow-hidden flex items-center justify-center p-6">
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
              <h3 className="text-xl font-bold text-white text-center z-10 drop-shadow-md">{materia.Nombre}</h3>
            </div>
            
            {/* Body */}
            <div className="p-6 flex flex-col flex-1">
              <p className="text-sm text-gray-500 mb-4">Prof. {materia.profesor?.Nombre} {materia.profesor?.Apellido}</p>
              
              <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm font-medium text-indigo-600">Ver Actividades &rarr;</span>
                <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                  En progreso
                </span>
              </div>
            </div>
          </Link>
        ))}

        {materias.length === 0 && (
          <div className="col-span-full bg-gray-50 p-12 text-center rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-500">Aún no estás matriculado en ninguna materia.</p>
          </div>
        )}
      </div>
    </div>
  )
}
