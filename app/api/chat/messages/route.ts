import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { pusherServer } from '@/lib/pusher';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { RoomID, SenderID, Content, AttachmentUrl, AttachmentType } = body;

    if (!RoomID || !SenderID) {
      return NextResponse.json({ error: 'RoomID and SenderID are required' }, { status: 400 });
    }

    if (!Content && !AttachmentUrl) {
      return NextResponse.json({ error: 'Message must have content or attachment' }, { status: 400 });
    }

    const newMessage = await prisma.chatMessage.create({
      data: {
        RoomID,
        SenderID,
        Content,
        AttachmentUrl,
        AttachmentType,
      },
      include: {
        Sender: {
          select: {
            UsuarioID: true,
            Cedula: true,
            profesor: { select: { Nombre: true, Apellido: true } },
            estudiante: { select: { Nombre: true, Apellido: true } },
            // If they are admin, we'd pull from Roles or general names, but for now Cedula as fallback
          }
        }
      }
    });

    // Notify all clients subscribed to this room's channel
    try {
      await pusherServer.trigger(`room-${RoomID}`, 'new-message', newMessage);
    } catch (pusherError) {
      console.warn('Pusher trigger failed (maybe not configured), but message was saved:', pusherError);
    }

    return NextResponse.json(newMessage);
  } catch (error) {
    console.error('Error in message creation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roomIdStr = searchParams.get('roomId');

  if (!roomIdStr) {
    return NextResponse.json({ error: 'roomId is required' }, { status: 400 });
  }

  try {
    const messages = await prisma.chatMessage.findMany({
      where: { RoomID: parseInt(roomIdStr) },
      orderBy: { CreatedAt: 'asc' },
      include: {
        Sender: {
          select: {
            UsuarioID: true,
            Cedula: true,
            profesor: { select: { Nombre: true, Apellido: true } },
            estudiante: { select: { Nombre: true, Apellido: true } },
          }
        }
      }
    });
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
