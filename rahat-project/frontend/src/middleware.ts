import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const isAdminPage = request.nextUrl.pathname.startsWith('/orbita-admin')
  const sessionCookie = request.cookies.get('orbita_admin_session')
  const isAdminLoggedIn = sessionCookie?.value === 'true'

  if (isAdminPage && !isAdminLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/orbita-admin/:path*',
  ],
}
