<script lang="ts">
    import DashboardShell from "$lib/features/dashboard/dashboard-shell.svelte";
    import { initializeAuth } from "$lib/features/auth/store";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { LoaderCircle } from "@lucide/svelte";

    let { children } = $props();
    let ready = $state(false);

    onMount(async () => {
        const state = await initializeAuth();
        if (state.status !== "authenticated") {
            const next = encodeURIComponent(window.location.pathname + window.location.search);
            await goto(`/login?next=${next}`, { replaceState: true });
            return;
        }
        ready = true;
    });
</script>

{#if ready}
    <DashboardShell>{@render children()}</DashboardShell>
{:else}
    <div class="flex min-h-screen items-center justify-center bg-background text-muted-foreground" role="status">
        <LoaderCircle class="mr-2 size-5 animate-spin" /> Restoring your secure session…
    </div>
{/if}
