'use server'

import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/db'
import { encrypt } from '@/lib/auth'

export async function login(formData: FormData) {
  const cedula = formData.get('cedula') as string
  const password = formData.get('password') as string

  if (!cedula || !password) {
    return { error: 'Cédula y contraseña son requeridas' }
  }

  try {
    const user = await prisma.usuarios.findUnique({
      where: { Cedula: cedula },
      include: {
        rol: true,
        profesor: true,
        padre: true,
      }
    })

    if (!user) {
      return { error: 'Credenciales inválidas' }
    }

    const isMatch = await bcrypt.compare(password, user.PasswordHash)
    if (!isMatch) {
      return { error: 'Credenciales inválidas' }
    }
    
    if (user.EstadoID !== 2) { // 2 = Activo in Catalogos based on init_db.py
       return { error: 'Usuario inactivo' }
    }

    const sessionData = {
      userId: user.UsuarioID,
      roleId: user.RoleID,
      cedula: user.Cedula,
      nombre: user.profesor?.Nombre || user.padre?.Nombre || (user.RoleID === 1 ? 'Admin' : 'Usuario'),
      apellido: user.profesor?.Apellido || user.padre?.Apellido || '',
    }

    const session = await encrypt(sessionData)
    const cookieStore = await cookies()
    
    cookieStore.set('session', session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 1 day
    })

    return { success: true, roleId: user.RoleID }
  } catch (error) {
    console.error('Login error:', error)
    return { error: 'Ocurrió un error inesperado. Intenta más tarde.' }
  }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}
