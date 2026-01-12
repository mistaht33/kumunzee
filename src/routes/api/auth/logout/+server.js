import { json } from '@sveltejs/kit';
import { deleteSession } from '$lib/auth.js';

export async function POST({ cookies }) {
	try {
		const sessionId = cookies.get('session_id');

		if (sessionId) {
			await deleteSession(sessionId);
		}

		// Clear session cookie
		cookies.delete('session_id', { path: '/' });

		return json({ success: true });
	} catch (error) {
		console.error('Logout error:', error);
		return json({ error: 'Logout failed' }, { status: 500 });
	}
}
