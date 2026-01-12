// Business logic and calculation functions for Kumunzee Village Bank

// Constants
export const INTEREST_RATE = 0.15; // 15% flat interest
export const MIN_PAYMENT_RATE = 0.10; // 10% minimum payment
export const MIN_SAVINGS_AMOUNT = 500; // K500 minimum savings
export const ADMIN_FEE = 50; // K50/month

/**
 * Calculate loan details
 * @param {number} principal - The loan principal amount
 * @returns {{interest: number, totalAmount: number, minPayment: number}}
 */
export function calculateLoan(principal) {
	const interest = principal * INTEREST_RATE;
	const totalAmount = principal + interest;
	const minPayment = totalAmount * MIN_PAYMENT_RATE;

	return {
		interest: parseFloat(interest.toFixed(2)),
		totalAmount: parseFloat(totalAmount.toFixed(2)),
		minPayment: parseFloat(minPayment.toFixed(2))
	};
}

/**
 * Calculate interest distribution for a repayment
 * Interest is distributed proportionally to all members based on their
 * savings in the month when the loan was disbursed
 *
 * @param {number} repaymentAmount - The amount being repaid
 * @param {Array} memberSavings - Array of {member_id, amount} for loan disbursement month
 * @returns {Array} Array of {member_id, share} for interest distribution
 */
export function calculateInterestDistribution(repaymentAmount, memberSavings) {
	const interestPool = repaymentAmount * INTEREST_RATE;
	const totalSavings = memberSavings.reduce((sum, s) => sum + parseFloat(s.amount), 0);

	if (totalSavings === 0) {
		return [];
	}

	return memberSavings.map((member) => ({
		member_id: member.member_id,
		share: parseFloat(((parseFloat(member.amount) / totalSavings) * interestPool).toFixed(4))
	}));
}

/**
 * Calculate penalty distribution
 * Penalties are distributed with 15% interest, equally among all members
 *
 * @param {number} totalPenalties - Total penalty amount to distribute
 * @param {number} memberCount - Number of members to share among
 * @returns {number} Share per member
 */
export function calculatePenaltyDistribution(totalPenalties, memberCount) {
	if (memberCount === 0) return 0;

	const penaltyWithInterest = totalPenalties * 1.15;
	const sharePerMember = penaltyWithInterest / memberCount;

	return parseFloat(sharePerMember.toFixed(4));
}

/**
 * Calculate member equity summary
 *
 * @param {Object} memberData - Object with savings, interestEarned, penaltyShare, outstandingLoans
 * @returns {Object} {totalEquity, netPosition}
 */
export function calculateMemberEquity(memberData) {
	const { savings = 0, interestEarned = 0, penaltyShare = 0, outstandingLoans = 0 } = memberData;

	const totalEquity = parseFloat(savings) + parseFloat(interestEarned) + parseFloat(penaltyShare);
	const netPosition = totalEquity - parseFloat(outstandingLoans);

	return {
		totalEquity: parseFloat(totalEquity.toFixed(2)),
		netPosition: parseFloat(netPosition.toFixed(2))
	};
}

/**
 * Format currency for display (Zambian Kwacha)
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount) {
	return `K${parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

/**
 * Format date to first of month (YYYY-MM-01)
 * @param {Date|string} date - Date to format
 * @returns {string} First day of month in YYYY-MM-01 format
 */
export function toFirstOfMonth(date) {
	const d = new Date(date);
	const year = d.getFullYear();
	const month = String(d.getMonth() + 1).padStart(2, '0');
	return `${year}-${month}-01`;
}
