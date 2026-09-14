import { requireRole } from '@/lib/auth'
import prisma from '@/lib/db'
import MatriculacionManager from './MatriculacionManager'

export default async function AdminMatriculacionPage() {
  const session = await requireRole([1])

  const grados = await prisma.grados.findMany({
    orderBy: { Nombre: 'asc' }
  })

  const estudiantes = await prisma.estudiantes.findMany({
    include: { usuario: { select: { Cedula: true } } },
    orderBy: [{ Apellido: 'asc' }, { Nombre: 'asc' }]
  })

  return <MatriculacionManager grados={grados} estudiantes={estudiantes} />
}
