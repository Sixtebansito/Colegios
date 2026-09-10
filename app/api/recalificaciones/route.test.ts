import { randomUUID } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/auth', () => ({ getSession: vi.fn() }))

import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { POST } from './route'

const VALID_MOTIVO = 'Considero que el examen tuvo un error de suma en la pregunta 3.'

function postRecalificacion(notaId: number | string, motivo: string) {
  const formData = new FormData()
  formData.set('notaId', String(notaId))
  formData.set('motivo', motivo)
  const request = new Request('http://localhost/api/recalificaciones', {
    method: 'POST',
    body: formData,
  })
  return POST(request)
}

describe('POST /api/recalificaciones', () => {
  let padre: Awaited<ReturnType<typeof prisma.padres.create>>
  let usuarioA: Awaited<ReturnType<typeof prisma.usuarios.create>>
  let usuarioB: Awaited<ReturnType<typeof prisma.usuarios.create>>
  let usuarioProf: Awaited<ReturnType<typeof prisma.usuarios.create>>
  let estudianteA: Awaited<ReturnType<typeof prisma.estudiantes.create>>
  let estudianteB: Awaited<ReturnType<typeof prisma.estudiantes.create>>
  let profesor: Awaited<ReturnType<typeof prisma.profesores.create>>
  let materia: Awaited<ReturnType<typeof prisma.materias.create>>
  let periodo: Awaited<ReturnType<typeof prisma.periodos.create>>
  let notaA: Awaited<ReturnType<typeof prisma.notas.create>>
  // Solo usados por el test del profesor sin cuenta de usuario (UsuarioID null).
  let extraProfesorId: number | null
  let extraMateriaId: number | null

  beforeEach(async () => {
    extraProfesorId = null
    extraMateriaId = null
    padre = await prisma.padres.create({ data: { Nombre: 'María', Apellido: 'Gómez' } })

    usuarioA = await prisma.usuarios.create({
      data: { Cedula: `alumnoA-${randomUUID()}`, PasswordHash: 'x', EstadoID: null },
    })
    usuarioB = await prisma.usuarios.create({
      data: { Cedula: `alumnoB-${randomUUID()}`, PasswordHash: 'x', EstadoID: null },
    })
    usuarioProf = await prisma.usuarios.create({
      data: { Cedula: `prof-${randomUUID()}`, PasswordHash: 'x', EstadoID: null },
    })

    estudianteA = await prisma.estudiantes.create({
      data: {
        UsuarioID: usuarioA.UsuarioID,
        Nombre: 'Carlos',
        Apellido: 'Gómez',
        PadreID: padre.PadreID,
        EstadoID: null,
      },
    })
    estudianteB = await prisma.estudiantes.create({
      data: { UsuarioID: usuarioB.UsuarioID, Nombre: 'Ana', Apellido: 'Ruiz', EstadoID: null },
    })

    profesor = await prisma.profesores.create({
      data: { UsuarioID: usuarioProf.UsuarioID, Nombre: 'Juan', Apellido: 'Pérez' },
    })
    materia = await prisma.materias.create({ data: { Nombre: 'Matemáticas', ProfesorID: profesor.ProfesorID } })
    periodo = await prisma.periodos.create({ data: { Nombre: 'Primer Quimestre', EstadoID: null } })

    notaA = await prisma.notas.create({
      data: {
        EstudianteID: estudianteA.EstudianteID,
        MateriaID: materia.MateriaID,
        PeriodoID: periodo.PeriodoID,
        ProfesorID: profesor.ProfesorID,
        Nota: 7.5,
      },
    })
  })

  afterEach(async () => {
    const chatUserIds = [usuarioA.UsuarioID, usuarioB.UsuarioID, usuarioProf.UsuarioID]
    const rooms = await prisma.chatRoom.findMany({
      where: { Members: { some: { UsuarioID: { in: chatUserIds } } } },
      select: { RoomID: true },
    })
    const roomIds = rooms.map((r) => r.RoomID)
    if (roomIds.length > 0) {
      await prisma.chatMessage.deleteMany({ where: { RoomID: { in: roomIds } } })
      await prisma.chatRoomMember.deleteMany({ where: { RoomID: { in: roomIds } } })
      await prisma.chatRoom.deleteMany({ where: { RoomID: { in: roomIds } } })
    }

    await prisma.solicitudesRecalificacion.deleteMany({
      where: { nota: { EstudianteID: { in: [estudianteA.EstudianteID, estudianteB.EstudianteID] } } },
    })
    await prisma.notas.deleteMany({
      where: { EstudianteID: { in: [estudianteA.EstudianteID, estudianteB.EstudianteID] } },
    })
    if (extraMateriaId) {
      await prisma.materias.delete({ where: { MateriaID: extraMateriaId } })
    }
    if (extraProfesorId) {
      await prisma.profesores.delete({ where: { ProfesorID: extraProfesorId } })
    }
    await prisma.materias.delete({ where: { MateriaID: materia.MateriaID } })
    await prisma.periodos.delete({ where: { PeriodoID: periodo.PeriodoID } })
    await prisma.estudiantes.deleteMany({
      where: { EstudianteID: { in: [estudianteA.EstudianteID, estudianteB.EstudianteID] } },
    })
    await prisma.profesores.delete({ where: { ProfesorID: profesor.ProfesorID } })
    await prisma.usuarios.deleteMany({
      where: { UsuarioID: { in: [usuarioA.UsuarioID, usuarioB.UsuarioID, usuarioProf.UsuarioID] } },
    })
    await prisma.padres.delete({ where: { PadreID: padre.PadreID } })
    vi.clearAllMocks()
  })

  it('happy path: crea la solicitud Pendiente con el PadreID correcto', async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: usuarioA.UsuarioID, roleId: 3 })

    const res = await postRecalificacion(notaA.NotaID, VALID_MOTIVO)

    expect(res.headers.get('location')).toContain('/alumno/recalificaciones')
    const created = await prisma.solicitudesRecalificacion.findFirst({ where: { NotaID: notaA.NotaID } })
    expect(created?.Estado).toBe('Pendiente')
    expect(created?.PadreID).toBe(padre.PadreID)
    expect(created?.NotaAnterior).toBe(7.5)
    expect(created?.Motivo).toBe(VALID_MOTIVO)
  })

  it('no bloquea la creación cuando el estudiante no tiene padre registrado (PadreID null)', async () => {
    const notaB = await prisma.notas.create({
      data: {
        EstudianteID: estudianteB.EstudianteID,
        MateriaID: materia.MateriaID,
        PeriodoID: periodo.PeriodoID,
        ProfesorID: profesor.ProfesorID,
        Nota: 6,
      },
    })
    vi.mocked(getSession).mockResolvedValue({ userId: usuarioB.UsuarioID, roleId: 3 })

    await postRecalificacion(notaB.NotaID, VALID_MOTIVO)

    const created = await prisma.solicitudesRecalificacion.findFirst({ where: { NotaID: notaB.NotaID } })
    expect(created).not.toBeNull()
    expect(created?.PadreID).toBeNull()
  })

  it('bloquea a un alumno que intenta solicitar sobre la nota de otro alumno (FORBIDDEN)', async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: usuarioB.UsuarioID, roleId: 3 })

    const res = await postRecalificacion(notaA.NotaID, VALID_MOTIVO)

    expect(res.headers.get('location')).toContain('error=FORBIDDEN')
    const created = await prisma.solicitudesRecalificacion.findFirst({ where: { NotaID: notaA.NotaID } })
    expect(created).toBeNull()
  })

  it('redirige a /login si no hay sesión', async () => {
    vi.mocked(getSession).mockResolvedValue(null)

    const res = await postRecalificacion(notaA.NotaID, VALID_MOTIVO)

    expect(res.headers.get('location')).toContain('/login')
    const created = await prisma.solicitudesRecalificacion.findFirst({ where: { NotaID: notaA.NotaID } })
    expect(created).toBeNull()
  })

  it('redirige a /login si el rol no es Alumno', async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: usuarioProf.UsuarioID, roleId: 2 })

    const res = await postRecalificacion(notaA.NotaID, VALID_MOTIVO)

    expect(res.headers.get('location')).toContain('/login')
  })

  it('responde NOTA_NO_ENCONTRADA para un notaId inexistente', async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: usuarioA.UsuarioID, roleId: 3 })

    const res = await postRecalificacion(999999, VALID_MOTIVO)

    expect(res.headers.get('location')).toContain('error=NOTA_NO_ENCONTRADA')
  })

  it('bloquea una solicitud duplicada mientras exista una Pendiente para la misma nota', async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: usuarioA.UsuarioID, roleId: 3 })
    await prisma.solicitudesRecalificacion.create({
      data: { NotaID: notaA.NotaID, Motivo: VALID_MOTIVO, Estado: 'Pendiente', NotaAnterior: 7.5 },
    })

    const res = await postRecalificacion(notaA.NotaID, VALID_MOTIVO)

    expect(res.headers.get('location')).toContain('error=DUPLICADO')
    const count = await prisma.solicitudesRecalificacion.count({ where: { NotaID: notaA.NotaID } })
    expect(count).toBe(1)
  })

  it('responde MOTIVO_INVALIDO si el motivo es muy corto', async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: usuarioA.UsuarioID, roleId: 3 })

    const res = await postRecalificacion(notaA.NotaID, 'corto')

    expect(res.headers.get('location')).toContain('error=MOTIVO_INVALIDO')
    const created = await prisma.solicitudesRecalificacion.findFirst({ where: { NotaID: notaA.NotaID } })
    expect(created).toBeNull()
  })

  it('una solicitud ya Rechazada no bloquea una nueva solicitud sobre la misma nota', async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: usuarioA.UsuarioID, roleId: 3 })
    await prisma.solicitudesRecalificacion.create({
      data: {
        NotaID: notaA.NotaID,
        Motivo: VALID_MOTIVO,
        Estado: 'Rechazada',
        NotaAnterior: 7.5,
        FechaResolucion: new Date(),
      },
    })

    const res = await postRecalificacion(notaA.NotaID, VALID_MOTIVO)

    expect(res.headers.get('location')).toContain('/alumno/recalificaciones')
    const count = await prisma.solicitudesRecalificacion.count({ where: { NotaID: notaA.NotaID } })
    expect(count).toBe(2)
  })

  it('abre un chat directo con el profesor y postea un mensaje con el motivo', async () => {
    vi.mocked(getSession).mockResolvedValue({ userId: usuarioA.UsuarioID, roleId: 3 })

    const res = await postRecalificacion(notaA.NotaID, VALID_MOTIVO)

    const room = await prisma.chatRoom.findFirst({
      where: {
        Type: 'DIRECT',
        AND: [
          { Members: { some: { UsuarioID: usuarioA.UsuarioID } } },
          { Members: { some: { UsuarioID: usuarioProf.UsuarioID } } },
        ],
      },
      include: { Members: true, Messages: true },
    })

    expect(room).not.toBeNull()
    expect(room?.Members).toHaveLength(2)
    expect(res.headers.get('location')).toContain(`chat=${room?.RoomID}`)
    expect(room?.Messages).toHaveLength(1)
    expect(room?.Messages[0]?.SenderID).toBe(usuarioA.UsuarioID)
    expect(room?.Messages[0]?.Content).toContain(VALID_MOTIVO)
  })

  it('reutiliza la sala DIRECT existente en vez de crear una nueva', async () => {
    const existingRoom = await prisma.chatRoom.create({
      data: {
        Type: 'DIRECT',
        Members: { create: [{ UsuarioID: usuarioA.UsuarioID }, { UsuarioID: usuarioProf.UsuarioID }] },
      },
    })
    vi.mocked(getSession).mockResolvedValue({ userId: usuarioA.UsuarioID, roleId: 3 })

    const res = await postRecalificacion(notaA.NotaID, VALID_MOTIVO)

    expect(res.headers.get('location')).toContain(`chat=${existingRoom.RoomID}`)
    const roomCount = await prisma.chatRoom.count({
      where: {
        Type: 'DIRECT',
        AND: [
          { Members: { some: { UsuarioID: usuarioA.UsuarioID } } },
          { Members: { some: { UsuarioID: usuarioProf.UsuarioID } } },
        ],
      },
    })
    expect(roomCount).toBe(1)
  })

  it('no crea chat si el profesor de la nota no tiene cuenta de usuario (UsuarioID null)', async () => {
    const profesorSinUsuario = await prisma.profesores.create({ data: { Nombre: 'Sin', Apellido: 'Login' } })
    extraProfesorId = profesorSinUsuario.ProfesorID
    const materiaSinChat = await prisma.materias.create({
      data: { Nombre: 'Filosofía', ProfesorID: profesorSinUsuario.ProfesorID },
    })
    extraMateriaId = materiaSinChat.MateriaID
    const notaSinChat = await prisma.notas.create({
      data: {
        EstudianteID: estudianteA.EstudianteID,
        MateriaID: materiaSinChat.MateriaID,
        PeriodoID: periodo.PeriodoID,
        ProfesorID: profesorSinUsuario.ProfesorID,
        Nota: 8,
      },
    })
    vi.mocked(getSession).mockResolvedValue({ userId: usuarioA.UsuarioID, roleId: 3 })

    const res = await postRecalificacion(notaSinChat.NotaID, VALID_MOTIVO)

    expect(res.headers.get('location')).toContain('/alumno/recalificaciones')
    expect(res.headers.get('location')).not.toContain('chat=')
    const roomCount = await prisma.chatRoom.count({
      where: { Members: { some: { UsuarioID: usuarioA.UsuarioID } } },
    })
    expect(roomCount).toBe(0)
    // notaSinChat y su SolicitudesRecalificacion quedan a cargo del afterEach
    // compartido (EstudianteID coincide con estudianteA); materia/profesor extra
    // se limpian ahí mismo vía extraMateriaId/extraProfesorId.
  })
})
