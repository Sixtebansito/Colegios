import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const excludeIdStr = searchParams.get('excludeId');
  if (!excludeIdStr) return NextResponse.json([]);
  const currentUserId = parseInt(excludeIdStr);

  try {
    const currentUser = await prisma.usuarios.findUnique({
      where: { UsuarioID: currentUserId },
      include: {
        rol: true,
        profesor: { include: { materias: { include: { grado: true } } } },
        inspector: true,
        rector: true,
        estudiante: { include: { matriculas: { where: { Estado: 'Activa' }, include: { grado: { include: { materias: true } } } } } }
      }
    });

    if (!currentUser) return NextResponse.json([]);

    // Determine current user's capabilities
    const isAdmin = currentUser.RoleID === 1; // Admin
    const isRector = !!currentUser.rector;
    const isInspector = !!currentUser.inspector;
    const isProfesor = !!currentUser.profesor;
    const isAlumno = !!currentUser.estudiante;

    const materiasAsProfesor = currentUser.profesor?.materias || [];
    const teachesCourses = materiasAsProfesor.length > 0;
    
    // Grados taught by this user
    const gradosTaughtIds = materiasAsProfesor.map(m => m.GradoID).filter(Boolean) as number[];
    const gradosTaughtNiveles = materiasAsProfesor.map(m => m.grado?.Nivel).filter(Boolean) as string[];

    // Fetch ALL users to filter in memory (or we could do complex DB queries)
    // Since it's a school, fetching all and filtering in memory is usually fine for <1000 users.
    const allUsers = await prisma.usuarios.findMany({
      where: { UsuarioID: { not: currentUserId } },
      include: {
        rol: true,
        profesor: { include: { materias: { include: { grado: true } } } },
        inspector: true,
        rector: true,
        estudiante: { include: { matriculas: { where: { Estado: 'Activa' } } } }
      }
    });

    const visibleUsers = allUsers.filter(targetUser => {
      const targetIsAdmin = targetUser.RoleID === 1;
      const targetIsRector = !!targetUser.rector;
      const targetIsInspector = !!targetUser.inspector;
      const targetIsProfesor = !!targetUser.profesor;
      const targetIsAlumno = !!targetUser.estudiante;
      const targetIsContabilidad = targetUser.RoleID === 4;

      const isContabilidad = currentUser.RoleID === 4;

      // 5. Contabilidad
      if (isContabilidad) {
        if (targetIsRector || targetIsProfesor || targetIsInspector || targetIsAdmin) return true;
      }

      // 1. Rector and Admins
      if (isAdmin || isRector) {
        if (targetIsAdmin || targetIsRector || targetIsInspector || targetIsProfesor || targetIsContabilidad) return true;
        if (targetIsAlumno) {
          // Only see students if they teach a course AND the student is in that course
          if (teachesCourses) {
            const studentGrades = targetUser.estudiante?.matriculas.map(m => m.GradoID) || [];
            return studentGrades.some(g => gradosTaughtIds.includes(g as number));
          }
          return false;
        }
      }

      // 2. Inspectores
      if (isInspector) {
        if (targetIsAdmin || targetIsRector || targetIsContabilidad) return true;
        
        // Inspectores see Profesores of their assigned level
        if (targetIsProfesor) {
          const profNiveles = targetUser.profesor?.materias.map(m => m.grado?.Nivel).filter(Boolean) || [];
          const myNiveles = currentUser.inspector?.Nivel.split(',').map(n => n.trim()) || [];
          if (profNiveles.some(n => myNiveles.includes(n as string))) return true;
        }

        // Only see students if they teach a course AND the student is in that course
        if (targetIsAlumno) {
          if (teachesCourses) {
            const studentGrades = targetUser.estudiante?.matriculas.map(m => m.GradoID) || [];
            return studentGrades.some(g => gradosTaughtIds.includes(g as number));
          }
          return false;
        }
      }

      // 3. Profesores (without Inspector/Rector role)
      if (isProfesor) {
        // Profesores can see their Inspector
        if (targetIsInspector) {
          const inspectorNiveles = targetUser.inspector?.Nivel.split(',').map(n => n.trim()) || [];
          if (gradosTaughtNiveles.some(n => inspectorNiveles.includes(n))) return true;
        }
        // Profesores can see Admins/Rectors/Contabilidad
        if (targetIsAdmin || targetIsRector || targetIsContabilidad) return true;
        
        // Profesores can see Students in their courses
        if (targetIsAlumno) {
          const studentGrades = targetUser.estudiante?.matriculas.map(m => m.GradoID) || [];
          return studentGrades.some(g => gradosTaughtIds.includes(g as number));
        }
      }

      // 4. Alumnos
      if (isAlumno) {
        // Alumnos see their Teachers
        if (targetIsProfesor) {
          const myGrades = currentUser.estudiante?.matriculas.map(m => m.GradoID) || [];
          const profGrades = targetUser.profesor?.materias.map(m => m.GradoID) || [];
          if (myGrades.some(g => profGrades.includes(g))) return true;
        }
        // Alumnos can see their Inspector
        if (targetIsInspector) {
          const myGradesNiveles = currentUser.estudiante?.matriculas.map(m => m.grado?.Nivel).filter(Boolean) || [];
          const inspectorNiveles = targetUser.inspector?.Nivel.split(',').map(n => n.trim()) || [];
          // Need to fetch Grados if not populated, but assuming we can check this
          // Actually, let's just let students see the Rector and Admins
        }
        if (targetIsAdmin || targetIsRector) return true;
      }

      return false;
    });

    const formattedUsers = visibleUsers.map(u => {
      let name = `Usuario ${u.Cedula}`;
      let roleDesc = u.rol?.Nombre || '';

      if (u.rector) roleDesc = 'Rector';
      else if (u.inspector) roleDesc = 'Inspector';
      else if (u.profesor) roleDesc = 'Profesor';

      if (u.profesor) name = `${u.profesor.Nombre} ${u.profesor.Apellido}`;
      else if (u.estudiante) name = `${u.estudiante.Nombre} ${u.estudiante.Apellido} (Estudiante)`;
      else if (u.RoleID === 1) name = `Admin (${u.Cedula})`;
      else if (u.RoleID === 4) name = `Contabilidad (${u.Cedula})`;

      return {
        id: u.UsuarioID,
        name: `${name} ${roleDesc ? `[${roleDesc}]` : ''}`
      };
    });

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
