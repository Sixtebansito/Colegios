import { randomUUID } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/auth', () => ({ getSession: vi.fn() }))

import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { POST } from './route'

function postMatriculacion(body: Record<string, unknown>) {
  const request = new Request('http://localhost/api/admin/matriculacion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return POST(request)
}

describe('POST /api/admin/matriculacion', () => {
  let usuarioAdmin: Awaited<ReturnType<typeof prisma.usuarios.create>>
  let usuarioAlumno: Awaited<ReturnType<typeof prisma.usuarios.create>>
  let estudiante: Awaited<ReturnType<typeof prisma.estudiantes.create>>
  let gradoA: Awaited<ReturnType<typeof prisma.grados.create>>
  let gradoB: Awaited<ReturnType<typeof prisma.grados.create>>

  beforeEach(async () => {
    usuarioAdmin = await prisma.usuarios.create({
      data: { Cedula: `admin-${randomUUID()}`, PasswordHash: 'x', EstadoID: null },
    })
    usuarioAlumno = await prisma.usuarios.create({
      data: { Cedula: `alumno-${randomUUID()}`, PasswordHash: 'x', EstadoID: null },
    })
    estudiante = await prisma.estudiantes.create({
      data: { UsuarioID: usuarioAlumno.UsuarioID, Nombre: 'Luis', Apellido: 'Torres', EstadoID: null },
    })
    gradoA = await prisma.grados.create({ data: { Nombre: `Grado A ${randomUUID()}`, EstadoID: null } })
    gradoB = await prisma.grados.create({ data: { Nombre: `Grado B ${randomUUID()}`, EstadoID: null } })
  })

  afterEach(async () => {
    await prisma.matriculas.deleteMany({ where: { EstudianteID: estudiante.EstudianteID } })
    // El estudiante debe borrarse antes que los grados: la ruta deja
    // Estudiantes.GradoID apuntando al grado, y esa FK es NoAction.
    await prisma.estudiantes.delete({ where: { EstudianteID: estudiante.EstudianteID } })
    await prisma.grados.deleteMany({ where: { GradoID: { in: [gradoA.GradoID, gradoB.GradoID] } } })
    await prisma.usuarios.deleteMany({ where: { UsuarioID: { in: [usuarioAdmin.UsuarioID, usuarioAlumno.UsuarioID] } } })
    vi.clearAllMocks()
  })

  it('asignar un grado crea una fila real en Matriculas (no solo Estudiantes.GradoID)', async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: usuarioAdmin.UsuarioID, roleId: 1 })

    const res = await postMatriculacion({ estudianteId: estudiante.EstudianteID, gradoId: gradoA.GradoID })

    expect(res.status).toBe(200)
    const matricula = await prisma.matriculas.findFirst({ where: { EstudianteID: estudiante.EstudianteID } })
    expect(matricula?.Estado).toBe('Activa')
    expect(matricula?.GradoID).toBe(gradoA.GradoID)
    const actualizado = await prisma.estudiantes.findUnique({ where: { EstudianteID: estudiante.EstudianteID } })
    expect(actualizado?.GradoID).toBe(gradoA.GradoID)
  })

  it('reasignar a otro grado retira la matricula vieja en vez de dejarla huerfana', async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: usuarioAdmin.UsuarioID, roleId: 1 })

    await postMatriculacion({ estudianteId: estudiante.EstudianteID, gradoId: gradoA.GradoID })
    await postMatriculacion({ estudianteId: estudiante.EstudianteID, gradoId: gradoB.GradoID })

    const matriculas = await prisma.matriculas.findMany({ where: { EstudianteID: estudiante.EstudianteID } })
    expect(matriculas).toHaveLength(2)
    expect(matriculas.filter((m) => m.Estado === 'Activa')).toHaveLength(1)
    expect(matriculas.find((m) => m.Estado === 'Activa')?.GradoID).toBe(gradoB.GradoID)
  })

  it('gradoId null retira la matricula activa', async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: usuarioAdmin.UsuarioID, roleId: 1 })
    await postMatriculacion({ estudianteId: estudiante.EstudianteID, gradoId: gradoA.GradoID })

    await postMatriculacion({ estudianteId: estudiante.EstudianteID, gradoId: null })

    const activa = await prisma.matriculas.findFirst({ where: { EstudianteID: estudiante.EstudianteID, Estado: 'Activa' } })
    expect(activa).toBeNull()
    const actualizado = await prisma.estudiantes.findUnique({ where: { EstudianteID: estudiante.EstudianteID } })
    expect(actualizado?.GradoID).toBeNull()
  })

  it('responde 401 sin sesion', async () => {
    vi.mocked(getSession).mockResolvedValue(null)

    const res = await postMatriculacion({ estudianteId: estudiante.EstudianteID, gradoId: gradoA.GradoID })

    expect(res.status).toBe(401)
    const count = await prisma.matriculas.count({ where: { EstudianteID: estudiante.EstudianteID } })
    expect(count).toBe(0)
  })

  it('responde 401 si el rol no es Administrador', async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: usuarioAlumno.UsuarioID, roleId: 3 })

    const res = await postMatriculacion({ estudianteId: estudiante.EstudianteID, gradoId: gradoA.GradoID })

    expect(res.status).toBe(401)
  })
})
