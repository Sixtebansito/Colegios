const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
  const hash = await bcrypt.hash('123456', 10);
  await prisma.usuarios.updateMany({ data: { PasswordHash: hash } });
  console.log('Passwords updated to 123456');
}

main().finally(() => prisma.$disconnect());
