import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Páginas públicas que não precisam de autenticação
	const publicPages = [
		'/login',
		'/forget-password',
		'/passwordRecovery',
		'/reset-password',
		'/auth-pages/login',
		'/auth-pages/sign-up',
	];

	// Verificar se a página atual é pública
	const isPublicPage = publicPages.some((page) => pathname.startsWith(page));

	// Se for página pública, permitir acesso
	if (isPublicPage) {
		return NextResponse.next();
	}

	// Verificar se existe token JWT nos cookies
	const token = request.cookies.get('jwt_token')?.value;

	// Se não tem token e não é página pública, redirecionar para login
	if (!token) {
		// Redirecionar para login mantendo a URL original como parâmetro
		const loginUrl = new URL('/login', request.url);
		loginUrl.searchParams.set('redirect', pathname);
		return NextResponse.redirect(loginUrl);
	}

	// Se tem token, permitir acesso
	return NextResponse.next();
}

export const config = {
	// Aplicar middleware em todas as rotas exceto arquivos estáticos e API
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public files (images, etc.)
		 */
		'/((?!api|_next/static|_next/image|favicon.ico|assets|images|public).*)',
	],
};
