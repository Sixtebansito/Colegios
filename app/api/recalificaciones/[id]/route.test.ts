import { randomUUID } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/auth', () => ({ getSession: vi.fn() }))

import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { POST } from './route'

function postResolve(solicitudId: number | string, fields: Record<string, string>) {
  const formData = new FormData()
  for (const [key, value] of Object.entries(fields)) formData.set(key, value)
  const request = new Request(`http://localhost/api/recalificaciones/${solicitudId}`, {
    method: 'POST',
    body: formData,
  })
  return POST(request, { params: Promise.resolve({ id: String(solicitudId) }) })
}

describe('POST /api/recalificaciones/[id]', () => {
  let usuarioX: Awaited<ReturnType<typeof prisma.usuarios.create>>
  let usuarioY: Awaited<ReturnType<typeof prisma.usuarios.create>>
  let usuarioAlumno: Awaited<ReturnType<typeof prisma.usuarios.create>>
  let profesorX: Awaited<ReturnType<typeof prisma.profesores.create>>
  let profesorY: Awaited<ReturnType<typeof prisma.profesores.create>>
  let estudiante: Awaited<ReturnType<typeof prisma.estudiantes.create>>
  let materia: Awaited<ReturnType<typeof prisma.materias.create>>
  let periodo: Awaited<ReturnType<typeof prisma.periodos.create>>
  let nota: Awaited<ReturnType<typeof prisma.notas.create>>
  let solicitud: Awaited<ReturnType<typeof prisma.solicitudesRecalificacion.create>>

  beforeEach(async () => {
    usuarioX = await prisma.usuarios.create({ data: { Cedula: `profX-${randomUUID()}`, PasswordHash: 'x', EstadoID: null } })
    usuarioY = await prisma.usuarios.create({ data: { Cedula: `profY-${randomUUID()}`, PasswordHash: 'x', EstadoID: null } })
    usuarioAlumno = await prisma.usuarios.create({ data: { Cedula: `alumno-${randomUUID()}`, PasswordHash: 'x', EstadoID: null } })

    profesorX = await prisma.profesores.create({ data: { UsuarioID: usuarioX.UsuarioID, Nombre: 'Juan', Apellido: 'Pérez' } })
    profesorY = await prisma.profesores.create({ data: { UsuarioID: usuarioY.UsuarioID, Nombre: 'Laura', Apellido: 'Díaz' } })

    estudiante = await prisma.estudiantes.create({
      data: { UsuarioID: usuarioAlumno.UsuarioID, Nombre: 'Carlos', Apellido: 'Gómez', EstadoID: null },
    })
    materia = await prisma.materias.create({ data: { Nombre: 'Matemáticas', ProfesorID: profesorX.ProfesorID } })
    periodo = await prisma.periodos.create({ data: { Nombre: 'Primer Quimestre', EstadoID: null } })

    // La nota pertenece al profesor X (Notas.ProfesorID = profesorX).
    nota = await prisma.notas.create({
      data: {
        EstudianteID: estudiante.EstudianteID,
        MateriaID: materia.MateriaID,
        PeriodoID: periodo.PeriodoID,
        ProfesorID: profesorX.ProfesorID,
        Nota: 7,
      },
    })

    solicitud = await prisma.solicitudesRecalificacion.create({
      data: { NotaID: nota.NotaID, Motivo: 'Motivo de prueba suficientemente largo.', Estado: 'Pendiente', NotaAnterior: 7 },
    })
  })

  afterEach(async () => {
    await prisma.solicitudesRecalificacion.deleteMany({ where: { NotaID: nota.NotaID } })
    await prisma.notas.delete({ where: { NotaID: nota.NotaID } })
    await prisma.materias.delete({ where: { MateriaID: materia.MateriaID } })
    await prisma.periodos.delete({ where: { PeriodoID: periodo.PeriodoID } })
    await prisma.estudiantes.delete({ where: { EstudianteID: estudiante.EstudianteID } })
    await prisma.profesores.deleteMany({ where: { ProfesorID: { in: [profesorX.ProfesorID, profesorY.ProfesorID] } } })
    await prisma.usuarios.deleteMany({
      where: { UsuarioID: { in: [usuarioX.UsuarioID, usuarioY.UsuarioID, usuarioAlumno.UsuarioID] } },
    })
    vi.clearAllMocks()
  })

  it('happy path: aprobar actualiza la solicitud y la Nota', async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: usuarioX.UsuarioID, roleId: 2 })

    const res = await postResolve(solicitud.SolicitudID, { decision: 'Aprobada', notaNueva: '8.5', comentario: 'Correcto, se ajusta la nota.' })

    expect(res.headers.get('location')).toContain('/profesor/recalificaciones')
    const updated = await prisma.solicitudesRecalificacion.findUnique({ where: { SolicitudID: solicitud.SolicitudID } })
    expect(updated?.Estado).toBe('Aprobada')
    expect(updated?.NotaNueva).toBe(8.5)
    expect(updated?.FechaResolucion).not.toBeNull()
    const notaActualizada = await prisma.notas.findUnique({ where: { NotaID: nota.NotaID } })
    expect(notaActualizada?.Nota).toBe(8.5)
  })

  it('happy path: rechazar actualiza la solicitud y deja la Nota sin cambios', async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: usuarioX.UsuarioID, roleId: 2 })

    await postResolve(solicitud.SolicitudID, { decision: 'Rechazada', comentario: 'No se justifica el cambio.' })

    const updated = await prisma.solicitudesRecalificacion.findUnique({ where: { SolicitudID: solicitud.SolicitudID } })
    expect(updated?.Estado).toBe('Rechazada')
    expect(updated?.NotaNueva).toBeNull()
    const notaSinCambios = await prisma.notas.findUnique({ where: { NotaID: nota.NotaID } })
    expect(notaSinCambios?.Nota).toBe(7)
  })

  it('bloquea a un profesor que no es dueño de la nota (FORBIDDEN)', async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: usuarioY.UsuarioID, roleId: 2 })

    const res = await postResolve(solicitud.SolicitudID, { decision: 'Aprobada', notaNueva: '9' })

    expect(res.headers.get('location')).toContain('error=FORBIDDEN')
    const unchanged = await prisma.solicitudesRecalificacion.findUnique({ where: { SolicitudID: solicitud.SolicitudID } })
    expect(unchanged?.Estado).toBe('Pendiente')
  })

  it('redirige a /login si no hay sesión', async () => {
    vi.mocked(getSession).mockResolvedValue(null)

    const res = await postResolve(solicitud.SolicitudID, { decision: 'Aprobada', notaNueva: '9' })

    expect(res.headers.get('location')).toContain('/login')
  })

  it('redirige a /login si el rol no es Profesor', async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: usuarioAlumno.UsuarioID, roleId: 3 })

    const res = await postResolve(solicitud.SolicitudID, { decision: 'Aprobada', notaNueva: '9' })

    expect(res.headers.get('location')).toContain('/login')
  })

  it('bloquea la doble resolución (ALREADY_RESOLVED)', async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: usuarioX.UsuarioID, roleId: 2 })
    await postResolve(solicitud.SolicitudID, { decision: 'Aprobada', notaNueva: '8.5' })

    const res = await postResolve(solicitud.SolicitudID, { decision: 'Rechazada' })

    expect(res.headers.get('location')).toContain('error=ALREADY_RESOLVED')
    const stillApproved = await prisma.solicitudesRecalificacion.findUnique({ where: { SolicitudID: solicitud.SolicitudID } })
    expect(stillApproved?.Estado).toBe('Aprobada')
    expect(stillApproved?.NotaNueva).toBe(8.5)
  })

  it('responde NOTA_INVALIDA al aprobar sin una nota válida', async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: usuarioX.UsuarioID, roleId: 2 })

    const res = await postResolve(solicitud.SolicitudID, { decision: 'Aprobada', notaNueva: '15' })

    expect(res.headers.get('location')).toContain('error=NOTA_INVALIDA')
    const unchanged = await prisma.solicitudesRecalificacion.findUnique({ where: { SolicitudID: solicitud.SolicitudID } })
    expect(unchanged?.Estado).toBe('Pendiente')
  })

  it('responde NOTA_INVALIDA al aprobar sin enviar notaNueva', async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: usuarioX.UsuarioID, roleId: 2 })

    const res = await postResolve(solicitud.SolicitudID, { decision: 'Aprobada' })

    expect(res.headers.get('location')).toContain('error=NOTA_INVALIDA')
  })

  it('responde INVALID_DECISION para una decisión desconocida', async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: usuarioX.UsuarioID, roleId: 2 })

    const res = await postResolve(solicitud.SolicitudID, { decision: 'Maybe' })

    expect(res.headers.get('location')).toContain('error=INVALID_DECISION')
  })

  it('responde NO_ENCONTRADA para un id de solicitud inexistente', async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: usuarioX.UsuarioID, roleId: 2 })

    const res = await postResolve(999999, { decision: 'Aprobada', notaNueva: '9' })

    expect(res.headers.get('location')).toContain('error=NO_ENCONTRADA')
  })
})
