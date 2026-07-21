import { LoaderCircle } from "lucide-react"
import { useState } from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Account } from "@/features/accounts/model/account-types"

interface Props { account: Account | null; onOpenChange: (open: boolean) => void; onConfirm: (account: Account) => Promise<void> }
export function ArchiveAccountDialog({ account, onOpenChange, onConfirm }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false); const [error, setError] = useState<string | null>(null)
  const archive = async () => { if (!account) return; setIsSubmitting(true); setError(null); try { await onConfirm(account); onOpenChange(false) } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to archive this account.") } finally { setIsSubmitting(false) } }
  return <Dialog open={Boolean(account)} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>Archive account?</DialogTitle><DialogDescription>{account?.name} will no longer be available for new transactions. Historical records will remain intact.</DialogDescription></DialogHeader>{error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}<DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button variant="destructive" disabled={isSubmitting} onClick={() => void archive()}>{isSubmitting && <LoaderCircle className="animate-spin" />}Archive</Button></DialogFooter></DialogContent></Dialog>
}
