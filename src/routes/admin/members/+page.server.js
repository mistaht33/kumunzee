import sql from '$lib/db.js';
import { calculateMemberEquity } from '$lib/calc.js';

export async function load() {
	// Get all members
	const allMembers = await sql`
		SELECT id, name, phone, role, created_at
		FROM members
		ORDER BY created_at DESC
	`;

	// Get financial data for each member
	const membersWithFinancials = await Promise.all(
		allMembers.map(async (member) => {
			// Total savings
			const [savingsResult] = await sql`
				SELECT COALESCE(SUM(amount), 0) as total_savings
				FROM savings
				WHERE member_id = ${member.id}
			`;

			// Total interest earned
			const [interestResult] = await sql`
				SELECT COALESCE(SUM(amount), 0) as total_interest
				FROM interest_distributions
				WHERE member_id = ${member.id}
			`;

			// Total penalty distributions (penalty share minus admin fees)
			const [penaltyResult] = await sql`
				SELECT COALESCE(SUM(amount), 0) as total_penalty_share
				FROM penalty_distributions
				WHERE member_id = ${member.id}
			`;

			// Outstanding loans
			const [loansResult] = await sql`
				SELECT COALESCE(SUM(outstanding_balance), 0) as total_outstanding
				FROM loans
				WHERE member_id = ${member.id} AND status = 'active'
			`;

			const totalSavings = parseFloat(savingsResult.total_savings);
			const totalInterest = parseFloat(interestResult.total_interest);
			const penaltyShare = parseFloat(penaltyResult.total_penalty_share);
			const outstandingLoans = parseFloat(loansResult.total_outstanding);

			// Calculate equity using the same formula as member dashboard
			const equity = calculateMemberEquity({
				savings: totalSavings,
				interestEarned: totalInterest,
				penaltyShare: penaltyShare,
				outstandingLoans: outstandingLoans
			});

			return {
				...member,
				total_savings: totalSavings,
				total_interest: totalInterest,
				penalty_share: penaltyShare,
				savings_plus_interest: totalSavings + totalInterest,
				outstanding_loans: outstandingLoans,
				total_equity: equity.totalEquity,
				net_position: equity.netPosition
			};
		})
	);

	return {
		members: membersWithFinancials
	};
}
