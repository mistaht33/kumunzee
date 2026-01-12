import sql from '$lib/db.js';
import { toFirstOfMonth } from '$lib/calc.js';

export async function load({ url }) {
	const month = url.searchParams.get('month') || toFirstOfMonth(new Date());

	// Get all members (including admin so they can also save)
	const members = await sql`
		SELECT id, name, role
		FROM members
		ORDER BY name
	`;

	// Get savings for selected month
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

	return {
		members,
		savings,
		selectedMonth: month
	};
}
