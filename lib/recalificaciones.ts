// Reglas de negocio de recalificaciones, sin dependencias de Next.js ni Prisma
// para que sean testeables de forma aislada (ver lib/recalificaciones.test.ts).

export const MOTIVO_MIN_LENGTH = 10
export const MOTIVO_MAX_LENGTH = 500
export const NOTA_MIN = 0
export const NOTA_MAX = 10

export interface ValidationResult {
  valid: boolean
  code?: string // para el query param ?error=
  error?: string // mensaje en español para mostrar en la UI
}

export function validateMotivo(motivo: string | null | undefined): ValidationResult {
  const trimmed = (motivo ?? '').trim()

  if (trimmed.length < MOTIVO_MIN_LENGTH) {
    return {
      valid: false,
      code: 'MOTIVO_INVALIDO',
      error: `El motivo debe tener al menos ${MOTIVO_MIN_LENGTH} caracteres.`,
    }
  }

  if (trimmed.length > MOTIVO_MAX_LENGTH) {
    return {
      valid: false,
      code: 'MOTIVO_INVALIDO',
      error: `El motivo no puede superar los ${MOTIVO_MAX_LENGTH} caracteres.`,
    }
  }

  return { valid: true }
}

export function validateNotaNueva(nota: number | null | undefined): ValidationResult {
  if (nota === null || nota === undefined || Number.isNaN(nota)) {
    return {
      valid: false,
      code: 'NOTA_INVALIDA',
      error: 'Debe ingresar una nota válida para aprobar la solicitud.',
    }
  }

  if (nota < NOTA_MIN || nota > NOTA_MAX) {
    return {
      valid: false,
      code: 'NOTA_INVALIDA',
      error: `La nota debe estar entre ${NOTA_MIN} y ${NOTA_MAX}.`,
    }
  }

  return { valid: true }
}

export function parseDecision(raw: string | null | undefined): 'Aprobada' | 'Rechazada' | null {
  if (raw === 'Aprobada' || raw === 'Rechazada') return raw
  return null
}

export function canResolve(
  currentEstado: string | null | undefined,
  decisionRaw: string
): ValidationResult {
  if (currentEstado !== 'Pendiente') {
    return {
      valid: false,
      code: 'ALREADY_RESOLVED',
      error: 'Esta solicitud ya fue resuelta anteriormente.',
    }
  }

  if (parseDecision(decisionRaw) === null) {
    return {
      valid: false,
      code: 'INVALID_DECISION',
      error: 'La decisión debe ser "Aprobada" o "Rechazada".',
    }
  }

  return { valid: true }
}
