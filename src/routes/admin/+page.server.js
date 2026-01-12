import sql from '$lib/db.js';
import { toFirstOfMonth } from '$lib/calc.js';

export async function load() {
	const currentMonth = toFirstOfMonth(new Date());

	// Get total savings (current month)
	const [savingsStats] = await sql`
		SELECT
			COALESCE(SUM(amount), 0) as total_savings,
			COUNT(DISTINCT member_id) as members_with_savings
		FROM savings
		WHERE month = ${currentMonth}
	`;

	// Get active loans statistics
	const [loansStats] = await sql`
		SELECT
			COUNT(*) as active_loans_count,
			COALESCE(SUM(outstanding_balance), 0) as total_outstanding
		FROM loans
		WHERE status = 'active' AND outstanding_balance > 0
	`;

	// Get member count (all participants including admin)
	const [memberStats] = await sql`
		SELECT COUNT(*) as total_members
		FROM members
	`;

	// Get recent activity (last 5 loans)
	const recentLoans = await sql`
		SELECT
			l.id,
			l.principal,
			l.disbursement_month,
			m.name as member_name
		FROM loans l
		JOIN members m ON l.member_id = m.id
		ORDER BY l.created_at DESC
		LIMIT 5
	`;

	return {
		stats: {
			totalSavings: parseFloat(savingsStats.total_savings),
			membersWithSavings: parseInt(savingsStats.members_with_savings),
			activeLoans: parseInt(loansStats.active_loans_count),
			totalOutstanding: parseFloat(loansStats.total_outstanding),
			totalMembers: parseInt(memberStats.total_members)
		},
		recentLoans,
		currentMonth
	};
}
