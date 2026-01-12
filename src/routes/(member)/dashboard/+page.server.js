import sql from '$lib/db.js';
import { calculateMemberEquity } from '$lib/calc.js';

export async function load({ locals }) {
	const memberId = locals.user.id;

	// Get total savings
	const [savingsResult] = await sql`
		SELECT COALESCE(SUM(amount), 0) as total_savings
		FROM savings
		WHERE member_id = ${memberId}
	`;

	// Get interest earned
	const [interestResult] = await sql`
		SELECT COALESCE(SUM(amount), 0) as total_interest
		FROM interest_distributions
		WHERE member_id = ${memberId}
	`;

	// Get penalty share
	const [penaltyResult] = await sql`
		SELECT COALESCE(SUM(amount), 0) as total_penalty_share
		FROM penalty_distributions
		WHERE member_id = ${memberId}
	`;

	// Get outstanding loans
	const [loansResult] = await sql`
		SELECT COALESCE(SUM(outstanding_balance), 0) as total_outstanding
		FROM loans
		WHERE member_id = ${memberId} AND status = 'active'
	`;

	// Get loan count
	const [loanCount] = await sql`
		SELECT
			COUNT(*) as total_loans,
			COUNT(CASE WHEN status = 'active' THEN 1 END) as active_loans
		FROM loans
		WHERE member_id = ${memberId}
	`;

	// Calculate equity
	const equity = calculateMemberEquity({
		savings: parseFloat(savingsResult.total_savings),
		interestEarned: parseFloat(interestResult.total_interest),
		penaltyShare: parseFloat(penaltyResult.total_penalty_share),
		outstandingLoans: parseFloat(loansResult.total_outstanding)
	});

	// Get recent savings (last 6 months)
	const recentSavings = await sql`
		SELECT month, amount
		FROM savings
		WHERE member_id = ${memberId}
		ORDER BY month DESC
		LIMIT 6
	`;

	// Get recent interest earned (last 10)
	const recentInterest = await sql`
		SELECT repayment_month, amount
		FROM interest_distributions
		WHERE member_id = ${memberId}
		ORDER BY created_at DESC
		LIMIT 10
	`;

	// Get recent penalty distributions (last 10)
	const recentPenalties = await sql`
		SELECT month, amount
		FROM penalty_distributions
		WHERE member_id = ${memberId}
		ORDER BY created_at DESC
		LIMIT 10
	`;

	return {
		memberName: locals.user.name,
		summary: {
			totalSavings: parseFloat(savingsResult.total_savings),
			interestEarned: parseFloat(interestResult.total_interest),
			penaltyShare: parseFloat(penaltyResult.total_penalty_share),
			outstandingLoans: parseFloat(loansResult.total_outstanding),
			totalEquity: equity.totalEquity,
			netPosition: equity.netPosition
		},
		loanStats: {
			totalLoans: parseInt(loanCount.total_loans),
			activeLoans: parseInt(loanCount.active_loans)
		},
		recentSavings,
		recentInterest,
		recentPenalties
	};
}
