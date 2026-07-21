import { AlertCircle, CalendarRange, Plus, RefreshCw } from "lucide-react"
import { useMemo, useState } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { BudgetFormDialog } from "@/features/budgets/components/budget-form-dialog"
import { BudgetTable } from "@/features/budgets/components/budget-table"
import { DeleteBudgetDialog } from "@/features/budgets/components/delete-budget-dialog"
import { currentPeriod, formatPeriod, formatPhp } from "@/features/budgets/model/budget-format"
import type { Budget } from "@/features/budgets/model/budget-types"
import { useBudgets } from "@/features/budgets/model/use-budgets"
import { useCategories } from "@/features/categories/model/use-categories"

export function BudgetsPage() {
  const [period, setPeriod] = useState(currentPeriod)
  const [formOpen, setFormOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [deletingBudget, setDeletingBudget] = useState<Budget | null>(null)
  const { budgets, meta, isLoading, error, refresh, create, update, remove } = useBudgets(period)
  const { categories, isLoading: categoriesLoading, error: categoriesError, refresh: refreshCategories } = useCategories({ status: "active", type: "expense" })

  const eligibleCategories = useMemo(() => {
    const budgetedCategoryIds = new Set(budgets.map((budget) => budget.category.id))
    return categories.filter((category) => !budgetedCategoryIds.has(category.id))
  }, [budgets, categories])

  const openCreate = () => { setEditingBudget(null); setFormOpen(true) }
  const openEdit = (budget: Budget) => { setEditingBudget(budget); setFormOpen(true) }
  const pageError = error ?? categoriesError

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div><h2 className="font-heading text-2xl font-semibold tracking-tight">Monthly budgets</h2><p className="text-sm text-muted-foreground">Plan spending limits for your expense categories.</p></div>
        <Button onClick={openCreate} disabled={isLoading || categoriesLoading}><Plus />New budget</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(240px,0.4fr)]">
        <Card>
          <CardHeader><CardTitle>{formatPeriod(period)}</CardTitle><CardDescription>Total planned spending for this month</CardDescription></CardHeader>
          <CardContent><p className="font-heading text-3xl font-semibold">{formatPhp(meta.planned_total)}</p><p className="mt-1 text-xs text-muted-foreground">PHP | {budgets.length} {budgets.length === 1 ? "category" : "categories"}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Budget month</CardTitle><CardDescription>Review or prepare another calendar month.</CardDescription></CardHeader>
          <CardContent className="space-y-2"><Label htmlFor="budget-period">Month</Label><Input id="budget-period" type="month" value={period} onChange={(event) => event.target.value && setPeriod(event.target.value)} /></CardContent>
        </Card>
      </div>

      {pageError && <Alert variant="destructive"><AlertCircle /><AlertTitle>Unable to load budgets</AlertTitle><AlertDescription>{pageError}</AlertDescription><Button variant="outline" size="sm" className="mt-2" onClick={() => void Promise.all([refresh(), refreshCategories()])}><RefreshCw />Try again</Button></Alert>}

      {isLoading ? (
        <div className="space-y-2 border p-4" aria-label="Loading budgets">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-12 w-full" />)}</div>
      ) : budgets.length ? (
        <BudgetTable budgets={budgets} onEdit={openEdit} onDelete={setDeletingBudget} />
      ) : (
        <div className="grid min-h-56 place-items-center border border-dashed p-8 text-center"><div><CalendarRange className="mx-auto mb-3 size-8 text-muted-foreground" /><h3 className="font-heading font-semibold">No budgets for {formatPeriod(period)}</h3><p className="mt-1 text-sm text-muted-foreground">Set a planned amount for an expense category.</p><Button className="mt-4" onClick={openCreate} disabled={categoriesLoading}><Plus />Create budget</Button></div></div>
      )}

      <BudgetFormDialog open={formOpen} period={period} budget={editingBudget} categories={eligibleCategories} onOpenChange={setFormOpen} onCreate={create} onUpdate={update} />
      <DeleteBudgetDialog budget={deletingBudget} onOpenChange={(open) => { if (!open) setDeletingBudget(null) }} onConfirm={(budget) => remove(budget.id)} />
    </div>
  )
}
