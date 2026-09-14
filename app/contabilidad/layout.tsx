import { requireRole } from '@/lib/auth'
import ContabilidadLayout from '@/app/components/layout/ContabilidadLayout'

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireRole([4])

  return (
    <ContabilidadLayout
      userName={`${session.nombre} ${session.apellido}`}
      userId={session.userId as number}
    >
      {children}
    </ContabilidadLayout>
  )
}
