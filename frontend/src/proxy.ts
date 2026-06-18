import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Se já está na página de login, permite
  if (pathname === '/login') {
    return NextResponse.next();
  }

  // Verifica se tem o cookie de token
  const token = request.cookies.get('token');

  // Se não tem token e não está na página de login, redireciona
  if (!token && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};