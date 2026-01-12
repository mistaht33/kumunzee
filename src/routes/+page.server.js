import { redirect } from '@sveltejs/kit';

export function load() {
	// Redirect to login page
	throw redirect(302, '/login');
}
