import { json } from '@sveltejs/kit';
import sql from '$lib/db.js';
import { calculatePenaltyDistribution, toFirstOfMonth, ADMIN_FEE } from '$lib/calc.js';

// POST - Process month-end
export async function POST({ request, locals }) {
	try {
		if (!locals.user || locals.user.role !== 'admin') {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		const { month } = await request.json();

		if (!month) {
			return json({ error: 'Month is required' }, { status: 400 });
		}

		const formattedMonth = toFirstOfMonth(month);

		// Check if month is already closed
		const [existingDistribution] = await sql`
			SELECT COUNT(*) as count
			FROM penalty_distributions
			WHERE month = ${formattedMonth}
		`;

		if (parseInt(existingDistribution.count) > 0) {
			return json({ error: 'Month-end has already been processed for this month' }, { status: 400 });
		}

		// Start transaction
		await sql.begin(async (sql) => {
			// Get all members
			const members = await sql`
				SELECT id FROM members
			`;

			const memberCount = members.length;

			if (memberCount === 0) {
				throw new Error('No members found');
			}

			// Get total penalties for the month
			const [penaltyResult] = await sql`
				SELECT COALESCE(SUM(amount), 0) as total_penalties
				FROM penalties
				WHERE month = ${formattedMonth}
			`;

			const totalPenalties = parseFloat(penaltyResult.total_penalties);

			// Calculate penalty distribution (15% interest, split equally)
			const penaltySharePerMember = calculatePenaltyDistribution(totalPenalties, memberCount);

			// Calculate admin fee per member
			const adminFeePerMember = ADMIN_FEE;

			// Net distribution per member (penalty share minus admin fee)
			const netDistributionPerMember = penaltySharePerMember - adminFeePerMember;

			// Insert penalty distributions for each member
			for (const member of members) {
				await sql`
					INSERT INTO penalty_distributions (member_id, month, amount)
					VALUES (${member.id}, ${formattedMonth}, ${netDistributionPerMember})
				`;
			}
		});

		return json(
			{
				success: true,
				message: 'Month-end processed successfully. Penalties distributed and admin fees deducted.'
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error('Error processing month-end:', error);
		return json({ error: error.message || 'Failed to process month-end' }, { status: 500 });
	}
}
