import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Generando malla curricular de 10 materias...')

  // Obtener todos los grados
  const grados = await prisma.grados.findMany()
  const profesores = await prisma.profesores.findMany()
  
  if (profesores.length === 0) {
    console.error("No hay profesores para asignar materias.")
    return
  }

  const subjectNames = [
    'Lengua y Literatura',
    'Ciencias Naturales',
    'Estudios Sociales',
    'Educación Física',
    'Inglés',
    'Educación Cultural y Artística',
    'Computación / Informática',
    'Desarrollo Humano Integral',
    'Física'
  ] // Total 9, + Matemáticas (ya existente) = 10

  for (const grado of grados) {
    const existing = await prisma.materias.count({ where: { GradoID: grado.GradoID } })
    console.log(`El grado ${grado.Nombre} tiene ${existing} materias.`)

    // Agregamos las que faltan (evitar duplicados por nombre)
    for (let i = 0; i < subjectNames.length; i++) {
      const nombre = subjectNames[i]
      const profIndex = i % profesores.length
      
      const exists = await prisma.materias.findFirst({
        where: { GradoID: grado.GradoID, Nombre: nombre }
      })

      if (!exists) {
        await prisma.materias.create({
          data: {
            Nombre: nombre,
            Descripcion: `Asignatura de ${nombre}`,
            GradoID: grado.GradoID,
            ProfesorID: profesores[profIndex].ProfesorID
          }
        })
      }
    }
  }

  console.log('Malla curricular actualizada a 10 materias.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
