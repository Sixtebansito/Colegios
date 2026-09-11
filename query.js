const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 
async function main() { 
  const grados = await prisma.grados.findMany(); 
  console.log('GRADOS:', grados); 
  const roles = await prisma.roles.findMany(); 
  console.log('ROLES:', roles); 
  const usuarios = await prisma.usuarios.findMany(); 
  console.log('USUARIOS:', usuarios.map(u => ({ id: u.UsuarioID, cedula: u.Cedula, roleId: u.RoleID }))); 
} 
main().finally(() => prisma.$disconnect());
