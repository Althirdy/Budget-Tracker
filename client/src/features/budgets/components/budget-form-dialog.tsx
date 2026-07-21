import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BudgetApiError } from "@/features/budgets/api/budgets-api"
import type { Budget, CreateBudgetPayload } from "@/features/budgets/model/budget-types"
import { createBudgetSchema, type CreateBudgetFormValues } from "@/features/budgets/model/budget-schema"
import { categoryIconMap } from "@/features/categories/model/category-icons"
import type { Category } from "@/features/categories/model/category-types"

interface BudgetFormDialogProps {
  open: boolean
  period: string
  budget?: Budget | null
  categories: Category[]
  onOpenChange: (open: boolean) => void
  onCreate: (payload: CreateBudgetPayload) => Promise<void>
  onUpdate: (budgetId: number, amount: string) => Promise<void>
}

export function BudgetFormDialog({ open, period, budget, categories, onOpenChange, onCreate, onUpdate }: BudgetFormDialogProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { register, control, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm<CreateBudgetFormValues>({
    resolver: zodResolver(createBudgetSchema),
    defaultValues: { categoryId: "", amount: "" },
  })

  useEffect(() => {
    reset({ categoryId: budget ? String(budget.category.id) : "", amount: budget?.amount ?? "" })
    setSubmitError(null)
  }, [budget, open, reset])

  const submit = handleSubmit(async (values) => {
    setSubmitError(null)
    try {
      if (budget) {
        await onUpdate(budget.id, values.amount)
      } else {
        await onCreate({ category_id: Number(values.categoryId), period, amount: values.amount })
      }
      onOpenChange(false)
    } catch (reason) {
      if (reason instanceof BudgetApiError) {
        const categoryMessage = reason.fieldErrors.category_id?.[0]
        const amountMessage = reason.fieldErrors.amount?.[0]
        if (categoryMessage) setError("categoryId", { message: categoryMessage })
        if (amountMessage) setError("amount", { message: amountMessage })
        setSubmitError(categoryMessage || amountMessage ? null : reason.message)
      } else {
        setSubmitError("Unable to save the budget. Please try again.")
      }
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{budget ? "Edit budget" : "Create budget"}</DialogTitle>
          <DialogDescription>{budget ? `Update the planned amount for ${budget.category.name}.` : "Set a monthly spending limit for an expense category."}</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submit}>
          {submitError && <Alert variant="destructive"><AlertDescription>{submitError}</AlertDescription></Alert>}
          {!budget && (
            <div className="space-y-2">
              <Label>Expense category</Label>
              <Controller name="categoryId" control={control} render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={!categories.length}>
                  <SelectTrigger aria-label="Expense category" aria-invalid={Boolean(errors.categoryId)}><SelectValue placeholder={categories.length ? "Choose a category" : "All categories are budgeted"} /></SelectTrigger>
                  <SelectContent>{categories.map((category) => { const Icon = categoryIconMap[category.icon]; return <SelectItem value={String(category.id)} key={category.id}><span className="flex items-center gap-2"><Icon className="size-4" />{category.name}</span></SelectItem> })}</SelectContent>
                </Select>
              )} />
              {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId.message}</p>}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="budget-amount">Planned amount (PHP)</Label>
            <Input id="budget-amount" inputMode="decimal" placeholder="0.00" autoFocus={Boolean(budget)} aria-invalid={Boolean(errors.amount)} {...register("amount")} />
            {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting || (!budget && !categories.length)}>{isSubmitting && <LoaderCircle className="animate-spin" />}{budget ? "Save changes" : "Create budget"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
