import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const excludeIdStr = searchParams.get('excludeId');
  const excludeId = excludeIdStr ? parseInt(excludeIdStr) : -1;

  try {
    const users = await prisma.usuarios.findMany({
      where: {
        UsuarioID: { not: excludeId }
      },
      select: {
        UsuarioID: true,
        Cedula: true,
        RolID: true,
        profesor: { select: { Nombre: true, Apellido: true } },
        estudiante: { select: { Nombre: true, Apellido: true } },
      }
    });

    const formattedUsers = users.map(u => {
      let name = `Usuario ${u.Cedula}`;
      if (u.profesor) name = `${u.profesor.Nombre} ${u.profesor.Apellido} (Profesor)`;
      if (u.estudiante) name = `${u.estudiante.Nombre} ${u.estudiante.Apellido} (Estudiante)`;
      if (u.RolID === 1) name = `Administrador (${u.Cedula})`;

      return {
        id: u.UsuarioID,
        name
      };
    });

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
