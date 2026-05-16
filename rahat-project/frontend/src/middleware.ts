import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const isAdminPage = request.nextUrl.pathname.startsWith('/orbita-admin')
  const isAdminLoggedIn = request.cookies.get('orbita_admin_session')?.value === 'true'

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
