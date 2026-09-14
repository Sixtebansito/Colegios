import { requireRole } from '@/lib/auth'
import AdminLayout from '@/app/components/layout/AdminLayout'

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireRole([1]) // Solo Admin

  return (
    <AdminLayout
      userName={`${session.nombre} ${session.apellido}`}
      userId={session.userId as number}
    >
      {children}
    </AdminLayout>
  )
}
