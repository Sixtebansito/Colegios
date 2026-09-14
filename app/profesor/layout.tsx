import { requireRole } from '@/lib/auth'
import EvaLayout from '@/app/components/layout/EvaLayout'

export default async function ProfesorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireRole([2])

  return (
    <EvaLayout
      userRole="profesor"
      userName={`${session.nombre} ${session.apellido}`}
      userId={session.userId}
    >
      {children}
    </EvaLayout>
  )
}
