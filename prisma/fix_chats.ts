import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Limpiando chats duplicados o viejos...')
  
  await prisma.chatMessage.deleteMany()
  await prisma.chatRoomMember.deleteMany()
  await prisma.chatRoom.deleteMany()

  const adminRole = await prisma.roles.findUnique({ where: { Nombre: 'Administrador' } })
  
  if (adminRole) {
    const admin = await prisma.usuarios.findFirst({ where: { RoleID: adminRole.RoleID } })
    
    // 1. Chat Global
    if (admin) {
      const globalRoom = await prisma.chatRoom.create({
        data: { Name: 'Chat Global de la Plataforma', Type: 'GROUP' }
      })
      const todos = await prisma.usuarios.findMany()
      await prisma.chatRoomMember.createMany({
        data: todos.map(u => ({ RoomID: globalRoom.RoomID, UsuarioID: u.UsuarioID }))
      })
      console.log('Chat global creado.')
    }
  }

  // 2. Chat por Curso (Grado)
  const grados = await prisma.grados.findMany({ include: { materias: true } })
  for (const grado of grados) {
    // Buscar profesor titular o alguien que lo cree
    const adminUser = await prisma.usuarios.findFirst({ where: { RoleID: 1 } })
    if (!adminUser) continue

    const gradoRoom = await prisma.chatRoom.create({
      data: { Name: `Curso: ${grado.Nombre} "${grado.Paralelo}"`, Type: 'GROUP' }
    })

    // Alumnos del grado
    const matriculas = await prisma.matriculas.findMany({
      where: { GradoID: grado.GradoID },
      include: { estudiante: true }
    })

    const usuariosIds = new Set<number>()
    // Alumnos
    matriculas.forEach(m => usuariosIds.add(m.estudiante.UsuarioID))
    // Profesores de este grado (via materias)
    for (const materia of grado.materias) {
      if (materia.ProfesorID) {
        const profInfo = await prisma.profesores.findUnique({ where: { ProfesorID: materia.ProfesorID }})
        if (profInfo) usuariosIds.add(profInfo.UsuarioID)
      }
    }
    // Admin (creador)
    usuariosIds.add(adminUser.UsuarioID)

    const membersData = Array.from(usuariosIds).map(uid => ({ RoomID: gradoRoom.RoomID, UsuarioID: uid }))
    if (membersData.length > 0) {
      await prisma.chatRoomMember.createMany({ data: membersData })
      console.log(`Chat de curso ${grado.Nombre} ${grado.Paralelo} creado con ${membersData.length} miembros.`)
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
