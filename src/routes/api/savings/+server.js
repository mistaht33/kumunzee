import { json } from '@sveltejs/kit';
import sql from '$lib/db.js';
import { toFirstOfMonth, MIN_SAVINGS_AMOUNT } from '$lib/calc.js';

// GET - Get savings for a specific month
export async function GET({ url, locals }) {
	try {
		if (!locals.user || locals.user.role !== 'admin') {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		const month = url.searchParams.get('month') || toFirstOfMonth(new Date());

		const savings = await sql`
			SELECT
				s.id,
				s.member_id,
				s.amount,
				s.month,
				m.name as member_name
			FROM savings s
			JOIN members m ON s.member_id = m.id
			WHERE s.month = ${month}
			ORDER BY m.name
		`;

		return json({ savings, month });
	} catch (error) {
		console.error('Error fetching savings:', error);
		return json({ error: 'Failed to fetch savings' }, { status: 500 });
	}
}

// POST - Record savings
export async function POST({ request, locals }) {
	try {
		if (!locals.user || locals.user.role !== 'admin') {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		const { memberId, amount, month } = await request.json();

		if (!memberId || !amount || !month) {
			return json({ error: 'Member ID, amount, and month are required' }, { status: 400 });
		}

		if (parseFloat(amount) < MIN_SAVINGS_AMOUNT) {
			return json({ error: `Minimum savings amount is K${MIN_SAVINGS_AMOUNT}` }, { status: 400 });
		}

		// Use toFirstOfMonth to ensure correct format
		const formattedMonth = toFirstOfMonth(month);

		// Insert or update savings (upsert)
		const [saving] = await sql`
			INSERT INTO savings (member_id, amount, month)
			VALUES (${memberId}, ${amount}, ${formattedMonth})
			ON CONFLICT (member_id, month)
			DO UPDATE SET amount = ${amount}
			RETURNING id, member_id, amount, month
		`;

		return json({ saving }, { status: 201 });
	} catch (error) {
		console.error('Error recording savings:', error);
		return json({ error: 'Failed to record savings' }, { status: 500 });
	}
}
