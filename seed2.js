const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
  const hash = await bcrypt.hash('123456', 10);
  
  // Create a dedicated Rector
  let rectorUser = await prisma.usuarios.findFirst({ where: { Cedula: 'rector1' } });
  if (!rectorUser) {
    rectorUser = await prisma.usuarios.create({
      data: {
        Cedula: 'rector1',
        PasswordHash: hash,
        RoleID: 1 // Admin
      }
    });
  }
  
  await prisma.rectores.upsert({
    where: { UsuarioID: rectorUser.UsuarioID },
    update: {},
    create: { UsuarioID: rectorUser.UsuarioID }
  });

  console.log('Created rector1');

  // Assign alumno1 to all Grados just in case they aren't
  const alumnoUser = await prisma.usuarios.findFirst({ where: { Cedula: 'alumno1' } });
  const estudiante = await prisma.estudiantes.findFirst({ where: { UsuarioID: alumnoUser.UsuarioID } });
  const grados = await prisma.grados.findMany();
  
  if (estudiante) {
    for (const grado of grados) {
      const exists = await prisma.matriculas.findFirst({
        where: { EstudianteID: estudiante.EstudianteID, GradoID: grado.GradoID }
      });
      if (!exists) {
        await prisma.matriculas.create({
          data: { EstudianteID: estudiante.EstudianteID, GradoID: grado.GradoID, Estado: 'Activa' }
        });
      }
    }
    console.log('Assigned alumno1 to all grados');
  }

  // Create more Horarios for 1ro BGU to fix "en el horario solo tiene 1 clase"
  const grado1ro = grados.find(g => g.Nombre === '1ro BGU');
  if (grado1ro) {
    const materias = await prisma.materias.findMany({ where: { GradoID: grado1ro.GradoID } });
    if (materias.length > 0) {
      const mat = materias[0];
      await prisma.horarios.createMany({
        data: [
          { GradoID: grado1ro.GradoID, MateriaID: mat.MateriaID, DiaSemana: 'Lunes', HoraInicio: '08:00', HoraFin: '09:00' },
          { GradoID: grado1ro.GradoID, MateriaID: mat.MateriaID, DiaSemana: 'Lunes', HoraInicio: '09:00', HoraFin: '10:00' },
          { GradoID: grado1ro.GradoID, MateriaID: mat.MateriaID, DiaSemana: 'Miercoles', HoraInicio: '10:00', HoraFin: '11:00' },
        ]
      });
      console.log('Added more classes to 1ro BGU schedule');
    }
  }

}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
