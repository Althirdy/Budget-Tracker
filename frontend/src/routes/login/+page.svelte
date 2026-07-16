<script lang="ts">
    import * as Card from "$lib/components/ui/card";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { loginSchema } from "$lib/features/auth/schema";
    import { initializeAuth, signIn } from "$lib/features/auth/store";
    import { goto } from "$app/navigation";
    import { page } from "$app/state";
    import { onMount } from "svelte";
    import { Eye, EyeOff, LoaderCircle, WalletCards } from "@lucide/svelte";

    let login = $state("");
    let password = $state("");
    let loading = $state(false);
    let error = $state("");
    let fieldErrors = $state<Record<string, string>>({});
    let showPassword = $state(false);
    let sessionReady = $state(false);

    function safeDestination(value: string | null) {
        return value?.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
    }

    onMount(async () => {
        const state = await initializeAuth();
        if (state.status === "authenticated") await goto("/dashboard", { replaceState: true });
        sessionReady = true;
    });

    async function handleLogin() {
        error = "";
        fieldErrors = {};
        const result = loginSchema.safeParse({ login, password });
        if (!result.success) {
            for (const issue of result.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
            return;
        }

        loading = true;
        try {
            await signIn(login, password);
            await goto(safeDestination(page.url.searchParams.get("next")), { replaceState: true });
        } catch (err) {
            error = err instanceof Error ? err.message : "Unable to sign in. Please try again.";
        } finally {
            loading = false;
        }
    }
</script>

<svelte:head><title>Sign in | Trio Budget</title></svelte:head>

<div class="relative flex min-h-screen items-center justify-center overflow-hidden bg-muted/40 px-4 py-10">
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--color-primary)_0,transparent_26%)] opacity-10"></div>
    <Card.Root class="relative w-full max-w-md border-border/70 shadow-xl">
        <Card.Header class="space-y-2 text-center">
            <div class="mx-auto mb-2 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                <WalletCards class="size-6" />
            </div>
            <Card.Title class="text-3xl font-bold">Welcome back</Card.Title>
            <Card.Description>Sign in to Trio Budget to manage your money</Card.Description>
        </Card.Header>

        <Card.Content>
            <form class="space-y-5" onsubmit={(event) => { event.preventDefault(); void handleLogin(); }} novalidate>
                <div class="space-y-2">
                    <Label for="login">Email or username</Label>
                    <Input id="login" type="text" placeholder="john@example.com" autocomplete="username" bind:value={login} aria-invalid={Boolean(fieldErrors.login)} />
                    {#if fieldErrors.login}<p class="text-sm text-destructive">{fieldErrors.login}</p>{/if}
                </div>

                <div class="space-y-2">
                    <Label for="password">Password</Label>
                    <div class="relative">
                        <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" autocomplete="current-password" class="pr-11" bind:value={password} aria-invalid={Boolean(fieldErrors.password)} />
                        <button type="button" class="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground hover:text-foreground" aria-label={showPassword ? "Hide password" : "Show password"} onclick={() => showPassword = !showPassword}>
                            {#if showPassword}<EyeOff class="size-4" />{:else}<Eye class="size-4" />{/if}
                        </button>
                    </div>
                    {#if fieldErrors.password}<p class="text-sm text-destructive">{fieldErrors.password}</p>{/if}
                </div>

                {#if error}<p class="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert" aria-live="polite">{error}</p>{/if}
                <Button class="w-full" type="submit" disabled={loading || !sessionReady}>
                    {#if loading || !sessionReady}<LoaderCircle class="mr-2 size-4 animate-spin" /> {sessionReady ? "Signing in..." : "Checking session..."}{:else}Sign in{/if}
                </Button>
            </form>
        </Card.Content>

        <Card.Footer class="justify-center border-t py-4">
            <p class="text-center text-xs text-muted-foreground">Protected by secure, short-lived sessions.</p>
        </Card.Footer>
    </Card.Root>
</div>
