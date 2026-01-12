<script lang="ts">
	import { formatCurrency } from '$lib/calc.js';

	export let data;
</script>

<svelte:head>
	<title>Admin Dashboard - Kumunzee</title>
</svelte:head>

<div>
	<h2 class="text-3xl font-bold text-gray-900 mb-6">Dashboard</h2>

	<!-- Statistics Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
		<!-- Total Savings -->
		<div class="bg-white rounded-lg shadow p-6">
			<div class="flex items-center justify-between mb-2">
				<p class="text-sm font-medium text-gray-600">Total Savings</p>
				<span class="text-2xl">💰</span>
			</div>
			<p class="text-3xl font-bold text-gray-900">{formatCurrency(data.stats.totalSavings)}</p>
			<p class="text-xs text-gray-500 mt-1">
				{data.stats.membersWithSavings}/{data.stats.totalMembers} members
			</p>
		</div>

		<!-- Active Loans -->
		<div class="bg-white rounded-lg shadow p-6">
			<div class="flex items-center justify-between mb-2">
				<p class="text-sm font-medium text-gray-600">Active Loans</p>
				<span class="text-2xl">📝</span>
			</div>
			<p class="text-3xl font-bold text-gray-900">{data.stats.activeLoans}</p>
			<p class="text-xs text-gray-500 mt-1">loan(s) outstanding</p>
		</div>

		<!-- Total Outstanding -->
		<div class="bg-white rounded-lg shadow p-6">
			<div class="flex items-center justify-between mb-2">
				<p class="text-sm font-medium text-gray-600">Total Outstanding</p>
				<span class="text-2xl">💳</span>
			</div>
			<p class="text-3xl font-bold text-red-600">{formatCurrency(data.stats.totalOutstanding)}</p>
			<p class="text-xs text-gray-500 mt-1">to be repaid</p>
		</div>

		<!-- Total Members -->
		<div class="bg-white rounded-lg shadow p-6">
			<div class="flex items-center justify-between mb-2">
				<p class="text-sm font-medium text-gray-600">Total Members</p>
				<span class="text-2xl">👥</span>
			</div>
			<p class="text-3xl font-bold text-gray-900">{data.stats.totalMembers}</p>
			<p class="text-xs text-gray-500 mt-1">registered members</p>
		</div>
	</div>

	<!-- Quick Actions -->
	<div class="bg-white rounded-lg shadow mb-8">
		<div class="px-6 py-4 border-b border-gray-200">
			<h3 class="text-lg font-semibold text-gray-900">Quick Actions</h3>
		</div>
		<div class="p-6">
			<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
				<a
					href="/admin/savings"
					class="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition"
					style="min-height: 120px;"
				>
					<span class="text-3xl mb-2">💵</span>
					<span class="text-sm font-medium text-gray-700">Record Savings</span>
				</a>

				<a
					href="/admin/loans"
					class="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition"
					style="min-height: 120px;"
				>
					<span class="text-3xl mb-2">🏦</span>
					<span class="text-sm font-medium text-gray-700">Disburse Loan</span>
				</a>

				<a
					href="/admin/repayments"
					class="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition"
					style="min-height: 120px;"
				>
					<span class="text-3xl mb-2">✅</span>
					<span class="text-sm font-medium text-gray-700">Record Repayment</span>
				</a>

				<a
					href="/admin/members"
					class="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition"
					style="min-height: 120px;"
				>
					<span class="text-3xl mb-2">👤</span>
					<span class="text-sm font-medium text-gray-700">Manage Members</span>
				</a>
			</div>
		</div>
	</div>

	<!-- Recent Loans -->
	{#if data.recentLoans.length > 0}
		<div class="bg-white rounded-lg shadow">
			<div class="px-6 py-4 border-b border-gray-200">
				<h3 class="text-lg font-semibold text-gray-900">Recent Loans</h3>
			</div>
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
								Disbursed
							</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#each data.recentLoans as loan}
							<tr>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									{loan.member_name}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
									{formatCurrency(loan.principal)}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{new Date(loan.disbursement_month).toLocaleDateString('en-GB', {
										year: 'numeric',
										month: 'short'
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
