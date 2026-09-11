const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Grados...');
  const grado8vo = await prisma.grados.create({
    data: { Nombre: '8vo EGB', Nivel: 'Octavo', Paralelo: 'A' }
  });
  
  // Try to find 1ro BGU or rename existing
  let grado1ro = await prisma.grados.findFirst({ where: { Nombre: '1ro Bachillerato' } });
  if (grado1ro) {
    grado1ro = await prisma.grados.update({
      where: { GradoID: grado1ro.GradoID },
      data: { Nombre: '1ro BGU', Nivel: 'Primero BGU' }
    });
  } else {
    grado1ro = await prisma.grados.create({
      data: { Nombre: '1ro BGU', Nivel: 'Primero BGU', Paralelo: 'A' }
    });
  }

  const grado3ro = await prisma.grados.create({
    data: { Nombre: '3ro BGU', Nivel: 'Tercero BGU', Paralelo: 'A' }
  });

  console.log('Seeding Materias...');
  const mat8vo = await prisma.materias.create({
    data: { Nombre: 'Matemáticas 8vo', GradoID: grado8vo.GradoID, ProfesorID: 1 } // Assuming ProfesorID 1 is profesor1
  });
  const mat1ro = await prisma.materias.create({
    data: { Nombre: 'Física 1ro', GradoID: grado1ro.GradoID, ProfesorID: 1 }
  });
  const mat3ro = await prisma.materias.create({
    data: { Nombre: 'Química 3ro', GradoID: grado3ro.GradoID, ProfesorID: 2 } // Assuming ProfesorID 2 is profesor2
  });

  console.log('Seeding Horarios...');
  await prisma.horarios.createMany({
    data: [
      { GradoID: grado8vo.GradoID, MateriaID: mat8vo.MateriaID, DiaSemana: 'Lunes', HoraInicio: '07:00', HoraFin: '08:00' },
      { GradoID: grado1ro.GradoID, MateriaID: mat1ro.MateriaID, DiaSemana: 'Martes', HoraInicio: '08:00', HoraFin: '09:00' },
      { GradoID: grado3ro.GradoID, MateriaID: mat3ro.MateriaID, DiaSemana: 'Miercoles', HoraInicio: '09:00', HoraFin: '10:00' },
    ]
  });

  console.log('Seeding Inspectores...');
  // Inspector 1 for 8vo EGB and 1ro BGU -> We need two Inspector entries or one that covers both?
  // Wait, Inspector table has Nivel string. We can create multiple Inspectores records for the same Usuario if we need to? Wait, InspectorID has a UNIQUE constraint on UsuarioID!
  // Let's check schema.prisma: `UsuarioID Int @unique`. This means one user can only have ONE Inspector profile.
  // Then the `Nivel` must be a string that says "8vo EGB, 1ro BGU".
  
  await prisma.inspectores.upsert({
    where: { UsuarioID: 2 }, // Profesor1 (UsuarioID: 2)
    update: { Nivel: '8vo EGB, 1ro BGU' },
    create: { UsuarioID: 2, Nivel: '8vo EGB, 1ro BGU' }
  });

  await prisma.inspectores.upsert({
    where: { UsuarioID: 7 }, // Profesor2 (UsuarioID: 7)
    update: { Nivel: '3ro BGU' },
    create: { UsuarioID: 7, Nivel: '3ro BGU' }
  });

  console.log('Seeding Rectores...');
  await prisma.rectores.upsert({
    where: { UsuarioID: 1 }, // Admin (UsuarioID: 1) as Rector
    update: {},
    create: { UsuarioID: 1 }
  });

  console.log('Data seeded successfully!');
}

main().catch(e => {
  console.error(e);
}).finally(() => {
  prisma.$disconnect();
});
