import { requireRole } from '@/lib/auth'
import EvaLayout from '@/app/components/layout/EvaLayout'

export default async function AlumnoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireRole([3])

  return (
    <EvaLayout
      userRole="alumno"
      userName={`${session.nombre} ${session.apellido}`}
      userId={session.userId}
    >
      {children}
    </EvaLayout>
  )
}
