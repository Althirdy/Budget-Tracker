import { LoaderCircle } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Category } from "@/features/categories/model/category-types"
import { firstErrorMessage } from "@/lib/http/api-error"

interface ArchiveCategoryDialogProps {
  category: Category | null
  onOpenChange: (open: boolean) => void
  onConfirm: (category: Category) => Promise<void>
}

export function ArchiveCategoryDialog({ category, onOpenChange, onConfirm }: ArchiveCategoryDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const archive = async () => {
    if (!category) return
    setIsSubmitting(true)
    try {
      await onConfirm(category)
      onOpenChange(false)
      toast.success(`${category.name} was archived`)
    } catch (reason) {
      toast.error(firstErrorMessage(reason, "Unable to archive this category."))
    } finally {
      setIsSubmitting(false)
    }
  }

  return <Dialog open={Boolean(category)} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>Archive category?</DialogTitle><DialogDescription>{category?.name} will no longer be available for new transactions. Historical records will remain intact.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button variant="destructive" disabled={isSubmitting} onClick={() => void archive()}>{isSubmitting && <LoaderCircle className="animate-spin" />}Archive</Button></DialogFooter></DialogContent></Dialog>
}
