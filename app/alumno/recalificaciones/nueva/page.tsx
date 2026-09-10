import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { MOTIVO_MAX_LENGTH, MOTIVO_MIN_LENGTH } from '@/lib/recalificaciones'

const ERROR_MESSAGES: Record<string, string> = {
  MOTIVO_INVALIDO: `El motivo debe tener entre ${MOTIVO_MIN_LENGTH} y ${MOTIVO_MAX_LENGTH} caracteres.`,
  DUPLICADO: 'Ya existe una solicitud pendiente para esta nota.',
  NOTA_NO_ENCONTRADA: 'No se encontró la nota indicada.',
  FORBIDDEN: 'No tienes permiso para solicitar una recalificación sobre esa nota.',
}

export default async function NuevaRecalificacionPage({
  searchParams,
}: {
  searchParams: Promise<{ notaId?: string; error?: string }>
}) {
  const session = await getSession()
  if (!session || session.roleId !== 3) redirect('/login')

  const { notaId: notaIdStr, error } = await searchParams
  const notaId = notaIdStr ? parseInt(notaIdStr, 10) : NaN

  const estudiante = await prisma.estudiantes.findUnique({
    where: { UsuarioID: session.userId as number },
  })
  if (!estudiante) redirect('/login')

  if (Number.isNaN(notaId)) redirect('/alumno/recalificaciones')

  const nota = await prisma.notas.findUnique({
    where: { NotaID: notaId },
    include: {
      materia: true,
      periodo: true,
      recalifs: true,
    },
  })

  // Nunca renderizar información de una nota que no pertenezca al estudiante logueado.
  if (!nota || nota.EstudianteID !== estudiante.EstudianteID) {
    redirect('/alumno/recalificaciones')
  }

  const solicitudPendiente = nota.recalifs.some((r) => r.Estado === 'Pendiente')

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-6">
        <Link href="/alumno/notas" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Volver a Mis Notas
        </Link>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
        <div className="bg-[#004a8f] px-6 py-6">
          <h2 className="text-xl font-bold text-white">Solicitar Recalificación</h2>
          <p className="text-blue-200 text-sm mt-1">
            {nota.materia?.Nombre} &middot; {nota.periodo?.Nombre}
          </p>
        </div>

        <div className="p-6 md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="text-sm text-gray-500">Nota actual:</span>
            <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-sm font-bold text-gray-900">
              {nota.Nota.toString()}
            </span>
          </div>

          {solicitudPendiente ? (
            <div className="rounded-xl bg-amber-50 border border-amber-100 p-6 text-center">
              <p className="text-sm font-medium text-amber-800">
                Ya tienes una solicitud pendiente para esta nota. Debes esperar la resolución del profesor antes de enviar otra.
              </p>
              <Link href="/alumno/recalificaciones" className="mt-4 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                Ver mis solicitudes
              </Link>
            </div>
          ) : (
            <form action="/api/recalificaciones" method="POST" className="space-y-6">
              <input type="hidden" name="notaId" value={nota.NotaID} />

              {error && ERROR_MESSAGES[error] && (
                <div className="rounded-xl bg-red-50 p-4 border border-red-100">
                  <p className="text-sm font-medium text-red-800">{ERROR_MESSAGES[error]}</p>
                </div>
              )}

              <div>
                <label htmlFor="motivo" className="block text-sm font-medium leading-6 text-gray-900">
                  Motivo de la solicitud
                </label>
                <textarea
                  id="motivo"
                  name="motivo"
                  rows={5}
                  required
                  minLength={MOTIVO_MIN_LENGTH}
                  maxLength={MOTIVO_MAX_LENGTH}
                  placeholder="Explica por qué consideras que esta nota debería revisarse..."
                  className="mt-2 block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>

              <div className="flex items-center justify-end gap-x-4 border-t border-gray-900/10 pt-6">
                <Link href="/alumno/notas" className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-700">
                  Cancelar
                </Link>
                <button
                  type="submit"
                  className="rounded-md bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Enviar Solicitud
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
