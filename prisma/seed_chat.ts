import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding chat rooms...')

  // Get all users
  const usuarios = await prisma.usuarios.findMany()

  if (usuarios.length === 0) {
    console.log('No users found. Please run main seed first.')
    return
  }

  // Create a Global Chat Room
  const globalRoom = await prisma.chatRoom.create({
    data: {
      Name: 'Chat Global de la Plataforma',
      Type: 'GROUP',
      Members: {
        create: usuarios.map(u => ({ UsuarioID: u.UsuarioID }))
      }
    }
  })

  // Create a welcome message
  await prisma.chatMessage.create({
    data: {
      RoomID: globalRoom.RoomID,
      SenderID: usuarios[0].UsuarioID, // admin
      Content: '¡Bienvenidos al nuevo EVA! Este es el chat global para consultas generales.'
    }
  })

  console.log('Chat global creado exitosamente.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
