import { LoaderCircle } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Transaction } from "@/features/transactions/model/transaction-types"
import { firstErrorMessage } from "@/lib/http/api-error"
interface Props { transaction: Transaction | null; onOpenChange: (open: boolean) => void; onConfirm: (item: Transaction) => Promise<void> }
export function DeleteTransactionDialog({ transaction, onOpenChange, onConfirm }: Props) { const [busy, setBusy] = useState(false); const remove = async () => { if (!transaction) return; setBusy(true); try { await onConfirm(transaction); onOpenChange(false); toast.success("Transaction deleted") } catch (e) { toast.error(firstErrorMessage(e, "Unable to delete this transaction.")) } finally { setBusy(false) } }; return <Dialog open={Boolean(transaction)} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>Delete transaction?</DialogTitle><DialogDescription>{transaction?.description} will be removed from account balances and budget calculations. You can restore it later.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button variant="destructive" disabled={busy} onClick={() => void remove()}>{busy && <LoaderCircle className="animate-spin" />}Delete</Button></DialogFooter></DialogContent></Dialog> }
