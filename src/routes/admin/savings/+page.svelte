<script lang="ts">
	import { formatCurrency, toFirstOfMonth } from '$lib/calc.js';
	import { goto, invalidateAll } from '$app/navigation';

	export let data;

	let memberId = '';
	let amount = '';
	let month = data.selectedMonth;
	let error = '';
	let success = '';
	let loading = false;

	async function handleRecordSavings() {
		error = '';
		success = '';
		loading = true;

		try {
			const response = await fetch('/api/savings', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					memberId: parseInt(memberId),
					amount: parseFloat(amount),
					month
				})
			});

			const result = await response.json();

			if (response.ok) {
				const memberName = data.members.find((m) => m.id === parseInt(memberId))?.name;
				success = `Savings recorded for ${memberName}`;
				memberId = '';
				amount = '';
				await invalidateAll();
			} else {
				error = result.error || 'Failed to record savings';
			}
		} catch (err) {
			error = 'Network error. Please try again.';
			console.error('Error recording savings:', err);
		} finally {
			loading = false;
		}
	}

	function handleMonthChange() {
		goto(`/admin/savings?month=${month}`);
	}

	$: totalSavings = data.savings.reduce((sum, s) => sum + parseFloat(s.amount), 0);
</script>

<svelte:head>
	<title>Savings - Kumunzee Admin</title>
</svelte:head>

<div>
	<h2 class="text-3xl font-bold text-gray-900 mb-6">Record Savings</h2>

	<!-- Month Selector -->
	<div class="bg-white rounded-lg shadow p-6 mb-6">
		<label for="monthSelect" class="block text-sm font-medium text-gray-700 mb-2">
			Select Month
		</label>
		<input
			id="monthSelect"
			type="month"
			bind:value={month}
			on:change={handleMonthChange}
			class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
		/>
	</div>

	<!-- Success Message -->
	{#if success}
		<div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
			{success}
		</div>
	{/if}

	<!-- Record Savings Form -->
	<div class="bg-white rounded-lg shadow p-6 mb-6">
		<h3 class="text-lg font-semibold text-gray-900 mb-4">Record Savings</h3>

		<form on:submit|preventDefault={handleRecordSavings} class="space-y-4">
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
					<label for="amount" class="block text-sm font-medium text-gray-700 mb-1">
						Amount (K)
					</label>
					<input
						id="amount"
						type="number"
						step="0.01"
						min="500"
						bind:value={amount}
						placeholder="500.00"
						required
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
					/>
					<p class="text-xs text-gray-500 mt-1">Minimum: K500</p>
				</div>
			</div>

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
				{loading ? 'Recording...' : 'Record Savings'}
			</button>
		</form>
	</div>

	<!-- Savings Summary -->
	<div class="bg-white rounded-lg shadow overflow-hidden">
		<div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
			<h3 class="text-lg font-semibold text-gray-900">
				Savings for {new Date(month).toLocaleDateString('en-GB', {
					month: 'long',
					year: 'numeric'
				})}
			</h3>
			<div class="text-right">
				<p class="text-sm text-gray-600">Total Savings</p>
				<p class="text-2xl font-bold text-green-600">{formatCurrency(totalSavings)}</p>
			</div>
		</div>

		{#if data.savings.length > 0}
			<div class="overflow-x-auto">
				<table class="min-w-full divide-y divide-gray-200">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
								Member
							</th>
							<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
								Amount
							</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#each data.savings as saving}
							<tr class="hover:bg-gray-50">
								<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
									{saving.member_name}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
									{formatCurrency(saving.amount)}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<div class="px-6 py-12 text-center text-gray-500">
				No savings recorded for this month yet.
			</div>
		{/if}
	</div>
</div>
