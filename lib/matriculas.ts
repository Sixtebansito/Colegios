import type { Prisma } from '@prisma/client'
import prisma from '@/lib/db'

export const DEFAULT_ANIO_LECTIVO = '2025-2026'

// Busca el periodo activo mas reciente y devuelve su AnioLectivo, para no tener
// que pedirselo al admin en cada matricula si no hace falta.
export async function getAnioLectivoActual(): Promise<string> {
  const periodo = await prisma.periodos.findFirst({
    where: { EstadoID: 2 },
    orderBy: { FechaInicio: 'desc' },
  })
  return periodo?.AnioLectivo ?? DEFAULT_ANIO_LECTIVO
}

// Unica fuente de verdad para "matricular" a un estudiante en un grado.
// - gradoId === null: retira cualquier matricula Activa del estudiante y limpia Estudiantes.GradoID.
// - gradoId es un grado nuevo: retira la matricula Activa existente (si la hay) y crea una nueva.
// - gradoId es el mismo grado ya activo: no-op.
// En todos los casos deja Estudiantes.GradoID sincronizado con la matricula Activa resultante,
// porque varias pantallas del sistema todavia leen ese campo directamente.
export async function matricularEstudiante(
  tx: Prisma.TransactionClient,
  params: { estudianteId: number; gradoId: number | null; anioLectivo?: string }
): Promise<void> {
  const { estudianteId } = params
  const anioLectivo = params.anioLectivo ?? (await getAnioLectivoActual())

  const matriculaActiva = await tx.matriculas.findFirst({
    where: { EstudianteID: estudianteId, Estado: 'Activa' },
  })

  if (params.gradoId === null) {
    if (matriculaActiva) {
      await tx.matriculas.update({
        where: { MatriculaID: matriculaActiva.MatriculaID },
        data: { Estado: 'Retirada' },
      })
    }
    await tx.estudiantes.update({
      where: { EstudianteID: estudianteId },
      data: { GradoID: null },
    })
    return
  }

  if (matriculaActiva && matriculaActiva.GradoID === params.gradoId) {
    // Ya esta matriculado en ese grado; nada que hacer.
    return
  }

  if (matriculaActiva) {
    await tx.matriculas.update({
      where: { MatriculaID: matriculaActiva.MatriculaID },
      data: { Estado: 'Retirada' },
    })
  }

  await tx.matriculas.create({
    data: {
      EstudianteID: estudianteId,
      GradoID: params.gradoId,
      AnioLectivo: anioLectivo,
      Estado: 'Activa',
    },
  })

  await tx.estudiantes.update({
    where: { EstudianteID: estudianteId },
    data: { GradoID: params.gradoId },
  })
}

// Re-lee la matricula Activa actual del estudiante y sincroniza Estudiantes.GradoID.
// Se usa cuando la pantalla de Matriculas edita una fila directamente (cambia su
// Estado o su GradoID) sin pasar por matricularEstudiante.
export async function recalcularGradoEstudiante(
  tx: Prisma.TransactionClient,
  estudianteId: number
): Promise<void> {
  const matriculaActiva = await tx.matriculas.findFirst({
    where: { EstudianteID: estudianteId, Estado: 'Activa' },
  })

  await tx.estudiantes.update({
    where: { EstudianteID: estudianteId },
    data: { GradoID: matriculaActiva?.GradoID ?? null },
  })
}
