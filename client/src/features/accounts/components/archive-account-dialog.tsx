import { LoaderCircle } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Account } from "@/features/accounts/model/account-types"
import { firstErrorMessage } from "@/lib/http/api-error"

interface Props { account: Account | null; onOpenChange: (open: boolean) => void; onConfirm: (account: Account) => Promise<void> }
export function ArchiveAccountDialog({ account, onOpenChange, onConfirm }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const archive = async () => { if (!account) return; setIsSubmitting(true); try { await onConfirm(account); onOpenChange(false); toast.success(`${account.name} was archived`) } catch (reason) { toast.error(firstErrorMessage(reason, "Unable to archive this account.")) } finally { setIsSubmitting(false) } }
  return <Dialog open={Boolean(account)} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>Archive account?</DialogTitle><DialogDescription>{account?.name} will no longer be available for new transactions. Historical records will remain intact.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button variant="destructive" disabled={isSubmitting} onClick={() => void archive()}>{isSubmitting && <LoaderCircle className="animate-spin" />}Archive</Button></DialogFooter></DialogContent></Dialog>
}
