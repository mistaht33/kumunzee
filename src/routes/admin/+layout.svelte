<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	async function handleLogout() {
		await fetch('/api/auth/logout', { method: 'POST' });
		goto('/login');
	}
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-green-700 text-white shadow-lg">
		<div class="max-w-7xl mx-auto px-4 py-4">
			<div class="flex justify-between items-center">
				<div>
					<h1 class="text-2xl font-bold">Kumunzee Admin</h1>
					<p class="text-green-100 text-sm">Village Bank Management</p>
				</div>
				<button
					on:click={handleLogout}
					class="bg-green-800 hover:bg-green-900 px-4 py-2 rounded-lg text-sm font-medium transition"
				>
					Logout
				</button>
			</div>
		</div>
	</header>

	<!-- Navigation -->
	<nav class="bg-white border-b border-gray-200">
		<div class="max-w-7xl mx-auto px-4">
			<div class="flex space-x-8 overflow-x-auto">
				<a
					href="/admin"
					class="py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap {$page.url
						.pathname === '/admin'
						? 'border-green-600 text-green-600'
						: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
				>
					Dashboard
				</a>
				<a
					href="/admin/members"
					class="py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap {$page.url.pathname.startsWith(
						'/admin/members'
					)
						? 'border-green-600 text-green-600'
						: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
				>
					Members
				</a>
				<a
					href="/admin/savings"
					class="py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap {$page.url.pathname.startsWith(
						'/admin/savings'
					)
						? 'border-green-600 text-green-600'
						: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
				>
					Savings
				</a>
				<a
					href="/admin/loans"
					class="py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap {$page.url.pathname.startsWith(
						'/admin/loans'
					)
						? 'border-green-600 text-green-600'
						: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
				>
					Loans
				</a>
				<a
					href="/admin/repayments"
					class="py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap {$page.url.pathname.startsWith(
						'/admin/repayments'
					)
						? 'border-green-600 text-green-600'
						: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
				>
					Repayments
				</a>
				<a
					href="/admin/month-end"
					class="py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap {$page.url.pathname.startsWith(
						'/admin/month-end'
					)
						? 'border-green-600 text-green-600'
						: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
				>
					Month-End
				</a>
			</div>
		</div>
	</nav>

	<!-- Main Content -->
	<main class="max-w-7xl mx-auto px-4 py-6">
		<slot />
	</main>
</div>
