import { json } from '@sveltejs/kit';
import sql from '$lib/db.js';
import { toFirstOfMonth } from '$lib/calc.js';

// GET - List penalties
export async function GET({ locals, url }) {
	try {
		if (!locals.user) {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		const month = url.searchParams.get('month');

		let penalties;

		if (locals.user.role === 'admin') {
			// Admin sees all penalties
			if (month) {
				const formattedMonth = toFirstOfMonth(month);
				penalties = await sql`
					SELECT
						p.*,
						m.name as member_name
					FROM penalties p
					JOIN members m ON p.member_id = m.id
					WHERE p.month = ${formattedMonth}
					ORDER BY p.created_at DESC
				`;
			} else {
				penalties = await sql`
					SELECT
						p.*,
						m.name as member_name
					FROM penalties p
					JOIN members m ON p.member_id = m.id
					ORDER BY p.created_at DESC
				`;
			}
		} else {
			// Member sees only their penalties
			penalties = await sql`
				SELECT
					p.*,
					m.name as member_name
				FROM penalties p
				JOIN members m ON p.member_id = m.id
				WHERE p.member_id = ${locals.user.id}
				ORDER BY p.created_at DESC
			`;
		}

		return json({ penalties });
	} catch (error) {
		console.error('Error fetching penalties:', error);
		return json({ error: 'Failed to fetch penalties' }, { status: 500 });
	}
}

// POST - Record penalty
export async function POST({ request, locals }) {
	try {
		if (!locals.user || locals.user.role !== 'admin') {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		const { memberId, amount, month, reason } = await request.json();

		if (!memberId || !amount || !month) {
			return json({ error: 'Member ID, amount, and month are required' }, { status: 400 });
		}

		if (parseFloat(amount) <= 0) {
			return json({ error: 'Amount must be greater than zero' }, { status: 400 });
		}

		const formattedMonth = toFirstOfMonth(month);

		// Record penalty
		const [penalty] = await sql`
			INSERT INTO penalties (member_id, amount, month, reason)
			VALUES (${memberId}, ${amount}, ${formattedMonth}, ${reason || null})
			RETURNING *
		`;

		return json({ penalty }, { status: 201 });
	} catch (error) {
		console.error('Error recording penalty:', error);
		return json({ error: 'Failed to record penalty' }, { status: 500 });
	}
}
