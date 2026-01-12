import sql from '$lib/db.js';

export async function load() {
	// Get active loans with outstanding balance
	const activeLoans = await sql`
		SELECT
			l.id,
			l.member_id,
			l.principal,
			l.total_amount,
			l.outstanding_balance,
			l.disbursement_month,
			m.name as member_name
		FROM loans l
		JOIN members m ON l.member_id = m.id
		WHERE l.status = 'active' AND l.outstanding_balance > 0
		ORDER BY m.name
	`;

	// Get recent repayments (last 10)
	const recentRepayments = await sql`
		SELECT
			r.id,
			r.amount,
			r.payment_month,
			r.created_at,
			l.id as loan_id,
			m.name as member_name
		FROM loan_repayments r
		JOIN loans l ON r.loan_id = l.id
		JOIN members m ON l.member_id = m.id
		ORDER BY r.created_at DESC
		LIMIT 10
	`;

	return {
		activeLoans,
		recentRepayments
	};
}
