import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';
import { pusherServer } from '@/lib/pusher';
import { validateMotivo } from '@/lib/recalificaciones';

// El Alumno crea una solicitud de recalificación sobre una de sus propias notas.
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.roleId !== 3) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const estudiante = await prisma.estudiantes.findUnique({
      where: { UsuarioID: session.userId as number },
    });
    if (!estudiante) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const formData = await request.formData();
    const notaIdRaw = formData.get('notaId') as string | null;
    const motivo = formData.get('motivo') as string | null;
    const notaId = parseInt(notaIdRaw ?? '', 10);

    if (Number.isNaN(notaId)) {
      return NextResponse.redirect(new URL('/alumno/recalificaciones', request.url));
    }

    const errorRedirect = (code: string) =>
      NextResponse.redirect(
        new URL(`/alumno/recalificaciones/nueva?notaId=${notaId}&error=${code}`, request.url)
      );

    const nota = await prisma.notas.findUnique({
      where: { NotaID: notaId },
      include: {
        recalifs: true,
        estudiante: { include: { padre: true } },
        materia: true,
        profesor: true,
      },
    });

    if (!nota) {
      return errorRedirect('NOTA_NO_ENCONTRADA');
    }

    // Nunca confiar en el notaId que llega del cliente: se re-verifica en el
    // servidor que la nota pertenezca al estudiante logueado.
    if (nota.EstudianteID !== estudiante.EstudianteID) {
      return errorRedirect('FORBIDDEN');
    }

    if (nota.recalifs.some((r) => r.Estado === 'Pendiente')) {
      return errorRedirect('DUPLICADO');
    }

    const motivoCheck = validateMotivo(motivo);
    if (!motivoCheck.valid) {
      return errorRedirect(motivoCheck.code!);
    }

    await prisma.solicitudesRecalificacion.create({
      data: {
        NotaID: nota.NotaID,
        PadreID: nota.estudiante?.padre?.PadreID ?? null,
        Motivo: motivo!.trim(),
        Estado: 'Pendiente',
        NotaAnterior: nota.Nota,
      },
    });

    // Además de quedar registrada como Pendiente, la solicitud abre (o reutiliza)
    // un chat directo alumno-profesor para que puedan aclarar el proceso ahí mismo.
    // Un profesor sin cuenta de login (UsuarioID null) simplemente no tiene chat.
    const profesorUsuarioId = nota.profesor?.UsuarioID;
    let roomId: number | null = null;

    if (profesorUsuarioId) {
      let room = await prisma.chatRoom.findFirst({
        where: {
          Type: 'DIRECT',
          AND: [
            { Members: { some: { UsuarioID: session.userId as number } } },
            { Members: { some: { UsuarioID: profesorUsuarioId } } },
          ],
        },
      });

      if (!room) {
        room = await prisma.chatRoom.create({
          data: {
            Type: 'DIRECT',
            Members: {
              create: [{ UsuarioID: session.userId as number }, { UsuarioID: profesorUsuarioId }],
            },
          },
        });
      }

      const newMessage = await prisma.chatMessage.create({
        data: {
          RoomID: room.RoomID,
          SenderID: session.userId as number,
          Content: `📋 Nueva solicitud de recalificación pendiente — ${nota.materia?.Nombre ?? 'materia'}: "${motivo!.trim()}"`,
        },
      });

      try {
        await pusherServer.trigger(`room-${room.RoomID}`, 'new-message', newMessage);
      } catch (pusherError) {
        console.warn('Pusher trigger failed (maybe not configured), but message was saved:', pusherError);
      }

      roomId = room.RoomID;
    }

    const successUrl = roomId
      ? `/alumno/recalificaciones?chat=${roomId}`
      : '/alumno/recalificaciones';

    return NextResponse.redirect(new URL(successUrl, request.url));
  } catch (error) {
    console.error('Error creating solicitud de recalificacion:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
