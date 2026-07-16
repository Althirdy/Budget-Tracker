<script lang="ts">
    import { auth, signOut } from "$lib/features/auth/store";
    import { goto } from "$app/navigation";
    import { Button } from "$lib/components/ui/button";
    import { BarChart3, ChevronDown, LayoutDashboard, Menu, ReceiptText, Tags, WalletCards, X } from "@lucide/svelte";

    let { children } = $props();
    let mobileOpen = $state(false);

    const navItems = [
        { label: "Overview", icon: LayoutDashboard, active: true },
        { label: "Transactions", icon: ReceiptText, active: false },
        { label: "Budgets", icon: WalletCards, active: false },
        { label: "Categories", icon: Tags, active: false },
        { label: "Reports", icon: BarChart3, active: false }
    ];

    async function logout() {
        await signOut();
        await goto("/login", { replaceState: true });
    }
</script>

{#snippet sidebar()}
    <div class="flex h-full flex-col bg-sidebar text-sidebar-foreground">
        <div class="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
            <span class="flex size-9 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground"><WalletCards class="size-5" /></span>
            <div><p class="font-semibold leading-none">Trio Budget</p><p class="mt-1 text-xs text-muted-foreground">Expense tracker</p></div>
        </div>
        <nav class="flex-1 space-y-1 p-3" aria-label="Main navigation">
            <p class="px-3 pb-2 pt-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Workspace</p>
            {#each navItems as item}
                <button type="button" disabled={!item.active} aria-current={item.active ? "page" : undefined} class:opacity-50={!item.active} class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors enabled:hover:bg-sidebar-accent enabled:hover:text-sidebar-accent-foreground disabled:cursor-not-allowed {item.active ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}">
                    <item.icon class="size-4" />
                    <span>{item.label}</span>
                    {#if !item.active}<span class="ml-auto text-[10px] font-normal uppercase tracking-wide">Soon</span>{/if}
                </button>
            {/each}
        </nav>
        <div class="border-t border-sidebar-border p-4 text-xs text-muted-foreground">Secure session active</div>
    </div>
{/snippet}

<div class="min-h-screen bg-background">
    <aside class="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-sidebar-border lg:block">{@render sidebar()}</aside>

    {#if mobileOpen}
        <button class="fixed inset-0 z-40 bg-black/50 lg:hidden" aria-label="Close navigation" onclick={() => mobileOpen = false}></button>
        <aside class="fixed inset-y-0 left-0 z-50 w-72 border-r border-sidebar-border shadow-xl lg:hidden">
            <button class="absolute right-3 top-3 z-10 rounded-md p-2 text-muted-foreground hover:bg-sidebar-accent" aria-label="Close navigation" onclick={() => mobileOpen = false}><X class="size-5" /></button>
            {@render sidebar()}
        </aside>
    {/if}

    <div class="lg:pl-64">
        <header class="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/90 px-4 backdrop-blur md:px-6">
            <div class="flex items-center gap-3">
                <Button variant="ghost" size="icon" class="lg:hidden" onclick={() => mobileOpen = true} aria-label="Open navigation"><Menu class="size-5" /></Button>
                <div><h1 class="font-semibold">Overview</h1><p class="hidden text-xs text-muted-foreground sm:block">Your financial workspace</p></div>
            </div>

            <details class="group relative">
                <summary class="flex cursor-pointer list-none items-center gap-2 rounded-lg p-1.5 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <span class="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">{$auth.user?.firstName?.[0]}{$auth.user?.lastName?.[0]}</span>
                    <span class="hidden text-left sm:block"><span class="block text-sm font-medium leading-none">{$auth.user?.firstName} {$auth.user?.lastName}</span><span class="mt-1 block text-xs capitalize text-muted-foreground">{$auth.user?.roleName}</span></span>
                    <ChevronDown class="hidden size-4 text-muted-foreground sm:block" />
                </summary>
                <div class="absolute right-0 mt-2 w-52 rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg">
                    <div class="border-b px-3 py-2"><p class="truncate text-sm font-medium">{$auth.user?.username}</p><p class="truncate text-xs text-muted-foreground">{$auth.user?.email}</p></div>
                    <button type="button" class="mt-1 w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent" onclick={() => void logout()}>Sign out</button>
                </div>
            </details>
        </header>
        <main class="p-4 md:p-6 lg:p-8">{@render children()}</main>
    </div>
</div>
