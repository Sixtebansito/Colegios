import { getSession } from '@/lib/auth'
import EvaLayout from '@/app/components/layout/EvaLayout'
import { redirect } from 'next/navigation'
import prisma from '@/lib/db'

export default async function RectorLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')

  const rector = await prisma.rectores.findUnique({
    where: { UsuarioID: session.userId as number },
    include: { usuario: true }
  })

  if (!rector) redirect('/login')

  return (
    <EvaLayout userRole="rector" userName={rector.usuario.Cedula} userId={session.userId as number}>
      {children}
    </EvaLayout>
  )
}
