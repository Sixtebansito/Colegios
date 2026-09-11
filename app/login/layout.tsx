import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  
  if (session) {
    if (session.roleId === 1) redirect('/admin')
    if (session.roleId === 2) redirect('/profesor')
    if (session.roleId === 3) redirect('/alumno')
    redirect('/')
  }

  return <>{children}</>
}
