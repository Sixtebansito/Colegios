import { getSession } from '@/lib/auth'
import EvaLayout from '@/app/components/layout/EvaLayout'
import { redirect } from 'next/navigation'
import prisma from '@/lib/db'

export default async function InspectorLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')

  const inspector = await prisma.inspectores.findUnique({
    where: { UsuarioID: session.userId as number },
    include: { usuario: true }
  })

  if (!inspector) redirect('/login')

  return (
    <EvaLayout userRole="inspector" userName={inspector.usuario.Cedula} userId={session.userId as number}>
      {children}
    </EvaLayout>
  )
}
