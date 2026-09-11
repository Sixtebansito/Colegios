const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.usuarios.findMany({ include: { rector: true, inspector: true, profesor: true } });
  console.log(users.map(u => ({ id: u.UsuarioID, cedula: u.Cedula, isRector: !!u.rector, isInspector: !!u.inspector })));
}
main().finally(() => prisma.$disconnect());
