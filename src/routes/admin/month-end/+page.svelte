<script lang="ts">
	import { formatCurrency, toFirstOfMonth } from '$lib/calc.js';
	import { invalidateAll } from '$app/navigation';

	export let data;

	let selectedMonth = toFirstOfMonth(new Date()).slice(0, 7); // YYYY-MM format
	let showPenaltyForm = false;
	let penaltyMemberId = '';
	let penaltyAmount = '';
	let penaltyReason = '';
	let error = '';
	let success = '';
	let loading = false;
	let processing = false;

	// Calculate members who have/haven't saved
	$: savedMemberIds = new Set(data.savings.map((s) => s.member_id));
	$: membersSaved = data.members.filter((m) => savedMemberIds.has(m.id));
	$: membersNotSaved = data.members.filter((m) => !savedMemberIds.has(m.id));
	$: totalPenalties = data.penalties.reduce((sum, p) => sum + parseFloat(p.amount), 0);
	$: allMembersSaved = membersNotSaved.length === 0;

	async function handleAddPenalty() {
		error = '';
		success = '';
		loading = true;

		try {
			const response = await fetch('/api/penalties', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					memberId: parseInt(penaltyMemberId),
					amount: parseFloat(penaltyAmount),
					month: selectedMonth + '-01',
					reason: penaltyReason
				})
			});

			const result = await response.json();

			if (response.ok) {
				const memberName = data.members.find((m) => m.id === parseInt(penaltyMemberId))?.name;
				success = `Penalty of ${formatCurrency(penaltyAmount)} recorded for ${memberName}`;
				penaltyMemberId = '';
				penaltyAmount = '';
				penaltyReason = '';
				showPenaltyForm = false;
				await invalidateAll();
			} else {
				error = result.error || 'Failed to record penalty';
			}
		} catch (err) {
			error = 'Network error. Please try again.';
			console.error('Error recording penalty:', err);
		} finally {
			loading = false;
		}
	}

	async function handleProcessMonthEnd() {
		if (!confirm('Are you sure you want to process month-end? This will distribute penalties and process admin fees. This action cannot be undone.')) {
			return;
		}

		error = '';
		success = '';
		processing = true;

		try {
			const response = await fetch('/api/month-end/process', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					month: selectedMonth + '-01'
				})
			});

			const result = await response.json();

			if (response.ok) {
				success = result.message || 'Month-end processed successfully';
				await invalidateAll();
			} else {
				error = result.error || 'Failed to process month-end';
			}
		} catch (err) {
			error = 'Network error. Please try again.';
			console.error('Error processing month-end:', err);
		} finally {
			processing = false;
		}
	}

	async function handleMonthChange() {
		// Reload data when month changes
		await invalidateAll();
	}
</script>

<svelte:head>
	<title>Month-End Process - Kumunzee Admin</title>
</svelte:head>

<div>
	<div class="flex justify-between items-center mb-6">
		<h2 class="text-3xl font-bold text-gray-900">Month-End Process</h2>
	</div>

	<!-- Success/Error Messages -->
	{#if success}
		<div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
			{success}
		</div>
	{/if}

	{#if error}
		<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
			{error}
		</div>
	{/if}

	<!-- Month Selector -->
	<div class="bg-white rounded-lg shadow p-6 mb-6">
		<div class="flex items-center gap-4">
			<label for="month" class="text-sm font-medium text-gray-700">Select Month:</label>
			<input
				id="month"
				type="month"
				bind:value={selectedMonth}
				on:change={handleMonthChange}
				class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
			/>
			{#if data.isMonthClosed}
				<span class="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
					Month Closed
				</span>
			{:else}
				<span class="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
					Month Open
				</span>
			{/if}
		</div>
	</div>

	<!-- Verification Checklist -->
	<div class="bg-white rounded-lg shadow p-6 mb-6">
		<h3 class="text-lg font-semibold text-gray-900 mb-4">Verification Checklist</h3>

		<div class="space-y-4">
			<!-- Savings Check -->
			<div class="flex items-start gap-3">
				<div class="mt-1">
					{#if allMembersSaved}
						<svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					{:else}
						<svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					{/if}
				</div>
				<div class="flex-1">
					<h4 class="font-medium text-gray-900">Savings Recorded</h4>
					<p class="text-sm text-gray-600">
						{membersSaved.length} of {data.members.length} members have saved this month
					</p>
					{#if !allMembersSaved}
						<div class="mt-2 text-sm">
							<p class="font-medium text-red-600">Missing savings from:</p>
							<ul class="list-disc list-inside text-red-600">
								{#each membersNotSaved as member}
									<li>{member.name}{member.role === 'admin' ? ' (Admin)' : ''}</li>
								{/each}
							</ul>
						</div>
					{/if}
				</div>
			</div>

			<!-- Penalties Summary -->
			<div class="flex items-start gap-3">
				<div class="mt-1">
					<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
					</svg>
				</div>
				<div class="flex-1">
					<h4 class="font-medium text-gray-900">Penalties Recorded</h4>
					<p class="text-sm text-gray-600">
						{data.penalties.length} {data.penalties.length === 1 ? 'penalty' : 'penalties'} totaling {formatCurrency(totalPenalties)}
					</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Penalties Section -->
	<div class="bg-white rounded-lg shadow mb-6">
		<div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
			<h3 class="text-lg font-semibold text-gray-900">Penalties</h3>
			{#if !data.isMonthClosed}
				<button
					on:click={() => (showPenaltyForm = !showPenaltyForm)}
					class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm"
				>
					{showPenaltyForm ? 'Cancel' : '+ Add Penalty'}
				</button>
			{/if}
		</div>

		<!-- Add Penalty Form -->
		{#if showPenaltyForm && !data.isMonthClosed}
			<div class="p-6 border-b border-gray-200 bg-gray-50">
				<form on:submit|preventDefault={handleAddPenalty} class="space-y-4">
					<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<label for="penaltyMember" class="block text-sm font-medium text-gray-700 mb-1">
								Select Member
							</label>
							<select
								id="penaltyMember"
								bind:value={penaltyMemberId}
								required
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
							>
								<option value="">-- Select Member --</option>
								{#each data.members as member}
									<option value={member.id}>{member.name}{member.role === 'admin' ? ' (Admin)' : ''}</option>
								{/each}
							</select>
						</div>

						<div>
							<label for="penaltyAmount" class="block text-sm font-medium text-gray-700 mb-1">
								Amount (K)
							</label>
							<input
								id="penaltyAmount"
								type="number"
								step="0.01"
								min="0.01"
								bind:value={penaltyAmount}
								placeholder="50.00"
								required
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
							/>
						</div>

						<div>
							<label for="penaltyReason" class="block text-sm font-medium text-gray-700 mb-1">
								Reason
							</label>
							<input
								id="penaltyReason"
								type="text"
								bind:value={penaltyReason}
								placeholder="Late payment, missed meeting, etc."
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
							/>
						</div>
					</div>

					<button
						type="submit"
						disabled={loading}
						class="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg"
					>
						{loading ? 'Recording...' : 'Record Penalty'}
					</button>
				</form>
			</div>
		{/if}

		<!-- Penalties List -->
		<div class="p-6">
			{#if data.penalties.length > 0}
				<div class="space-y-3">
					{#each data.penalties as penalty}
						<div class="flex justify-between items-center p-3 bg-red-50 rounded-lg">
							<div>
								<p class="font-medium text-gray-900">{penalty.member_name}</p>
								{#if penalty.reason}
									<p class="text-sm text-gray-600">{penalty.reason}</p>
								{/if}
							</div>
							<p class="font-semibold text-red-600">{formatCurrency(penalty.amount)}</p>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-gray-500 text-center py-4">No penalties recorded for this month.</p>
			{/if}
		</div>
	</div>

	<!-- Process Month-End -->
	{#if !data.isMonthClosed}
		<div class="bg-white rounded-lg shadow p-6">
			<h3 class="text-lg font-semibold text-gray-900 mb-4">Process Month-End</h3>

			<div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
				<h4 class="font-medium text-blue-900 mb-2">What will happen:</h4>
				<ul class="text-sm text-blue-800 space-y-1 list-disc list-inside">
					<li>Penalties will be distributed with 15% interest, split equally among all members</li>
					<li>Admin fee of K50 will be charged to each member</li>
					<li>All distributions will be recorded for the month</li>
					<li>This month will be marked as closed</li>
				</ul>
			</div>

			{#if !allMembersSaved}
				<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
					<p class="text-yellow-800 text-sm">
						<strong>Warning:</strong> Not all members have recorded savings for this month.
						It's recommended to ensure all savings are recorded before processing month-end.
					</p>
				</div>
			{/if}

			<div class="grid grid-cols-2 gap-4 mb-4">
				<div class="bg-gray-50 rounded-lg p-4">
					<p class="text-sm text-gray-600">Total Penalties</p>
					<p class="text-2xl font-bold text-gray-900">{formatCurrency(totalPenalties)}</p>
					<p class="text-xs text-gray-500 mt-1">With 15% interest: {formatCurrency(totalPenalties * 1.15)}</p>
				</div>
				<div class="bg-gray-50 rounded-lg p-4">
					<p class="text-sm text-gray-600">Admin Fees</p>
					<p class="text-2xl font-bold text-gray-900">{formatCurrency(data.members.length * 50)}</p>
					<p class="text-xs text-gray-500 mt-1">K50 × {data.members.length} members</p>
				</div>
			</div>

			<button
				on:click={handleProcessMonthEnd}
				disabled={processing}
				class="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg text-lg"
			>
				{processing ? 'Processing...' : 'Process Month-End'}
			</button>
		</div>
	{:else}
		<div class="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
			<div class="flex items-center gap-3">
				<svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				<div>
					<h3 class="text-lg font-semibold text-green-900">Month Already Closed</h3>
					<p class="text-sm text-green-700">This month has been processed and closed. Select a different month to manage.</p>
				</div>
			</div>
		</div>

		<!-- Month-End Summary Report -->
		{#if data.distributionSummary}
			<div class="bg-white rounded-lg shadow p-6">
				<h3 class="text-lg font-semibold text-gray-900 mb-4">Month-End Summary Report</h3>

				<!-- Summary Stats -->
				<div class="grid grid-cols-3 gap-4 mb-6">
					<div class="bg-gray-50 rounded-lg p-4">
						<p class="text-sm text-gray-600">Total Penalties</p>
						<p class="text-2xl font-bold text-gray-900">{formatCurrency(totalPenalties)}</p>
						<p class="text-xs text-gray-500 mt-1">With 15% interest: {formatCurrency(totalPenalties * 1.15)}</p>
					</div>
					<div class="bg-gray-50 rounded-lg p-4">
						<p class="text-sm text-gray-600">Total Admin Fees</p>
						<p class="text-2xl font-bold text-gray-900">{formatCurrency(data.members.length * 50)}</p>
						<p class="text-xs text-gray-500 mt-1">K50 × {data.members.length} members</p>
					</div>
					<div class="bg-gray-50 rounded-lg p-4">
						<p class="text-sm text-gray-600">Net Distribution</p>
						<p class="text-2xl font-bold text-gray-900">{formatCurrency(data.distributionSummary.totalDistributed)}</p>
						<p class="text-xs text-gray-500 mt-1">Penalty share minus admin fees</p>
					</div>
				</div>

				<!-- Distribution Details -->
				<div>
					<h4 class="font-medium text-gray-900 mb-3">Distribution Per Member</h4>
					<div class="space-y-2">
						{#each data.distributionSummary.distributions as dist}
							<div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
								<span class="font-medium text-gray-900">{dist.member_name}</span>
								<span class="font-semibold {parseFloat(dist.amount) >= 0 ? 'text-blue-600' : 'text-red-600'}">
									{parseFloat(dist.amount) >= 0 ? '+' : ''}{formatCurrency(dist.amount)}
								</span>
							</div>
						{/each}
					</div>
				</div>
			</div>
		{/if}
	{/if}
</div>
