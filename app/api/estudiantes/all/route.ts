import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireApiRole } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await requireApiRole([1, 2]); // Admin and Profesor can fetch all students
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const estudiantes = await prisma.estudiantes.findMany({
      include: {
        grado: true
      },
      orderBy: {
        Apellido: 'asc'
      }
    });

    return NextResponse.json(estudiantes);
  } catch (error) {
    console.error('Error fetching estudiantes:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
