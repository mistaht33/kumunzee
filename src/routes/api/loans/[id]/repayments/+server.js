import { json } from '@sveltejs/kit';
import sql from '$lib/db.js';
import { calculateInterestDistribution, toFirstOfMonth } from '$lib/calc.js';

// POST - Record loan repayment
export async function POST({ params, request, locals }) {
	try {
		if (!locals.user || locals.user.role !== 'admin') {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		const loanId = parseInt(params.id);
		const { amount, paymentMonth } = await request.json();

		if (!amount || !paymentMonth) {
			return json({ error: 'Amount and payment month are required' }, { status: 400 });
		}

		if (parseFloat(amount) <= 0) {
			return json({ error: 'Amount must be greater than zero' }, { status: 400 });
		}

		// Get loan details
		const [loan] = await sql`
			SELECT * FROM loans WHERE id = ${loanId}
		`;

		if (!loan) {
			return json({ error: 'Loan not found' }, { status: 404 });
		}

		if (parseFloat(amount) > parseFloat(loan.outstanding_balance)) {
			return json({ error: 'Repayment amount exceeds outstanding balance' }, { status: 400 });
		}

		const formattedMonth = toFirstOfMonth(paymentMonth);

		// Start transaction
		await sql.begin(async (sql) => {
			// Record repayment
			await sql`
				INSERT INTO loan_repayments (loan_id, amount, payment_month)
				VALUES (${loanId}, ${amount}, ${formattedMonth})
			`;

			// Update outstanding balance
			const newBalance = parseFloat(loan.outstanding_balance) - parseFloat(amount);
			const newStatus = newBalance === 0 ? 'paid' : 'active';

			await sql`
				UPDATE loans
				SET outstanding_balance = ${newBalance},
					status = ${newStatus}
				WHERE id = ${loanId}
			`;

			// Calculate and distribute interest
			// Get all members' savings from the loan disbursement month
			const memberSavings = await sql`
				SELECT member_id, amount
				FROM savings
				WHERE month = ${loan.disbursement_month}
			`;

			if (memberSavings.length > 0) {
				const interestShares = calculateInterestDistribution(parseFloat(amount), memberSavings);

				// Insert interest distributions
				for (const share of interestShares) {
					if (share.share > 0) {
						await sql`
							INSERT INTO interest_distributions (member_id, loan_month, repayment_month, amount)
							VALUES (${share.member_id}, ${loan.disbursement_month}, ${formattedMonth}, ${share.share})
						`;
					}
				}
			}
		});

		return json({ success: true, message: 'Repayment recorded and interest distributed' }, { status: 201 });
	} catch (error) {
		console.error('Error recording repayment:', error);
		return json({ error: 'Failed to record repayment' }, { status: 500 });
	}
}
