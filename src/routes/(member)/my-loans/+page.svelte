<script lang="ts">
	import { formatCurrency } from '$lib/calc.js';

	export let data;

	let expandedLoanId: number | null = null;

	function toggleLoan(loanId: number) {
		expandedLoanId = expandedLoanId === loanId ? null : loanId;
	}

	$: activeLoan = data.loans.filter((l) => l.status === 'active');
	$: paidLoans = data.loans.filter((l) => l.status === 'paid');
</script>

<svelte:head>
	<title>My Loans - Kumunzee</title>
</svelte:head>

<div>
	<h2 class="text-3xl font-bold text-gray-900 mb-6">My Loans</h2>

	<!-- Active Loans -->
	{#if activeLoan.length > 0}
		<div class="mb-8">
			<h3 class="text-xl font-semibold text-gray-800 mb-4">Active Loans</h3>
			<div class="space-y-4">
				{#each activeLoan as loan}
					<div class="bg-white rounded-lg shadow overflow-hidden">
						<!-- Loan Summary -->
						<button
							on:click={() => toggleLoan(loan.id)}
							class="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition text-left"
						>
							<div class="flex-1">
								<div class="flex items-center gap-4 mb-2">
									<span class="text-lg font-semibold text-gray-900">
										Loan #{loan.id}
									</span>
									<span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
										{loan.status}
									</span>
								</div>
								<div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
									<div>
										<p class="text-gray-600">Principal</p>
										<p class="font-medium text-gray-900">{formatCurrency(loan.principal)}</p>
									</div>
									<div>
										<p class="text-gray-600">Total Amount</p>
										<p class="font-medium text-gray-900">{formatCurrency(loan.total_amount)}</p>
									</div>
									<div>
										<p class="text-gray-600">Outstanding</p>
										<p class="font-medium text-red-600">{formatCurrency(loan.outstanding_balance)}</p>
									</div>
									<div>
										<p class="text-gray-600">Disbursed</p>
										<p class="font-medium text-gray-900">
											{new Date(loan.disbursement_month).toLocaleDateString('en-GB', {
												month: 'short',
												year: 'numeric'
											})}
										</p>
									</div>
								</div>
							</div>
							<svg
								class="w-5 h-5 text-gray-400 transition-transform {expandedLoanId === loan.id ? 'rotate-180' : ''}"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
							</svg>
						</button>

						<!-- Repayment History (Expandable) -->
						{#if expandedLoanId === loan.id}
							<div class="border-t border-gray-200 px-6 py-4 bg-gray-50">
								<h4 class="font-medium text-gray-900 mb-3">Repayment History</h4>
								{#if loan.repayments.length > 0}
									<div class="overflow-x-auto">
										<table class="min-w-full">
											<thead>
												<tr class="text-left text-xs text-gray-600 border-b border-gray-200">
													<th class="pb-2">Date</th>
													<th class="pb-2">Amount</th>
													<th class="pb-2">Month</th>
												</tr>
											</thead>
											<tbody class="text-sm">
												{#each loan.repayments as repayment}
													<tr class="border-b border-gray-100 last:border-0">
														<td class="py-2 text-gray-600">
															{new Date(repayment.created_at).toLocaleDateString('en-GB', {
																day: '2-digit',
																month: 'short',
																year: 'numeric'
															})}
														</td>
														<td class="py-2 font-medium text-green-600">
															{formatCurrency(repayment.amount)}
														</td>
														<td class="py-2 text-gray-600">
															{new Date(repayment.payment_month).toLocaleDateString('en-GB', {
																month: 'short',
																year: 'numeric'
															})}
														</td>
													</tr>
												{/each}
											</tbody>
										</table>
									</div>
								{:else}
									<p class="text-sm text-gray-500">No repayments recorded yet.</p>
								{/if}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Paid Loans -->
	{#if paidLoans.length > 0}
		<div>
			<h3 class="text-xl font-semibold text-gray-800 mb-4">Paid Loans</h3>
			<div class="space-y-4">
				{#each paidLoans as loan}
					<div class="bg-white rounded-lg shadow overflow-hidden">
						<button
							on:click={() => toggleLoan(loan.id)}
							class="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition text-left"
						>
							<div class="flex-1">
								<div class="flex items-center gap-4 mb-2">
									<span class="text-lg font-semibold text-gray-900">
										Loan #{loan.id}
									</span>
									<span class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
										{loan.status}
									</span>
								</div>
								<div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
									<div>
										<p class="text-gray-600">Principal</p>
										<p class="font-medium text-gray-900">{formatCurrency(loan.principal)}</p>
									</div>
									<div>
										<p class="text-gray-600">Total Paid</p>
										<p class="font-medium text-green-600">{formatCurrency(loan.total_amount)}</p>
									</div>
									<div>
										<p class="text-gray-600">Disbursed</p>
										<p class="font-medium text-gray-900">
											{new Date(loan.disbursement_month).toLocaleDateString('en-GB', {
												month: 'short',
												year: 'numeric'
											})}
										</p>
									</div>
								</div>
							</div>
							<svg
								class="w-5 h-5 text-gray-400 transition-transform {expandedLoanId === loan.id ? 'rotate-180' : ''}"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
							</svg>
						</button>

						{#if expandedLoanId === loan.id}
							<div class="border-t border-gray-200 px-6 py-4 bg-gray-50">
								<h4 class="font-medium text-gray-900 mb-3">Repayment History</h4>
								{#if loan.repayments.length > 0}
									<div class="overflow-x-auto">
										<table class="min-w-full">
											<thead>
												<tr class="text-left text-xs text-gray-600 border-b border-gray-200">
													<th class="pb-2">Date</th>
													<th class="pb-2">Amount</th>
													<th class="pb-2">Month</th>
												</tr>
											</thead>
											<tbody class="text-sm">
												{#each loan.repayments as repayment}
													<tr class="border-b border-gray-100 last:border-0">
														<td class="py-2 text-gray-600">
															{new Date(repayment.created_at).toLocaleDateString('en-GB', {
																day: '2-digit',
																month: 'short',
																year: 'numeric'
															})}
														</td>
														<td class="py-2 font-medium text-green-600">
															{formatCurrency(repayment.amount)}
														</td>
														<td class="py-2 text-gray-600">
															{new Date(repayment.payment_month).toLocaleDateString('en-GB', {
																month: 'short',
																year: 'numeric'
															})}
														</td>
													</tr>
												{/each}
											</tbody>
										</table>
									</div>
								{:else}
									<p class="text-sm text-gray-500">No repayments recorded.</p>
								{/if}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- No Loans Message -->
	{#if data.loans.length === 0}
		<div class="bg-white rounded-lg shadow p-12 text-center">
			<span class="text-6xl mb-4 block">📋</span>
			<h3 class="text-xl font-semibold text-gray-900 mb-2">No Loans Yet</h3>
			<p class="text-gray-600">You haven't taken any loans from the village bank.</p>
		</div>
	{/if}
</div>
