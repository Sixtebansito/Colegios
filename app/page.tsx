import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Header from './components/landing/organisms/Header'
import Hero from './components/landing/organisms/Hero'
import Pilares from './components/landing/organisms/Pilares'
import FormularioContacto from './components/landing/organisms/FormularioContacto'
import Footer from './components/landing/organisms/Footer'

export default async function Home() {
  const session = await getSession()

  // Redireccionar si ya hay sesión activa
  if (session) {
    if (session.roleId === 1) redirect('/admin')
    if (session.roleId === 2) redirect('/profesor')
    if (session.roleId === 3) redirect('/alumno')
    if (session.roleId === 4) redirect('/contabilidad')
  }

  return (
    <div className="flex flex-col min-h-screen font-sans bg-white selection:bg-indigo-100 selection:text-indigo-900">
      <Header />
      <main className="flex-1">
        <Hero />
        <Pilares />
        <FormularioContacto />
      </main>
      <Footer />
    </div>
  )
}
