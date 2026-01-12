import sql from '$lib/db.js';
import { toFirstOfMonth } from '$lib/calc.js';

export async function load() {
	// Get current month as default
	const currentMonth = toFirstOfMonth(new Date());

	// Get all members
	const members = await sql`
		SELECT id, name, role
		FROM members
		ORDER BY name
	`;

	// Get savings for current month
	const savings = await sql`
		SELECT member_id, amount
		FROM savings
		WHERE month = ${currentMonth}
	`;

	// Get penalties for current month
	const penalties = await sql`
		SELECT p.*, m.name as member_name
		FROM penalties p
		JOIN members m ON p.member_id = m.id
		WHERE p.month = ${currentMonth}
		ORDER BY p.created_at DESC
	`;

	// Check if month is already closed (has penalty distributions)
	const [monthStatus] = await sql`
		SELECT COUNT(*) as distribution_count
		FROM penalty_distributions
		WHERE month = ${currentMonth}
	`;

	const isMonthClosed = parseInt(monthStatus.distribution_count) > 0;

	// Get recent closed months (last 6 months with distributions)
	const closedMonths = await sql`
		SELECT DISTINCT month
		FROM penalty_distributions
		ORDER BY month DESC
		LIMIT 6
	`;

	// If month is closed, get distribution summary
	let distributionSummary = null;
	if (isMonthClosed) {
		const distributions = await sql`
			SELECT pd.*, m.name as member_name
			FROM penalty_distributions pd
			JOIN members m ON pd.member_id = m.id
			WHERE pd.month = ${currentMonth}
			ORDER BY m.name
		`;

		const [totals] = await sql`
			SELECT
				COALESCE(SUM(amount), 0) as total_distributed
			FROM penalty_distributions
			WHERE month = ${currentMonth}
		`;

		distributionSummary = {
			distributions,
			totalDistributed: parseFloat(totals.total_distributed)
		};
	}

	return {
		currentMonth,
		members,
		savings,
		penalties,
		isMonthClosed,
		closedMonths,
		distributionSummary
	};
}
