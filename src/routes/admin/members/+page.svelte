<script lang="ts">
	import { formatCurrency } from '$lib/calc.js';
	import { invalidateAll } from '$app/navigation';

	export let data;

	let showAddForm = false;
	let name = '';
	let phone = '';
	let pin = '';
	let error = '';
	let success = '';
	let loading = false;

	async function handleAddMember() {
		error = '';
		success = '';
		loading = true;

		try {
			const response = await fetch('/api/members', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, phone, pin, role: 'member' })
			});

			const result = await response.json();

			if (response.ok) {
				success = `Member ${name} added successfully!`;
				name = '';
				phone = '';
				pin = '';
				showAddForm = false;
				await invalidateAll();
			} else {
				error = result.error || 'Failed to add member';
			}
		} catch (err) {
			error = 'Network error. Please try again.';
			console.error('Error adding member:', err);
		} finally {
			loading = false;
		}
	}

	function handlePinInput(e: Event) {
		const input = e.target as HTMLInputElement;
		input.value = input.value.replace(/\D/g, '').slice(0, 4);
		pin = input.value;
	}
</script>

<svelte:head>
	<title>Members - Kumunzee Admin</title>
</svelte:head>

<div>
	<div class="flex justify-between items-center mb-6">
		<h2 class="text-3xl font-bold text-gray-900">Members</h2>
		<button
			on:click={() => (showAddForm = !showAddForm)}
			class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
		>
			{showAddForm ? 'Cancel' : '+ Add Member'}
		</button>
	</div>

	<!-- Success Message -->
	{#if success}
		<div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
			{success}
		</div>
	{/if}

	<!-- Add Member Form -->
	{#if showAddForm}
		<div class="bg-white rounded-lg shadow p-6 mb-6">
			<h3 class="text-lg font-semibold text-gray-900 mb-4">Add New Member</h3>

			<form on:submit|preventDefault={handleAddMember} class="space-y-4">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="name" class="block text-sm font-medium text-gray-700 mb-1">
							Full Name
						</label>
						<input
							id="name"
							type="text"
							bind:value={name}
							required
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
						/>
					</div>

					<div>
						<label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
							Phone Number
						</label>
						<input
							id="phone"
							type="tel"
							bind:value={phone}
							placeholder="+260971234567"
							required
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
						/>
					</div>
				</div>

				<div>
					<label for="pin" class="block text-sm font-medium text-gray-700 mb-1">
						4-Digit PIN
					</label>
					<input
						id="pin"
						type="password"
						inputmode="numeric"
						pattern="[0-9]*"
						maxlength="4"
						value={pin}
						on:input={handlePinInput}
						placeholder="••••"
						required
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-center tracking-widest"
					/>
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
					{loading ? 'Adding...' : 'Add Member'}
				</button>
			</form>
		</div>
	{/if}

	<!-- Members List -->
	<div class="bg-white rounded-lg shadow overflow-hidden">
		<div class="overflow-x-auto">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
						<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
							Total Savings
						</th>
						<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
							Interest Earned
						</th>
						<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
							Penalties
						</th>
						<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
							Savings + Interest
						</th>
						<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
							Outstanding Loans
						</th>
						<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
							Net Position
						</th>
					</tr>
				</thead>
				<tbody class="bg-white divide-y divide-gray-200">
					{#each data.members as member}
						<tr class="hover:bg-gray-50">
							<td class="px-6 py-4 whitespace-nowrap text-sm">
								<div>
									<div class="font-medium text-gray-900">{member.name}</div>
									<div class="text-xs text-gray-500">{member.phone}</div>
									<span
										class="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full {member.role === 'admin'
											? 'bg-purple-100 text-purple-800'
											: 'bg-blue-100 text-blue-800'}"
									>
										{member.role}
									</span>
								</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
								{formatCurrency(member.total_savings)}
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">
								{formatCurrency(member.total_interest)}
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm text-right {parseFloat(member.penalty_share) >= 0 ? 'text-blue-600' : 'text-red-600'}">
								{formatCurrency(member.penalty_share)}
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
								{formatCurrency(member.savings_plus_interest)}
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm text-right">
								<span class={parseFloat(member.outstanding_loans) > 0 ? 'text-red-600 font-medium' : 'text-gray-900'}>
									{formatCurrency(member.outstanding_loans)}
								</span>
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm text-right">
								<span class="font-semibold {parseFloat(member.net_position) >= 0 ? 'text-green-600' : 'text-red-600'}">
									{formatCurrency(member.net_position)}
								</span>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
