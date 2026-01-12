import { json } from '@sveltejs/kit';
import sql from '$lib/db.js';
import { calculateLoan, toFirstOfMonth } from '$lib/calc.js';

// GET - List loans
export async function GET({ locals }) {
	try {
		if (!locals.user) {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		let loans;

		if (locals.user.role === 'admin') {
			// Admin sees all loans
			loans = await sql`
				SELECT
					l.*,
					m.name as member_name
				FROM loans l
				JOIN members m ON l.member_id = m.id
				ORDER BY l.created_at DESC
			`;
		} else {
			// Member sees only their loans
			loans = await sql`
				SELECT
					l.*,
					m.name as member_name
				FROM loans l
				JOIN members m ON l.member_id = m.id
				WHERE l.member_id = ${locals.user.id}
				ORDER BY l.created_at DESC
			`;
		}

		return json({ loans });
	} catch (error) {
		console.error('Error fetching loans:', error);
		return json({ error: 'Failed to fetch loans' }, { status: 500 });
	}
}

// POST - Create loan
export async function POST({ request, locals }) {
	try {
		if (!locals.user || locals.user.role !== 'admin') {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		const { memberId, principal, disbursementMonth } = await request.json();

		if (!memberId || !principal || !disbursementMonth) {
			return json({ error: 'Member ID, principal, and disbursement month are required' }, { status: 400 });
		}

		if (parseFloat(principal) <= 0) {
			return json({ error: 'Loan amount must be greater than zero' }, { status: 400 });
		}

		// Calculate loan details
		const { interest, totalAmount } = calculateLoan(parseFloat(principal));
		const formattedMonth = toFirstOfMonth(disbursementMonth);

		// Create loan
		const [loan] = await sql`
			INSERT INTO loans (member_id, principal, interest, total_amount, outstanding_balance, disbursement_month, status)
			VALUES (${memberId}, ${principal}, ${interest}, ${totalAmount}, ${totalAmount}, ${formattedMonth}, 'active')
			RETURNING *
		`;

		return json({ loan }, { status: 201 });
	} catch (error) {
		console.error('Error creating loan:', error);
		return json({ error: 'Failed to create loan' }, { status: 500 });
	}
}
