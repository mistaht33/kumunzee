import { json } from '@sveltejs/kit';
import { verifyCredentials, createSession } from '$lib/auth.js';

export async function POST({ request, cookies }) {
	try {
		const { phone, pin } = await request.json();

		if (!phone || !pin) {
			return json({ error: 'Phone and PIN are required' }, { status: 400 });
		}

		// Verify credentials
		const member = await verifyCredentials(phone, pin);

		if (!member) {
			return json({ error: 'Invalid phone number or PIN' }, { status: 401 });
		}

		// Create session
		const sessionId = await createSession(member.id);

		// Set session cookie
		cookies.set('session_id', sessionId, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 60 * 60 * 24 * 7 // 7 days
		});

		return json({
			success: true,
			user: {
				id: member.id,
				name: member.name,
				phone: member.phone,
				role: member.role
			}
		});
	} catch (error) {
		console.error('Login error:', error);
		return json({ error: 'Login failed' }, { status: 500 });
	}
}
