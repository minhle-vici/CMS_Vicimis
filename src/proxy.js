import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

async function proxy(request) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/login')) {
    if (token) {
      return NextResponse.redirect(new URL(getRoleHomePage(token.role), request.url));
    }
    return NextResponse.next();
  }

  // Nếu chưa đăng nhập → về login
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Bảo vệ các trang chỉ Admin mới xem được
  const adminOnlyPaths = ['/users', '/settings'];
  if (adminOnlyPaths.some(p => pathname.startsWith(p)) && token.role !== 'Admin') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
}

function getRoleHomePage(role) {
  switch (role) {
    case 'Admin': return '/';
    case 'IT': return '/my-tasks';
    case 'AM': return '/my-tasks';
    case 'Sale': return '/my-tasks';
    case 'Designer': return '/my-tasks';
    default: return '/my-tasks';
  }
}

export { proxy };
export default proxy;

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|img/).*)'],
};
