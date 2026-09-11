import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import Link from 'next/link'
import { Calendar as CalendarIcon, Clock, BookOpen, AlertCircle } from 'lucide-react'

export default async function AlumnoDashboard() {
  const session = await getSession()
  
  const estudiante = await prisma.estudiantes.findUnique({
    where: { UsuarioID: session?.userId as number },
    include: {
      matriculas: true,
    }
  })

  if (!estudiante) {
    return <div>Perfil de alumno no encontrado.</div>
  }

  const gradoId = estudiante.matriculas[0]?.GradoID

  let materias: any[] = []
  let tareasProximas: any[] = []
  let horarios: any[] = []

  if (gradoId) {
    materias = await prisma.materias.findMany({
      where: { GradoID: gradoId },
      include: { profesor: true }
    })

    const materiaIds = materias.map(m => m.MateriaID)

    tareasProximas = await prisma.tareas.findMany({
      where: {
        MateriaID: { in: materiaIds },
        FechaVencimiento: { gte: new Date() }
      },
      orderBy: { FechaVencimiento: 'asc' },
      take: 5,
      include: { materia: true }
    })

    horarios = await prisma.horarios.findMany({
      where: { GradoID: gradoId },
      include: { materia: true },
      orderBy: { HoraInicio: 'asc' }
    })
  }

  const dias = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes']

  return (
    <div className="max-w-[1440px] mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Área Personal</h1>
        <p className="mt-2 text-sm text-gray-500">Bienvenido/a {estudiante.Nombre}, aquí encontrarás el resumen de tus cursos y actividades.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Calendario: Tareas Próximas */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-6 border-b pb-4">
            <CalendarIcon className="text-indigo-600 w-6 h-6" />
            <h2 className="text-xl font-bold text-gray-800">Calendario (Próximas Tareas)</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {tareasProximas.length > 0 ? (
              <div className="space-y-4">
                {tareasProximas.map(t => (
                  <div key={t.TareaID} className="flex gap-4 p-3 rounded-lg bg-gray-50 border border-gray-100 items-start">
                    <div className="bg-white rounded-md shadow-sm border p-2 text-center min-w-[3rem]">
                      <div className="text-xs font-bold text-red-500 uppercase">{t.FechaVencimiento?.toLocaleDateString('es-ES', { month: 'short' })}</div>
                      <div className="text-lg font-bold text-gray-900">{t.FechaVencimiento?.getDate()}</div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm leading-tight">{t.Titulo}</h4>
                      <p className="text-xs text-gray-500 mt-1">{t.materia?.Nombre}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2 py-8">
                <AlertCircle className="w-8 h-8" />
                <p className="text-sm">No hay tareas próximas.</p>
              </div>
            )}
          </div>
          <Link href="/alumno/tareas" className="mt-4 text-center text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
            Ver todas mis tareas &rarr;
          </Link>
        </div>

        {/* Horario Resumido */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-6 border-b pb-4">
            <Clock className="text-teal-600 w-6 h-6" />
            <h2 className="text-xl font-bold text-gray-800">Horario de Clases</h2>
          </div>

          <div className="flex-1 overflow-x-auto">
            <div className="grid grid-cols-5 gap-4 min-w-[600px]">
              {dias.map(dia => {
                const clasesHoy = horarios.filter(h => h.DiaSemana === dia);
                return (
                  <div key={dia} className="flex flex-col gap-3">
                    <div className="bg-gray-100 rounded-lg py-2 text-center text-sm font-bold text-gray-700">
                      {dia}
                    </div>
                    {clasesHoy.length > 0 ? (
                      clasesHoy.map(c => (
                        <div key={c.HorarioID} className="bg-teal-50 border border-teal-100 p-2 rounded-lg shadow-sm text-center">
                          <div className="text-[11px] font-semibold text-teal-800 leading-tight">{c.materia?.Nombre}</div>
                          <div className="text-[10px] text-gray-500 mt-1">{c.HoraInicio} - {c.HoraFin}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-center text-gray-400 py-4 italic">Sin clases</div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
          <Link href="/alumno/horario" className="mt-6 text-center text-sm font-semibold text-teal-600 hover:text-teal-800 transition-colors">
            Ver horario completo &rarr;
          </Link>
        </div>
      </div>

      {/* Vista general del curso */}
      <div className="flex items-center gap-2 mb-6 border-b pb-2">
        <BookOpen className="text-gray-800 w-6 h-6" />
        <h2 className="text-xl font-bold text-gray-800">Vista general de curso</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {materias.map(materia => (
          <Link href={`/alumno/tareas?materia=${materia.MateriaID}`} key={materia.MateriaID} className="group flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="h-32 bg-indigo-600 relative overflow-hidden flex items-center justify-center p-6">
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
              <h3 className="text-xl font-bold text-white text-center z-10 drop-shadow-md">{materia.Nombre}</h3>
            </div>
            
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
