<script lang="ts">
	import { goto } from '$app/navigation';

	let phone = '';
	let pin = '';
	let error = '';
	let loading = false;

	async function handleLogin() {
		error = '';
		loading = true;

		try {
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ phone, pin })
			});

			const data = await response.json();

			if (response.ok) {
				// Redirect based on role
				if (data.user.role === 'admin') {
					goto('/admin');
				} else {
					goto('/dashboard');
				}
			} else {
				error = data.error || 'Login failed';
			}
		} catch (err) {
			error = 'Network error. Please try again.';
			console.error('Login error:', err);
		} finally {
			loading = false;
		}
	}

	function handlePinInput(e: Event) {
		const input = e.target as HTMLInputElement;
		// Only allow digits and limit to 4 characters
		input.value = input.value.replace(/\D/g, '').slice(0, 4);
		pin = input.value;
	}
</script>

<svelte:head>
	<title>Login - Kumunzee</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
	<div class="max-w-md w-full">
		<!-- Logo/Header -->
		<div class="text-center mb-8">
			<h1 class="text-4xl font-bold text-green-700 mb-2">Kumunzee</h1>
			<p class="text-gray-600">Village Bank System</p>
		</div>

		<!-- Login Card -->
		<div class="bg-white rounded-lg shadow-lg p-6">
			<h2 class="text-2xl font-semibold text-gray-800 mb-6">Login</h2>

			<form on:submit|preventDefault={handleLogin} class="space-y-4">
				<!-- Phone Number -->
				<div>
					<label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
						Phone Number
					</label>
					<input
						id="phone"
						type="tel"
						bind:value={phone}
						placeholder="+260971234567"
						required
						class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
						style="min-height: 44px;"
					/>
				</div>

				<!-- PIN -->
				<div>
					<label for="pin" class="block text-sm font-medium text-gray-700 mb-2">
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
						class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-2xl tracking-widest text-center"
						style="min-height: 44px;"
					/>
				</div>

				<!-- Error Message -->
				{#if error}
					<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
						{error}
					</div>
				{/if}

				<!-- Submit Button -->
				<button
					type="submit"
					disabled={loading}
					class="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
					style="min-height: 44px;"
				>
					{loading ? 'Logging in...' : 'Login'}
				</button>
			</form>

			<!-- Demo Info -->
			<div class="mt-6 pt-6 border-t border-gray-200">
				<p class="text-xs text-gray-500 text-center">
					Demo: Admin +260971234567 / PIN: 1234<br />
					Member +260971111111 / PIN: 1111
				</p>
			</div>
		</div>
	</div>
</div>
