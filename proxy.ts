import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSession, updateSession } from './lib/auth'

export async function proxy(request: NextRequest) {
  // Update session expiration if present
  const res = await updateSession(request)
  
  const path = request.nextUrl.pathname
  
  // Public paths that don't require authentication
  const isPublicPath = path === '/' || path === '/login' || path.startsWith('/api/auth')
  
  const session = await getSession()
  
  if (!session && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  if (session) {
    // Prevent logged-in users from accessing login page
    if (path === '/login') {
      const redirectMap: Record<number, string> = {
        1: '/admin',
        2: '/profesor',
        3: '/padre'
      }
      return NextResponse.redirect(new URL(redirectMap[session.roleId as number] || '/', request.url))
    }
    
    // Role-based route protection
    if (path.startsWith('/admin') && session.roleId !== 1) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    if (path.startsWith('/profesor') && session.roleId !== 2) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    if (path.startsWith('/padre') && session.roleId !== 3) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return res || NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|static).*)'],
}
