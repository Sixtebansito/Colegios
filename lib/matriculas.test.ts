import { randomUUID } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import prisma from './db'
import { DEFAULT_ANIO_LECTIVO, getAnioLectivoActual, matricularEstudiante, recalcularGradoEstudiante } from './matriculas'

describe('lib/matriculas', () => {
  let usuario: Awaited<ReturnType<typeof prisma.usuarios.create>>
  let estudiante: Awaited<ReturnType<typeof prisma.estudiantes.create>>
  let gradoA: Awaited<ReturnType<typeof prisma.grados.create>>
  let gradoB: Awaited<ReturnType<typeof prisma.grados.create>>

  beforeEach(async () => {
    usuario = await prisma.usuarios.create({
      data: { Cedula: `alumno-${randomUUID()}`, PasswordHash: 'x', EstadoID: null },
    })
    estudiante = await prisma.estudiantes.create({
      data: { UsuarioID: usuario.UsuarioID, Nombre: 'Ana', Apellido: 'Pérez', EstadoID: null },
    })
    gradoA = await prisma.grados.create({ data: { Nombre: `Grado A ${randomUUID()}`, EstadoID: null } })
    gradoB = await prisma.grados.create({ data: { Nombre: `Grado B ${randomUUID()}`, EstadoID: null } })
  })

  afterEach(async () => {
    await prisma.matriculas.deleteMany({ where: { EstudianteID: estudiante.EstudianteID } })
    await prisma.periodos.deleteMany({ where: { AnioLectivo: { in: ['2030-2031', '2031-2032'] } } })
    // El estudiante debe borrarse antes que los grados: matricularEstudiante
    // deja Estudiantes.GradoID apuntando al grado, y esa FK es NoAction.
    await prisma.estudiantes.delete({ where: { EstudianteID: estudiante.EstudianteID } })
    await prisma.grados.deleteMany({ where: { GradoID: { in: [gradoA.GradoID, gradoB.GradoID] } } })
    await prisma.usuarios.delete({ where: { UsuarioID: usuario.UsuarioID } })
  })

  it('primera matricula: crea una fila Activa y sincroniza Estudiantes.GradoID', async () => {
    await prisma.$transaction(async (tx) => {
      await matricularEstudiante(tx, { estudianteId: estudiante.EstudianteID, gradoId: gradoA.GradoID })
    })

    const matriculas = await prisma.matriculas.findMany({ where: { EstudianteID: estudiante.EstudianteID } })
    expect(matriculas).toHaveLength(1)
    expect(matriculas[0].Estado).toBe('Activa')
    expect(matriculas[0].GradoID).toBe(gradoA.GradoID)

    const actualizado = await prisma.estudiantes.findUnique({ where: { EstudianteID: estudiante.EstudianteID } })
    expect(actualizado?.GradoID).toBe(gradoA.GradoID)
  })

  it('cambiar de grado retira la matricula vieja y crea una nueva Activa', async () => {
    await prisma.$transaction(async (tx) => {
      await matricularEstudiante(tx, { estudianteId: estudiante.EstudianteID, gradoId: gradoA.GradoID })
    })
    await prisma.$transaction(async (tx) => {
      await matricularEstudiante(tx, { estudianteId: estudiante.EstudianteID, gradoId: gradoB.GradoID })
    })

    const matriculas = await prisma.matriculas.findMany({
      where: { EstudianteID: estudiante.EstudianteID },
      orderBy: { MatriculaID: 'asc' },
    })
    expect(matriculas).toHaveLength(2)
    expect(matriculas[0].GradoID).toBe(gradoA.GradoID)
    expect(matriculas[0].Estado).toBe('Retirada')
    expect(matriculas[1].GradoID).toBe(gradoB.GradoID)
    expect(matriculas[1].Estado).toBe('Activa')

    const actualizado = await prisma.estudiantes.findUnique({ where: { EstudianteID: estudiante.EstudianteID } })
    expect(actualizado?.GradoID).toBe(gradoB.GradoID)
  })

  it('des-matricular (gradoId null) retira la Activa y limpia Estudiantes.GradoID', async () => {
    await prisma.$transaction(async (tx) => {
      await matricularEstudiante(tx, { estudianteId: estudiante.EstudianteID, gradoId: gradoA.GradoID })
    })
    await prisma.$transaction(async (tx) => {
      await matricularEstudiante(tx, { estudianteId: estudiante.EstudianteID, gradoId: null })
    })

    const activa = await prisma.matriculas.findFirst({ where: { EstudianteID: estudiante.EstudianteID, Estado: 'Activa' } })
    expect(activa).toBeNull()

    const actualizado = await prisma.estudiantes.findUnique({ where: { EstudianteID: estudiante.EstudianteID } })
    expect(actualizado?.GradoID).toBeNull()
  })

  it('llamar dos veces con el mismo grado no crea una fila duplicada', async () => {
    await prisma.$transaction(async (tx) => {
      await matricularEstudiante(tx, { estudianteId: estudiante.EstudianteID, gradoId: gradoA.GradoID })
    })
    await prisma.$transaction(async (tx) => {
      await matricularEstudiante(tx, { estudianteId: estudiante.EstudianteID, gradoId: gradoA.GradoID })
    })

    const count = await prisma.matriculas.count({ where: { EstudianteID: estudiante.EstudianteID } })
    expect(count).toBe(1)
  })

  it('recalcularGradoEstudiante sincroniza Estudiantes.GradoID tras una edicion directa', async () => {
    await prisma.$transaction(async (tx) => {
      await matricularEstudiante(tx, { estudianteId: estudiante.EstudianteID, gradoId: gradoA.GradoID })
    })

    const matricula = await prisma.matriculas.findFirst({ where: { EstudianteID: estudiante.EstudianteID } })
    await prisma.matriculas.update({ where: { MatriculaID: matricula!.MatriculaID }, data: { Estado: 'Retirada' } })

    await prisma.$transaction(async (tx) => {
      await recalcularGradoEstudiante(tx, estudiante.EstudianteID)
    })

    const actualizado = await prisma.estudiantes.findUnique({ where: { EstudianteID: estudiante.EstudianteID } })
    expect(actualizado?.GradoID).toBeNull()
  })

  it('getAnioLectivoActual devuelve el AnioLectivo del periodo activo mas reciente', async () => {
    await prisma.periodos.create({
      data: { Nombre: 'Periodo viejo test', AnioLectivo: '2030-2031', EstadoID: 2, FechaInicio: new Date('2030-01-01') },
    })
    await prisma.periodos.create({
      data: { Nombre: 'Periodo nuevo test', AnioLectivo: '2031-2032', EstadoID: 2, FechaInicio: new Date('2031-01-01') },
    })

    const anio = await getAnioLectivoActual()
    expect(anio).toBe('2031-2032')
  })

  it('getAnioLectivoActual usa el valor por defecto si no hay periodos activos', async () => {
    // No se crea ningun periodo con EstadoID:2 en este test; el resto de la
    // suite tampoco deja ninguno sin limpiar (ver afterEach de este archivo y
    // los fixtures de recalificaciones, que usan EstadoID: null a proposito).
    const anio = await getAnioLectivoActual()
    expect(anio).toBe(DEFAULT_ANIO_LECTIVO)
  })
})
