<script lang="ts">
	import { formatCurrency, calculateLoan, toFirstOfMonth } from '$lib/calc.js';
	import { invalidateAll } from '$app/navigation';

	export let data;

	let showAddForm = false;
	let memberId = '';
	let principal = '';
	let disbursementMonth = toFirstOfMonth(new Date()).slice(0, 7); // YYYY-MM format
	let error = '';
	let success = '';
	let loading = false;

	$: loanCalc = principal ? calculateLoan(parseFloat(principal)) : null;

	async function handleDisburseLoan() {
		error = '';
		success = '';
		loading = true;

		try {
			const response = await fetch('/api/loans', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					memberId: parseInt(memberId),
					principal: parseFloat(principal),
					disbursementMonth: disbursementMonth + '-01'
				})
			});

			const result = await response.json();

			if (response.ok) {
				const memberName = data.members.find((m) => m.id === parseInt(memberId))?.name;
				success = `Loan of ${formatCurrency(principal)} disbursed to ${memberName}`;
				memberId = '';
				principal = '';
				showAddForm = false;
				await invalidateAll();
			} else {
				error = result.error || 'Failed to disburse loan';
			}
		} catch (err) {
			error = 'Network error. Please try again.';
			console.error('Error disbursing loan:', err);
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Loans - Kumunzee Admin</title>
</svelte:head>

<div>
	<div class="flex justify-between items-center mb-6">
		<h2 class="text-3xl font-bold text-gray-900">Loans</h2>
		<button
			on:click={() => (showAddForm = !showAddForm)}
			class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
		>
			{showAddForm ? 'Cancel' : '+ Disburse Loan'}
		</button>
	</div>

	<!-- Success Message -->
	{#if success}
		<div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
			{success}
		</div>
	{/if}

	<!-- Disburse Loan Form -->
	{#if showAddForm}
		<div class="bg-white rounded-lg shadow p-6 mb-6">
			<h3 class="text-lg font-semibold text-gray-900 mb-4">Disburse New Loan</h3>

			<form on:submit|preventDefault={handleDisburseLoan} class="space-y-4">
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<label for="member" class="block text-sm font-medium text-gray-700 mb-1">
							Select Member
						</label>
						<select
							id="member"
							bind:value={memberId}
							required
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
						>
							<option value="">-- Select Member --</option>
							{#each data.members as member}
								<option value={member.id}>{member.name}{member.role === 'admin' ? ' (Admin)' : ''}</option>
							{/each}
						</select>
					</div>

					<div>
						<label for="principal" class="block text-sm font-medium text-gray-700 mb-1">
							Principal Amount (K)
						</label>
						<input
							id="principal"
							type="number"
							step="0.01"
							min="0.01"
							bind:value={principal}
							placeholder="1000.00"
							required
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
						/>
					</div>

					<div>
						<label for="month" class="block text-sm font-medium text-gray-700 mb-1">
							Disbursement Month
						</label>
						<input
							id="month"
							type="month"
							bind:value={disbursementMonth}
							required
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
						/>
					</div>
				</div>

				<!-- Loan Calculation Preview -->
				{#if loanCalc}
					<div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
						<h4 class="font-medium text-blue-900 mb-2">Loan Details</h4>
						<div class="grid grid-cols-3 gap-4 text-sm">
							<div>
								<p class="text-blue-600">Interest (15%)</p>
								<p class="font-semibold text-blue-900">{formatCurrency(loanCalc.interest)}</p>
							</div>
							<div>
								<p class="text-blue-600">Total Amount</p>
								<p class="font-semibold text-blue-900">{formatCurrency(loanCalc.totalAmount)}</p>
							</div>
							<div>
								<p class="text-blue-600">Min Payment (10%)</p>
								<p class="font-semibold text-blue-900">{formatCurrency(loanCalc.minPayment)}</p>
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
					{loading ? 'Disbursing...' : 'Disburse Loan'}
				</button>
			</form>
		</div>
	{/if}

	<!-- Loans List -->
	<div class="bg-white rounded-lg shadow overflow-hidden">
		<div class="px-6 py-4 border-b border-gray-200">
			<h3 class="text-lg font-semibold text-gray-900">All Loans</h3>
		</div>

		{#if data.loans.length > 0}
			<div class="overflow-x-auto">
				<table class="min-w-full divide-y divide-gray-200">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
								Member
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
								Principal
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
								Total Amount
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
								Outstanding
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
								Status
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
								Disbursed
							</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#each data.loans as loan}
							<tr class="hover:bg-gray-50">
								<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
									{loan.member_name}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									{formatCurrency(loan.principal)}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									{formatCurrency(loan.total_amount)}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm">
									<span class={parseFloat(loan.outstanding_balance) > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
										{formatCurrency(loan.outstanding_balance)}
									</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm">
									<span
										class="px-2 py-1 text-xs font-medium rounded-full {loan.status === 'active'
											? 'bg-blue-100 text-blue-800'
											: loan.status === 'paid'
												? 'bg-green-100 text-green-800'
												: 'bg-red-100 text-red-800'}"
									>
										{loan.status}
									</span>
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
			<div class="px-6 py-12 text-center text-gray-500">No loans disbursed yet.</div>
		{/if}
	</div>
</div>
