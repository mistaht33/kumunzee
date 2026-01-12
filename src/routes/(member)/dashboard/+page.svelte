<script lang="ts">
	import { formatCurrency } from '$lib/calc.js';

	export let data;
</script>

<svelte:head>
	<title>Dashboard - Kumunzee</title>
</svelte:head>

<div>
	<h2 class="text-3xl font-bold text-gray-900 mb-2">Welcome, {data.memberName}</h2>
	<p class="text-gray-600 mb-6">Your financial summary</p>

	<!-- Summary Cards -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
		<!-- Total Equity -->
		<div class="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6">
			<p class="text-green-100 text-sm mb-1">Total Equity</p>
			<p class="text-4xl font-bold">{formatCurrency(data.summary.totalEquity)}</p>
			<p class="text-green-100 text-xs mt-2">Your total value in the bank</p>
		</div>

		<!-- Net Position -->
		<div class="bg-white rounded-lg shadow p-6">
			<p class="text-gray-600 text-sm mb-1">Net Position</p>
			<p class="text-3xl font-bold {data.summary.netPosition >= 0 ? 'text-green-600' : 'text-red-600'}">
				{formatCurrency(data.summary.netPosition)}
			</p>
			<p class="text-gray-500 text-xs mt-2">Equity minus outstanding loans</p>
		</div>

		<!-- Outstanding Loans -->
		<div class="bg-white rounded-lg shadow p-6">
			<p class="text-gray-600 text-sm mb-1">Outstanding Loans</p>
			<p class="text-3xl font-bold text-red-600">{formatCurrency(data.summary.outstandingLoans)}</p>
			<p class="text-gray-500 text-xs mt-2">{data.loanStats.activeLoans} active loan(s)</p>
		</div>
	</div>

	<!-- Detailed Breakdown -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
		<!-- Total Savings -->
		<div class="bg-white rounded-lg shadow p-6">
			<div class="flex items-center justify-between mb-2">
				<p class="text-sm font-medium text-gray-600">Total Savings</p>
				<span class="text-2xl">💰</span>
			</div>
			<p class="text-2xl font-bold text-gray-900">{formatCurrency(data.summary.totalSavings)}</p>
		</div>

		<!-- Interest Earned -->
		<div class="bg-white rounded-lg shadow p-6">
			<div class="flex items-center justify-between mb-2">
				<p class="text-sm font-medium text-gray-600">Interest Earned</p>
				<span class="text-2xl">📈</span>
			</div>
			<p class="text-2xl font-bold text-green-600">{formatCurrency(data.summary.interestEarned)}</p>
		</div>

		<!-- Penalty Share -->
		{#if data.summary.penaltyShare > 0}
			<div class="bg-white rounded-lg shadow p-6">
				<div class="flex items-center justify-between mb-2">
					<p class="text-sm font-medium text-gray-600">Penalty Share</p>
					<span class="text-2xl">🎁</span>
				</div>
				<p class="text-2xl font-bold text-blue-600">{formatCurrency(data.summary.penaltyShare)}</p>
			</div>
		{/if}
	</div>

	<!-- Recent Activity -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<!-- Recent Savings -->
		<div class="bg-white rounded-lg shadow">
			<div class="px-6 py-4 border-b border-gray-200">
				<h3 class="text-lg font-semibold text-gray-900">Recent Savings</h3>
			</div>
			{#if data.recentSavings.length > 0}
				<div class="p-6">
					<div class="space-y-3">
						{#each data.recentSavings as saving}
							<div class="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
								<span class="text-sm text-gray-600">
									{new Date(saving.month).toLocaleDateString('en-GB', {
										month: 'short',
										year: 'numeric'
									})}
								</span>
								<span class="text-sm font-medium text-gray-900">{formatCurrency(saving.amount)}</span>
							</div>
						{/each}
					</div>
				</div>
			{:else}
				<div class="px-6 py-12 text-center text-gray-500">No savings recorded yet.</div>
			{/if}
		</div>

		<!-- Recent Interest -->
		<div class="bg-white rounded-lg shadow">
			<div class="px-6 py-4 border-b border-gray-200">
				<h3 class="text-lg font-semibold text-gray-900">Recent Interest Earned</h3>
			</div>
			{#if data.recentInterest.length > 0}
				<div class="p-6">
					<div class="space-y-3">
						{#each data.recentInterest as interest}
							<div class="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
								<span class="text-sm text-gray-600">
									{new Date(interest.repayment_month).toLocaleDateString('en-GB', {
										month: 'short',
										year: 'numeric'
									})}
								</span>
								<span class="text-sm font-medium text-green-600">+{formatCurrency(interest.amount)}</span>
							</div>
						{/each}
					</div>
				</div>
			{:else}
				<div class="px-6 py-12 text-center text-gray-500">No interest earned yet.</div>
			{/if}
		</div>

		<!-- Recent Penalty Distributions -->
		<div class="bg-white rounded-lg shadow">
			<div class="px-6 py-4 border-b border-gray-200">
				<h3 class="text-lg font-semibold text-gray-900">Monthly Distributions</h3>
				<p class="text-xs text-gray-500 mt-1">Penalty share minus admin fee</p>
			</div>
			{#if data.recentPenalties.length > 0}
				<div class="p-6">
					<div class="space-y-3">
						{#each data.recentPenalties as penalty}
							<div class="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
								<span class="text-sm text-gray-600">
									{new Date(penalty.month).toLocaleDateString('en-GB', {
										month: 'short',
										year: 'numeric'
									})}
								</span>
								<span class="text-sm font-medium {parseFloat(penalty.amount) >= 0 ? 'text-blue-600' : 'text-red-600'}">
									{parseFloat(penalty.amount) >= 0 ? '+' : ''}{formatCurrency(penalty.amount)}
								</span>
							</div>
						{/each}
					</div>
				</div>
			{:else}
				<div class="px-6 py-12 text-center text-gray-500">No distributions yet.</div>
			{/if}
		</div>
	</div>
</div>
