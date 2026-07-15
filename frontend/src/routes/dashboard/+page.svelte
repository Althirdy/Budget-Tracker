<script lang="ts">
    import * as Card from "$lib/components/ui/card";
    import { auth } from "$lib/features/auth/store";
    import { ArrowRight, ShieldCheck, Sparkles } from "@lucide/svelte";
</script>

<svelte:head><title>Dashboard | Trio Budget</title></svelte:head>

<div class="mx-auto max-w-6xl space-y-6">
    <section class="overflow-hidden rounded-2xl border bg-gradient-to-br from-card to-muted/40 p-6 shadow-sm md:p-8">
        <div class="max-w-2xl">
            <div class="mb-4 inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-xs font-medium"><Sparkles class="size-3.5" /> Workspace ready</div>
            <h2 class="text-2xl font-semibold tracking-tight md:text-3xl">Welcome, {$auth.user?.firstName}.</h2>
            <p class="mt-3 text-muted-foreground">Your secure dashboard foundation is ready. Budget summaries and transaction insights will appear here as those features are connected.</p>
        </div>
    </section>

    <div class="grid gap-4 md:grid-cols-2">
        <Card.Root>
            <Card.Header><Card.Title class="flex items-center gap-2 text-base"><ShieldCheck class="size-5 text-primary" /> Secure by default</Card.Title><Card.Description>Your session uses short-lived access and protected refresh credentials.</Card.Description></Card.Header>
        </Card.Root>
        <Card.Root>
            <Card.Header><Card.Title class="flex items-center gap-2 text-base">What’s next <ArrowRight class="size-4" /></Card.Title><Card.Description>Transactions, budgets, categories, and reports are prepared in navigation for future releases.</Card.Description></Card.Header>
        </Card.Root>
    </div>
</div>
