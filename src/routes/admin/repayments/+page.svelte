<script lang="ts">
	import { formatCurrency, toFirstOfMonth } from '$lib/calc.js';
	import { invalidateAll } from '$app/navigation';

	export let data;

	let loanId = '';
	let amount = '';
	let paymentMonth = toFirstOfMonth(new Date()).slice(0, 7); // YYYY-MM format
	let error = '';
	let success = '';
	let loading = false;

	$: selectedLoan = data.activeLoans.find((l) => l.id === parseInt(loanId));

	async function handleRecordRepayment() {
		error = '';
		success = '';
		loading = true;

		try {
			const response = await fetch(`/api/loans/${loanId}/repayments`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					amount: parseFloat(amount),
					paymentMonth: paymentMonth + '-01'
				})
			});

			const result = await response.json();

			if (response.ok) {
				const loan = data.activeLoans.find((l) => l.id === parseInt(loanId));
				success = `Repayment of ${formatCurrency(amount)} recorded for ${loan?.member_name}`;
				loanId = '';
				amount = '';
				await invalidateAll();
			} else {
				error = result.error || 'Failed to record repayment';
			}
		} catch (err) {
			error = 'Network error. Please try again.';
			console.error('Error recording repayment:', err);
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Repayments - Kumunzee Admin</title>
</svelte:head>

<div>
	<h2 class="text-3xl font-bold text-gray-900 mb-6">Record Loan Repayments</h2>

	<!-- Success Message -->
	{#if success}
		<div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
			{success}
		</div>
	{/if}

	<!-- Record Repayment Form -->
	<div class="bg-white rounded-lg shadow p-6 mb-6">
		<h3 class="text-lg font-semibold text-gray-900 mb-4">Record Repayment</h3>

		<form on:submit|preventDefault={handleRecordRepayment} class="space-y-4">
			<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div>
					<label for="loan" class="block text-sm font-medium text-gray-700 mb-1">
						Select Loan
					</label>
					<select
						id="loan"
						bind:value={loanId}
						required
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
					>
						<option value="">-- Select Loan --</option>
						{#each data.activeLoans as loan}
							<option value={loan.id}>
								{loan.member_name} - {formatCurrency(loan.outstanding_balance)} outstanding
							</option>
						{/each}
					</select>
				</div>

				<div>
					<label for="amount" class="block text-sm font-medium text-gray-700 mb-1">
						Repayment Amount (K)
					</label>
					<input
						id="amount"
						type="number"
						step="0.01"
						min="0.01"
						max={selectedLoan ? parseFloat(selectedLoan.outstanding_balance) : undefined}
						bind:value={amount}
						placeholder="0.00"
						required
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
					/>
				</div>

				<div>
					<label for="month" class="block text-sm font-medium text-gray-700 mb-1">
						Payment Month
					</label>
					<input
						id="month"
						type="month"
						bind:value={paymentMonth}
						required
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
					/>
				</div>
			</div>

			<!-- Loan Details Preview -->
			{#if selectedLoan}
				<div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
					<h4 class="font-medium text-blue-900 mb-2">Loan Details</h4>
					<div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
						<div>
							<p class="text-blue-600">Member</p>
							<p class="font-semibold text-blue-900">{selectedLoan.member_name}</p>
						</div>
						<div>
							<p class="text-blue-600">Total Loan</p>
							<p class="font-semibold text-blue-900">{formatCurrency(selectedLoan.total_amount)}</p>
						</div>
						<div>
							<p class="text-blue-600">Outstanding</p>
							<p class="font-semibold text-red-600">
								{formatCurrency(selectedLoan.outstanding_balance)}
							</p>
						</div>
						<div>
							<p class="text-blue-600">After Payment</p>
							<p class="font-semibold text-green-600">
								{formatCurrency(
									Math.max(0, parseFloat(selectedLoan.outstanding_balance) - (parseFloat(amount) || 0))
								)}
							</p>
						</div>
					</div>
				</div>
			{/if}

			{#if error}
				<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
					{error}
				</div>
			{/if}

			<button
				type="submit"
				disabled={loading}
				class="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg"
			>
				{loading ? 'Recording...' : 'Record Repayment'}
			</button>
		</form>
	</div>

	<!-- Active Loans Summary -->
	<div class="bg-white rounded-lg shadow mb-6 overflow-hidden">
		<div class="px-6 py-4 border-b border-gray-200">
			<h3 class="text-lg font-semibold text-gray-900">Active Loans</h3>
		</div>

		{#if data.activeLoans.length > 0}
			<div class="overflow-x-auto">
				<table class="min-w-full divide-y divide-gray-200">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
								Member
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
								Total Loan
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
								Outstanding
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
								Disbursed
							</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#each data.activeLoans as loan}
							<tr class="hover:bg-gray-50">
								<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
									{loan.member_name}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									{formatCurrency(loan.total_amount)}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
									{formatCurrency(loan.outstanding_balance)}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{new Date(loan.disbursement_month).toLocaleDateString('en-GB', {
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
			<div class="px-6 py-12 text-center text-gray-500">No active loans with outstanding balance.</div>
		{/if}
	</div>

	<!-- Recent Repayments -->
	{#if data.recentRepayments.length > 0}
		<div class="bg-white rounded-lg shadow overflow-hidden">
			<div class="px-6 py-4 border-b border-gray-200">
				<h3 class="text-lg font-semibold text-gray-900">Recent Repayments</h3>
			</div>
			<div class="overflow-x-auto">
				<table class="min-w-full divide-y divide-gray-200">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
								Member
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
								Amount
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
								Payment Month
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
								Recorded
							</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#each data.recentRepayments as repayment}
							<tr class="hover:bg-gray-50">
								<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
									{repayment.member_name}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
									{formatCurrency(repayment.amount)}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
									{new Date(repayment.payment_month).toLocaleDateString('en-GB', {
										month: 'short',
										year: 'numeric'
									})}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{new Date(repayment.created_at).toLocaleDateString('en-GB', {
										day: '2-digit',
										month: 'short',
										year: 'numeric'
									})}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>
