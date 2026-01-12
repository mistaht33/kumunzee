import sql from '$lib/db.js';

export async function load() {
	// Get all members (including admin so they can also take loans)
	const members = await sql`
		SELECT id, name, role
		FROM members
		ORDER BY name
	`;

	// Get all loans
	const loans = await sql`
		SELECT
			l.*,
			m.name as member_name
		FROM loans l
		JOIN members m ON l.member_id = m.id
		ORDER BY l.created_at DESC
	`;

	return {
		members,
		loans
	};
}
