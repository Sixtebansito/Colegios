const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding contabilidad...');
  
  // Create some pagos for alumno1
  const alumno1 = await prisma.estudiantes.findFirst({ where: { usuario: { Cedula: 'alumno1' } } });
  if (alumno1) {
    await prisma.pagosAlumnos.createMany({
      data: [
        { EstudianteID: alumno1.EstudianteID, Mes: 'Septiembre 2026', Monto: 150.00, Estado: 'Pagado', FechaPago: new Date('2026-09-01'), FechaVencimiento: new Date('2026-09-05') },
        { EstudianteID: alumno1.EstudianteID, Mes: 'Octubre 2026', Monto: 150.00, Estado: 'Pendiente', FechaVencimiento: new Date('2026-10-05') }
      ]
    });
  }

  // Create some sueldos for profesor1
  const profe1 = await prisma.profesores.findFirst({ where: { usuario: { Cedula: 'profesor1' } } });
  if (profe1) {
    await prisma.sueldosProfesores.createMany({
      data: [
        { ProfesorID: profe1.ProfesorID, Mes: 'Agosto 2026', Monto: 800.00, Estado: 'Pagado', FechaPago: new Date('2026-08-30') },
        { ProfesorID: profe1.ProfesorID, Mes: 'Septiembre 2026', Monto: 800.00, Estado: 'Pendiente' }
      ]
    });
  }

  // Create some gastos
  await prisma.gastos.createMany({
    data: [
      { Descripcion: 'Pago de Internet Netlife', Monto: 50.00, Categoria: 'Servicios Básicos', Fecha: new Date() },
      { Descripcion: 'Mantenimiento de computadoras Lab 1', Monto: 120.00, Categoria: 'Mantenimiento', Fecha: new Date() }
    ]
  });

  console.log('Contabilidad seeded!');
}

main().finally(() => prisma.$disconnect());
