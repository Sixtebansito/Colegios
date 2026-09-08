import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log(`Start seeding ...`)

  // 1. Roles
  const adminRole = await prisma.roles.upsert({ where: { Nombre: 'Administrador' }, update: {}, create: { Nombre: 'Administrador' } })
  const profRole = await prisma.roles.upsert({ where: { Nombre: 'Profesor' }, update: {}, create: { Nombre: 'Profesor' } })
  const alumnoRole = await prisma.roles.upsert({ where: { Nombre: 'Alumno' }, update: {}, create: { Nombre: 'Alumno' } })

  // 2. Catalogos (Estados)
  const estadoActivo = await prisma.catalogos.create({ data: { id: 2, Nombre: 'Estado', Valor: 'Activo' } })

  const hash = await bcrypt.hash('123456', 10)

  // 3. Usuarios
  const admin = await prisma.usuarios.create({
    data: { Cedula: 'admin', PasswordHash: hash, RoleID: adminRole.RoleID, EstadoID: estadoActivo.id }
  })

  const profesor = await prisma.usuarios.create({
    data: {
      Cedula: 'profesor1', PasswordHash: hash, RoleID: profRole.RoleID, EstadoID: estadoActivo.id,
      profesor: {
        create: { Nombre: 'Juan', Apellido: 'Pérez', Email: 'juan@colegios.com', Telefono: '0999999999', Especialidad: 'Matemáticas' }
      }
    },
    include: { profesor: true }
  })

  const padre = await prisma.padres.create({
    data: { Nombre: 'María', Apellido: 'Gómez', Email: 'maria@gmail.com', Telefono: '0988888888', Direccion: 'Calle Principal 123' }
  })

  // Create Grado & Periodo
  const grado = await prisma.grados.create({ data: { Nombre: '1ro Bachillerato', Paralelo: 'A', CupoMaximo: 30 } })
  const periodo = await prisma.periodos.create({ data: { Nombre: 'Primer Quimestre', AnioLectivo: '2025-2026', EstadoID: estadoActivo.id } })

  const estudiante = await prisma.usuarios.create({
    data: {
      Cedula: 'alumno1', PasswordHash: hash, RoleID: alumnoRole.RoleID, EstadoID: estadoActivo.id,
      estudiante: {
        create: { Nombre: 'Carlos', Apellido: 'Gómez', PadreID: padre.PadreID, GradoID: grado.GradoID }
      }
    },
    include: { estudiante: true }
  })

  // Create Materia
  const materia = await prisma.materias.create({
    data: { Nombre: 'Matemáticas Avanzadas', ProfesorID: profesor.profesor!.ProfesorID, GradoID: grado.GradoID }
  })

  // Matricula
  await prisma.matriculas.create({
    data: { EstudianteID: estudiante.estudiante!.EstudianteID, GradoID: grado.GradoID, AnioLectivo: '2025-2026', Estado: 'Activa' }
  })

  // Tareas con porcentajes
  const tarea1 = await prisma.tareas.create({
    data: { MateriaID: materia.MateriaID, PeriodoID: periodo.PeriodoID, Titulo: 'Ejercicios Álgebra', Descripcion: 'Resolver página 40', Tipo: 'Tarea en Clase', Porcentaje: 33.33 }
  })
  const tarea2 = await prisma.tareas.create({
    data: { MateriaID: materia.MateriaID, PeriodoID: periodo.PeriodoID, Titulo: 'Examen Parcial', Descripcion: 'Examen de medio quimestre', Tipo: 'Prueba', Porcentaje: 33.33 }
  })
  const tarea3 = await prisma.tareas.create({
    data: { MateriaID: materia.MateriaID, PeriodoID: periodo.PeriodoID, Titulo: 'Proyecto Final', Descripcion: 'Investigación', Tipo: 'Tarea Normal', Porcentaje: 33.34 }
  })

  // Entregas (Carlos Gómez entregó todo)
  const e1 = await prisma.entregas.create({
    data: { TareaID: tarea1.TareaID, EstudianteID: estudiante.estudiante!.EstudianteID, TextoRespuesta: 'Listo', Calificacion: 9.0 }
  })
  const e2 = await prisma.entregas.create({
    data: { TareaID: tarea2.TareaID, EstudianteID: estudiante.estudiante!.EstudianteID, TextoRespuesta: 'Listo', Calificacion: 8.5 }
  })
  const e3 = await prisma.entregas.create({
    data: { TareaID: tarea3.TareaID, EstudianteID: estudiante.estudiante!.EstudianteID, TextoRespuesta: 'Listo', Calificacion: 10.0 }
  })

  // Nota final calculada
  const notaFinal = (e1.Calificacion! * (tarea1.Porcentaje / 100)) +
                    (e2.Calificacion! * (tarea2.Porcentaje / 100)) +
                    (e3.Calificacion! * (tarea3.Porcentaje / 100))

  await prisma.notas.create({
    data: { EstudianteID: estudiante.estudiante!.EstudianteID, MateriaID: materia.MateriaID, PeriodoID: periodo.PeriodoID, ProfesorID: profesor.profesor!.ProfesorID, Nota: notaFinal }
  })

  console.log(`Seeding finished.`)
  console.log('Credenciales de acceso (Contraseña: 123456):')
  console.log('- Administrador: admin')
  console.log('- Profesor: profesor1')
  console.log('- Alumno: alumno1')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
