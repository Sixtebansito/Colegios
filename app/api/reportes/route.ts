import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const inspector = await prisma.inspectores.findUnique({
      where: { UsuarioID: session.userId as number }
    });

    if (!inspector) {
      return NextResponse.json({ error: 'No eres inspector' }, { status: 403 });
    }

    const body = await request.json();
    const { EstudianteID, Motivo, Gravedad, Comentarios } = body;

    if (!EstudianteID || !Motivo || !Gravedad) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const reporte = await prisma.reportesDisciplinarios.create({
      data: {
        InspectorID: inspector.InspectorID,
        EstudianteID: parseInt(EstudianteID),
        Motivo,
        Gravedad,
        Comentarios
      }
    });

    return NextResponse.json({ success: true, reporte });
  } catch (error) {
    console.error('Error creating reporte:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
