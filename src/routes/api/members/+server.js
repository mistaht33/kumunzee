import { json } from '@sveltejs/kit';
import sql from '$lib/db.js';
import { hashPin } from '$lib/auth.js';

// GET - List all members
export async function GET({ locals }) {
	try {
		// Only admin can list members
		if (!locals.user || locals.user.role !== 'admin') {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		const members = await sql`
			SELECT
				id,
				name,
				phone,
				role,
				created_at
			FROM members
			ORDER BY created_at DESC
		`;

		return json({ members });
	} catch (error) {
		console.error('Error fetching members:', error);
		return json({ error: 'Failed to fetch members' }, { status: 500 });
	}
}

// POST - Create new member
export async function POST({ request, locals }) {
	try {
		// Only admin can create members
		if (!locals.user || locals.user.role !== 'admin') {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		const { name, phone, pin, role = 'member' } = await request.json();

		// Validate input
		if (!name || !phone || !pin) {
			return json({ error: 'Name, phone, and PIN are required' }, { status: 400 });
		}

		if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
			return json({ error: 'PIN must be exactly 4 digits' }, { status: 400 });
		}

		// Check if phone already exists
		const [existing] = await sql`
			SELECT id FROM members WHERE phone = ${phone}
		`;

		if (existing) {
			return json({ error: 'Phone number already registered' }, { status: 400 });
		}

		// Hash PIN
		const pinHash = await hashPin(pin);

		// Insert member
		const [member] = await sql`
			INSERT INTO members (name, phone, pin_hash, role)
			VALUES (${name}, ${phone}, ${pinHash}, ${role})
			RETURNING id, name, phone, role, created_at
		`;

		return json({ member }, { status: 201 });
	} catch (error) {
		console.error('Error creating member:', error);
		return json({ error: 'Failed to create member' }, { status: 500 });
	}
}
