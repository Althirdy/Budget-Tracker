<script lang="ts">
	import * as Card from "$lib/components/ui/card";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import { loginAccount } from "$lib/features/auth/api";


    let login = "";
    let password = "";
    let loading = false;
    let error = "";

    async function handleLogin() {
        error = "";
        loading = true;

        try {
            const response = await loginAccount({
                login,
                password
            });

            console.log(response);

            // Save token
            // Redirect
            // Update auth store

        } catch (err) {
            error = err instanceof Error ? err.message : "Login failed";
        } finally {
            loading = false;
        }
    }
</script>

<svelte:head>
	<title>Login</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-muted px-4">
	<Card.Root class=" w-80 max-w-md shadow-lg">
		<Card.Header class="space-y-2 text-center">
			<Card.Title class="text-3xl font-bold">
				Trio-BudgetT
			</Card.Title>

			<Card.Description>
				Sign in to your account to continue
			</Card.Description>
		</Card.Header>

		<Card.Content>
			<form class="space-y-5" on:submit|preventDefault={handleLogin}>
				<div class="space-y-2">
					<Label for="login">Email</Label>

					<Input
						id="login"
						type="login"
						placeholder="john@example.com"
						bind:value={login}
						required
					/>
				</div>

				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<Label for="password">Password</Label>

						<a
							href="/forgot-password"
							class="text-sm text-primary hover:underline"
						>
							Forgot Password?
						</a>
					</div>

					<Input
						id="password"
						type="password"
						placeholder="••••••••"
						bind:value={password}
						required
					/>
				</div>

				<Button class="w-full" type="submit">
					Login
				</Button>
			</form>
		</Card.Content>

		<Card.Footer class="justify-center">
			<p class="text-muted-foreground text-sm">
				Don't have an account?
				<a
					href="/register"
					class="font-medium text-primary hover:underline"
				>
					Sign up
				</a>
			</p>
		</Card.Footer>
	</Card.Root>
</div>