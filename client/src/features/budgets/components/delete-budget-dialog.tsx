import { LoaderCircle } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Budget } from "@/features/budgets/model/budget-types"
import { firstErrorMessage } from "@/lib/http/api-error"

interface DeleteBudgetDialogProps {
  budget: Budget | null
  onOpenChange: (open: boolean) => void
  onConfirm: (budget: Budget) => Promise<void>
}

export function DeleteBudgetDialog({ budget, onOpenChange, onConfirm }: DeleteBudgetDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const remove = async () => {
    if (!budget) return
    setIsSubmitting(true)
    try { await onConfirm(budget); onOpenChange(false); toast.success("Budget deleted") }
    catch (reason) { toast.error(firstErrorMessage(reason, "Unable to delete this budget.")) }
    finally { setIsSubmitting(false) }
  }

  return <Dialog open={Boolean(budget)} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>Delete budget?</DialogTitle><DialogDescription>This permanently removes the {budget?.category.name} plan for {budget?.period}. It does not delete the category.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button variant="destructive" disabled={isSubmitting} onClick={() => void remove()}>{isSubmitting && <LoaderCircle className="animate-spin" />}Delete budget</Button></DialogFooter></DialogContent></Dialog>
}
