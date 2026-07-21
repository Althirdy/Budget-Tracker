import { LoaderCircle } from "lucide-react"
import { useState } from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Budget } from "@/features/budgets/model/budget-types"

interface DeleteBudgetDialogProps {
  budget: Budget | null
  onOpenChange: (open: boolean) => void
  onConfirm: (budget: Budget) => Promise<void>
}

export function DeleteBudgetDialog({ budget, onOpenChange, onConfirm }: DeleteBudgetDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const remove = async () => {
    if (!budget) return
    setIsSubmitting(true)
    setError(null)
    try { await onConfirm(budget); onOpenChange(false) }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to delete this budget.") }
    finally { setIsSubmitting(false) }
  }

  return <Dialog open={Boolean(budget)} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>Delete budget?</DialogTitle><DialogDescription>This permanently removes the {budget?.category.name} plan for {budget?.period}. It does not delete the category.</DialogDescription></DialogHeader>{error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}<DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button variant="destructive" disabled={isSubmitting} onClick={() => void remove()}>{isSubmitting && <LoaderCircle className="animate-spin" />}Delete budget</Button></DialogFooter></DialogContent></Dialog>
}
