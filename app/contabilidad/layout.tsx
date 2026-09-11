import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ContabilidadLayout from '@/app/components/layout/ContabilidadLayout'

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session || session.roleId !== 4) {
    redirect('/login')
  }

  return (
    <ContabilidadLayout
      userName={`${session.nombre} ${session.apellido}`}
      userId={session.userId as number}
    >
      {children}
    </ContabilidadLayout>
  )
}
