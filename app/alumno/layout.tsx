import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import EvaLayout from '@/app/components/layout/EvaLayout'

export default async function AlumnoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (!session || session.roleId !== 3) {
    redirect('/login')
  }

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
