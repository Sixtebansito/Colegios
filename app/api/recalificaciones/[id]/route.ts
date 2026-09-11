import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';
import { canResolve, parseDecision, validateNotaNueva } from '@/lib/recalificaciones';

// El Profesor aprueba o rechaza una solicitud de recalificación sobre una nota que él registró.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.roleId !== 2) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const profesor = await prisma.profesores.findUnique({
      where: { UsuarioID: session.userId as number },
    });
    if (!profesor) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const { id } = await params;
    const solicitudId = parseInt(id, 10);

    const errorRedirect = (code: string) =>
      NextResponse.redirect(new URL(`/profesor/recalificaciones?error=${code}`, request.url));

    if (Number.isNaN(solicitudId)) {
      return errorRedirect('NO_ENCONTRADA');
    }

    const formData = await request.formData();
    const decisionRaw = formData.get('decision') as string | null;
    const notaNuevaRaw = formData.get('notaNueva') as string | null;
    const comentario = (formData.get('comentario') as string | null) || null;

    const solicitud = await prisma.solicitudesRecalificacion.findUnique({
      where: { SolicitudID: solicitudId },
      include: { nota: true },
    });

    if (!solicitud || !solicitud.nota) {
      return errorRedirect('NO_ENCONTRADA');
    }

    // Nunca confiar en el id de la URL: se re-verifica que la nota detrás de
    // esta solicitud pertenezca al profesor logueado.
    if (solicitud.nota.ProfesorID !== profesor.ProfesorID) {
      return errorRedirect('FORBIDDEN');
    }

    const resolveCheck = canResolve(solicitud.Estado, decisionRaw ?? '');
    if (!resolveCheck.valid) {
      return errorRedirect(resolveCheck.code!);
    }

    const decision = parseDecision(decisionRaw)!;
    let notaNueva: number | null = null;

    if (decision === 'Aprobada') {
      notaNueva = parseFloat(notaNuevaRaw ?? '');
      const notaCheck = validateNotaNueva(notaNueva);
      if (!notaCheck.valid) {
        return errorRedirect(notaCheck.code!);
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.solicitudesRecalificacion.update({
        where: { SolicitudID: solicitudId },
        data: {
          Estado: decision,
          NotaNueva: decision === 'Aprobada' ? notaNueva : null,
          ComentarioProfesor: comentario,
          FechaResolucion: new Date(),
        },
      });

      if (decision === 'Aprobada') {
        await tx.notas.update({
          where: { NotaID: solicitud.NotaID! },
          data: { Nota: notaNueva! },
        });
      }
    });

    return NextResponse.redirect(new URL('/profesor/recalificaciones', request.url));
  } catch (error) {
    console.error('Error resolving solicitud de recalificacion:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
