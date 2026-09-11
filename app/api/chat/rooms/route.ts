import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// Obtener todas las salas a las que pertenece un usuario
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userIdStr = searchParams.get('userId');

  if (!userIdStr) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  const userId = parseInt(userIdStr);

  try {
    const rooms = await prisma.chatRoom.findMany({
      where: {
        Members: {
          some: { UsuarioID: userId }
        }
      },
      include: {
        Members: {
          include: {
            Usuario: {
              select: {
                UsuarioID: true,
                Cedula: true,
                profesor: { select: { Nombre: true, Apellido: true } },
                estudiante: { select: { Nombre: true, Apellido: true } },
              }
            }
          }
        },
        Messages: {
          orderBy: { CreatedAt: 'desc' },
          take: 1
        },
        _count: {
          select: { Messages: true }
        }
      }
    });

    const roomsWithUnread = rooms.map(room => {
      const myMembership = room.Members.find(m => m.UsuarioID === userId);
      const lastMessage = room.Messages[0];
      let hasUnread = false;

      if (lastMessage && lastMessage.SenderID !== userId) {
        if (!myMembership?.LastReadAt || lastMessage.CreatedAt > myMembership.LastReadAt) {
          hasUnread = true;
        }
      }

      return {
        ...room,
        hasUnread
      };
    });

    return NextResponse.json(roomsWithUnread);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Crear una nueva sala (ej: Chat privado con profesor)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { Name, Type, MemberIds } = body; 
    // MemberIds: array de UsuarioID que pertenecerán a la sala

    if (!MemberIds || !Array.isArray(MemberIds) || MemberIds.length === 0) {
      return NextResponse.json({ error: 'MemberIds must be an array of user IDs' }, { status: 400 });
    }

    const newRoom = await prisma.chatRoom.create({
      data: {
        Name: Name || null,
        Type: Type || 'GROUP',
        Members: {
          create: MemberIds.map(id => ({ UsuarioID: id }))
        }
      },
      include: {
        Members: true
      }
    });

    return NextResponse.json(newRoom);
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
