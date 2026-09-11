import { describe, expect, it } from 'vitest'
import {
  MOTIVO_MAX_LENGTH,
  MOTIVO_MIN_LENGTH,
  NOTA_MAX,
  NOTA_MIN,
  canResolve,
  parseDecision,
  validateMotivo,
  validateNotaNueva,
} from './recalificaciones'

describe('validateMotivo', () => {
  it('rechaza un motivo vacío', () => {
    expect(validateMotivo('').valid).toBe(false)
  })

  it('rechaza null y undefined', () => {
    expect(validateMotivo(null).valid).toBe(false)
    expect(validateMotivo(undefined).valid).toBe(false)
  })

  it('rechaza un motivo solo con espacios', () => {
    expect(validateMotivo('           ').valid).toBe(false)
  })

  it('rechaza un motivo por debajo del mínimo', () => {
    const result = validateMotivo('a'.repeat(MOTIVO_MIN_LENGTH - 1))
    expect(result.valid).toBe(false)
    expect(result.code).toBe('MOTIVO_INVALIDO')
  })

  it('acepta un motivo exactamente en el límite mínimo', () => {
    expect(validateMotivo('a'.repeat(MOTIVO_MIN_LENGTH)).valid).toBe(true)
  })

  it('acepta un motivo exactamente en el límite máximo', () => {
    expect(validateMotivo('a'.repeat(MOTIVO_MAX_LENGTH)).valid).toBe(true)
  })

  it('rechaza un motivo por encima del máximo', () => {
    const result = validateMotivo('a'.repeat(MOTIVO_MAX_LENGTH + 1))
    expect(result.valid).toBe(false)
    expect(result.code).toBe('MOTIVO_INVALIDO')
  })
})

describe('validateNotaNueva', () => {
  it('rechaza NaN', () => {
    expect(validateNotaNueva(NaN).valid).toBe(false)
  })

  it('rechaza null y undefined', () => {
    expect(validateNotaNueva(null).valid).toBe(false)
    expect(validateNotaNueva(undefined).valid).toBe(false)
  })

  it('rechaza valores por debajo del mínimo', () => {
    const result = validateNotaNueva(NOTA_MIN - 1)
    expect(result.valid).toBe(false)
    expect(result.code).toBe('NOTA_INVALIDA')
  })

  it('rechaza valores por encima del máximo', () => {
    expect(validateNotaNueva(NOTA_MAX + 1).valid).toBe(false)
  })

  it('acepta el límite mínimo exacto', () => {
    expect(validateNotaNueva(NOTA_MIN).valid).toBe(true)
  })

  it('acepta el límite máximo exacto', () => {
    expect(validateNotaNueva(NOTA_MAX).valid).toBe(true)
  })
})

describe('parseDecision', () => {
  it('acepta "Aprobada" y "Rechazada"', () => {
    expect(parseDecision('Aprobada')).toBe('Aprobada')
    expect(parseDecision('Rechazada')).toBe('Rechazada')
  })

  it('es sensible a mayúsculas/minúsculas', () => {
    expect(parseDecision('aprobada')).toBeNull()
  })

  it('rechaza valores desconocidos, vacíos o null', () => {
    expect(parseDecision('Maybe')).toBeNull()
    expect(parseDecision('')).toBeNull()
    expect(parseDecision(null)).toBeNull()
    expect(parseDecision(undefined)).toBeNull()
  })
})

describe('canResolve', () => {
  it('permite resolver una solicitud Pendiente con una decisión válida', () => {
    expect(canResolve('Pendiente', 'Aprobada').valid).toBe(true)
    expect(canResolve('Pendiente', 'Rechazada').valid).toBe(true)
  })

  it('bloquea una decisión inválida sobre una solicitud Pendiente', () => {
    const result = canResolve('Pendiente', 'Maybe')
    expect(result.valid).toBe(false)
    expect(result.code).toBe('INVALID_DECISION')
  })

  it('bloquea la re-resolución de una solicitud ya Aprobada', () => {
    const result = canResolve('Aprobada', 'Rechazada')
    expect(result.valid).toBe(false)
    expect(result.code).toBe('ALREADY_RESOLVED')
  })

  it('bloquea la re-resolución de una solicitud ya Rechazada', () => {
    const result = canResolve('Rechazada', 'Aprobada')
    expect(result.valid).toBe(false)
    expect(result.code).toBe('ALREADY_RESOLVED')
  })

  it('trata estado null/undefined como no-Pendiente', () => {
    expect(canResolve(null, 'Aprobada').valid).toBe(false)
    expect(canResolve(undefined, 'Aprobada').valid).toBe(false)
  })
})
