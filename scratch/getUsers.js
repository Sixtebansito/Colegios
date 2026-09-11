const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 
async function main() { 
  const users = await prisma.usuarios.findMany({ 
    include: { rol: true, profesor: true, estudiante: true } 
  }); 
  console.log(users.map(u => ({ 
    Cedula: u.Cedula, 
    Rol: u.rol.Nombre, 
    Nombre: u.profesor?.Nombre || u.estudiante?.Nombre || (u.Cedula.includes('admin') ? 'Admin' : 'N/A'), 
    Apellido: u.profesor?.Apellido || u.estudiante?.Apellido || '' 
  }))); 
} 
main().finally(() => prisma.$disconnect());
