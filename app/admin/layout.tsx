import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminLayout from '@/app/components/layout/AdminLayout'

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (!session || session.roleId !== 1) {
    redirect('/login')
  }

  return (
    <AdminLayout
      userName={`${session.nombre} ${session.apellido}`}
    >
      {children}
    </AdminLayout>
  )
}
