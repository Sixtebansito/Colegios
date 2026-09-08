import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.roleId !== 2) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const formData = await request.formData();
    const estudianteId = parseInt(formData.get('estudianteId') as string);
    const materiaId = parseInt(formData.get('materiaId') as string);
    const periodoId = parseInt(formData.get('periodoId') as string);
    const nota = parseFloat(formData.get('nota') as string);

    await prisma.notas.upsert({
      where: {
        EstudianteID_MateriaID_PeriodoID: {
          EstudianteID: estudianteId,
          MateriaID: materiaId,
          PeriodoID: periodoId,
        }
      },
      update: { Nota: nota },
      create: {
        EstudianteID: estudianteId,
        MateriaID: materiaId,
        PeriodoID: periodoId,
        ProfesorID: session.userId as number,
        Nota: nota
      }
    });

    return NextResponse.redirect(new URL(`/profesor/calificaciones?materia=${materiaId}&periodo=${periodoId}`, request.url));
  } catch (error) {
    console.error('Error overriding nota:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
