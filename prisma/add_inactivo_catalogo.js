// Script idempotente para bases ya pobladas (no se puede re-correr seed.ts sin
// chocar con las Cedula unicas). Asegura que exista el catalogo "Inactivo" que
// los nuevos modulos de admin usan para desactivar Padres/Grados/Materias.
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.catalogos.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, Nombre: 'Estado', Valor: 'Inactivo' },
  });
  console.log('Catalogo Inactivo (id=1) asegurado.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
