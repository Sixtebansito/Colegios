import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session || !session.userId) {
      return NextResponse.json({ roles: [] })
    }

    const userId = session.userId as number
    const userRoles = []

    const user = await prisma.usuarios.findUnique({
      where: { UsuarioID: userId },
      include: {
        rol: true,
        inspector: true,
        rector: true,
      }
    })

    if (!user) return NextResponse.json({ roles: [] })

    // Default primary role (e.g. admin, profesor, alumno)
    if (user.rol) {
      userRoles.push({ name: user.rol.Nombre, href: `/${user.rol.Nombre.toLowerCase()}` })
    }

    // Additional roles
    if (user.inspector) {
      userRoles.push({ name: 'Inspector', href: '/inspector' })
    }
    
    if (user.rector) {
      userRoles.push({ name: 'Rector', href: '/rector' })
    }

    return NextResponse.json({ roles: userRoles })
  } catch (error) {
    return NextResponse.json({ roles: [] })
  }
}
