import sql from '$lib/db.js';

export async function load({ locals }) {
	const memberId = locals.user.id;

	// Get all loans for this member
	const loans = await sql`
		SELECT *
		FROM loans
		WHERE member_id = ${memberId}
		ORDER BY created_at DESC
	`;

	// Get repayments for each loan
	const loansWithRepayments = await Promise.all(
		loans.map(async (loan) => {
			const repayments = await sql`
				SELECT *
				FROM loan_repayments
				WHERE loan_id = ${loan.id}
				ORDER BY payment_month DESC
			`;

			return {
				...loan,
				repayments
			};
		})
	);

	return {
		loans: loansWithRepayments
	};
}
