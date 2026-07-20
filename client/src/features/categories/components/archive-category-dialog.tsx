import { LoaderCircle } from "lucide-react"
import { useState } from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Category } from "@/features/categories/model/category-types"

interface ArchiveCategoryDialogProps {
  category: Category | null
  onOpenChange: (open: boolean) => void
  onConfirm: (category: Category) => Promise<void>
}

export function ArchiveCategoryDialog({ category, onOpenChange, onConfirm }: ArchiveCategoryDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const archive = async () => {
    if (!category) return
    setIsSubmitting(true)
    setError(null)
    try {
      await onConfirm(category)
      onOpenChange(false)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to archive this category.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return <Dialog open={Boolean(category)} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>Archive category?</DialogTitle><DialogDescription>{category?.name} will no longer be available for new transactions. Historical records will remain intact.</DialogDescription></DialogHeader>{error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}<DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button variant="destructive" disabled={isSubmitting} onClick={() => void archive()}>{isSubmitting && <LoaderCircle className="animate-spin" />}Archive</Button></DialogFooter></DialogContent></Dialog>
}
