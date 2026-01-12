import { getSession } from '$lib/auth.js';
import { redirect } from '@sveltejs/kit';

export async function handle({ event, resolve }) {
	// Get session from cookie
	const sessionId = event.cookies.get('session_id');

	if (sessionId) {
		const session = await getSession(sessionId);
		if (session) {
			event.locals.user = {
				id: session.id,
				name: session.name,
				phone: session.phone,
				role: session.role
			};
		}
	}

	// Get current path
	const path = event.url.pathname;

	// Public paths that don't require authentication
	const publicPaths = ['/login', '/api/auth/login'];
	const isPublicPath = publicPaths.some((p) => path.startsWith(p));

	// If not authenticated and trying to access protected route, redirect to login
	if (!event.locals.user && !isPublicPath && path !== '/') {
		throw redirect(302, '/login');
	}

	// If authenticated and trying to access login, redirect to appropriate dashboard
	if (event.locals.user && path === '/login') {
		const redirectTo = event.locals.user.role === 'admin' ? '/admin' : '/dashboard';
		throw redirect(302, redirectTo);
	}

	// Role-based access control
	if (event.locals.user) {
		// Admin-only routes
		if (path.startsWith('/admin') && event.locals.user.role !== 'admin') {
			throw redirect(302, '/dashboard');
		}

		// Member-only routes (prevent admin from accessing member routes)
		if ((path.startsWith('/dashboard') || path.startsWith('/my-loans')) && event.locals.user.role === 'admin') {
			throw redirect(302, '/admin');
		}
	}

	return resolve(event);
}
