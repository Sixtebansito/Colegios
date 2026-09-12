import { describe, expect, it } from 'vitest'
import bcrypt from 'bcryptjs'
import { hashPassword } from './passwords'

describe('hashPassword', () => {
  it('produce un hash que valida con bcrypt.compare', async () => {
    const hash = await hashPassword('mi-cedula-123')
    expect(hash).not.toBe('mi-cedula-123')
    await expect(bcrypt.compare('mi-cedula-123', hash)).resolves.toBe(true)
  })

  it('un hash no valida contra un texto distinto', async () => {
    const hash = await hashPassword('correcto')
    await expect(bcrypt.compare('incorrecto', hash)).resolves.toBe(false)
  })
})
