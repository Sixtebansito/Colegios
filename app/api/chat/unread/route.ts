import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session || !session.userId) {
      return NextResponse.json({ unreadCount: 0 })
    }

    // Find all chat rooms the user is part of
    const memberships = await prisma.chatRoomMember.findMany({
      where: { UsuarioID: session.userId as number },
      include: {
        Room: {
          include: {
            Messages: {
              orderBy: { CreatedAt: 'desc' },
              take: 1
            }
          }
        }
      }
    })

    let unreadCount = 0;

    for (const membership of memberships) {
      const lastMessage = membership.Room.Messages[0];
      if (!lastMessage) continue;
      
      // If the last message is from someone else and it's newer than LastReadAt
      if (lastMessage.SenderID !== session.userId) {
        if (!membership.LastReadAt || lastMessage.CreatedAt > membership.LastReadAt) {
          unreadCount++;
        }
      }
    }

    return NextResponse.json({ unreadCount })
  } catch (error) {
    console.error('Error fetching unread count:', error)
    return NextResponse.json({ unreadCount: 0 }, { status: 500 })
  }
}
