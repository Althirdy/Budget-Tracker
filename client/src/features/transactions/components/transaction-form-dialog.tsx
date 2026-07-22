import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle } from "lucide-react"
import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Account } from "@/features/accounts/model/account-types"
import type { Category } from "@/features/categories/model/category-types"
import { TransactionApiError } from "@/features/transactions/api/transactions-api"
import { transactionSchema, type TransactionFormValues } from "@/features/transactions/model/transaction-schema"
import { localToday } from "@/features/transactions/model/transaction-date"
import type { Transaction, TransactionPayload } from "@/features/transactions/model/transaction-types"
import { firstErrorMessage } from "@/lib/http/api-error"

interface Props { open: boolean; transaction: Transaction | null; accounts: Account[]; categories: Category[]; onOpenChange: (open: boolean) => void; onSubmit: (payload: TransactionPayload) => Promise<void> }
const today = localToday()
const defaults: TransactionFormValues = { type: "expense", amount: "", transaction_date: today, description: "", notes: "", account_id: "", category_id: "", source_account_id: "", destination_account_id: "" }

export function TransactionFormDialog({ open, transaction, accounts, categories, onOpenChange, onSubmit }: Props) {
  const { register, control, handleSubmit, reset, setError, setValue, watch, formState: { errors, isSubmitting } } = useForm<TransactionFormValues>({ resolver: zodResolver(transactionSchema), defaultValues: defaults })
  useEffect(() => { reset(transaction ? { type: transaction.type, amount: transaction.amount, transaction_date: transaction.transaction_date, description: transaction.description, notes: transaction.notes ?? "", account_id: transaction.account ? String(transaction.account.id) : "", category_id: transaction.category ? String(transaction.category.id) : "", source_account_id: transaction.source_account ? String(transaction.source_account.id) : "", destination_account_id: transaction.destination_account ? String(transaction.destination_account.id) : "" } : defaults) }, [open, reset, transaction])
  const type = watch("type"); const validCategories = categories.filter((category) => !category.is_archived && category.type === type); const activeAccounts = accounts.filter((account) => !account.is_archived)
  const submit = handleSubmit(async (values) => {
    const common = { type: values.type, amount: values.amount, transaction_date: values.transaction_date, description: values.description.trim(), notes: values.notes?.trim() || null }
    const payload: TransactionPayload = values.type === "transfer" ? { ...common, source_account_id: Number(values.source_account_id), destination_account_id: Number(values.destination_account_id) } : { ...common, account_id: Number(values.account_id), category_id: Number(values.category_id) }
    try { await onSubmit(payload); onOpenChange(false); toast.success(transaction ? "Transaction updated" : "Transaction created") }
    catch (reason) {
      if (reason instanceof TransactionApiError) {
        const mapping: Record<string, keyof TransactionFormValues> = { account_id: "account_id", category_id: "category_id", source_account_id: "source_account_id", destination_account_id: "destination_account_id", type: "type", amount: "amount", transaction_date: "transaction_date", description: "description", notes: "notes" }
        const entries = Object.entries(reason.fieldErrors); const unmapped = entries.filter(([field]) => !mapping[field])
        entries.forEach(([field, messages]) => { if (mapping[field]) setError(mapping[field], { message: messages[0] }) })
        if (!entries.length) toast.error(reason.message); else if (unmapped.length) toast.error(unmapped[0][1][0] ?? reason.message)
      } else toast.error(firstErrorMessage(reason, "Unable to save the transaction."))
    }
  })
  const field = (name: keyof TransactionFormValues) => errors[name] && <p className="text-xs text-destructive">{errors[name]?.message}</p>
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-w-xl"><DialogHeader><DialogTitle>{transaction ? "Edit transaction" : "New transaction"}</DialogTitle><DialogDescription>Record actual income, spending, or a movement between accounts.</DialogDescription></DialogHeader><form className="space-y-4" onSubmit={submit}>
    <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label>Type</Label><Controller name="type" control={control} render={({ field: item }) => <Select value={item.value} onValueChange={(value) => { item.onChange(value); setValue("category_id", "") }}><SelectTrigger aria-label="Transaction type"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="expense">Expense</SelectItem><SelectItem value="income">Income</SelectItem><SelectItem value="transfer">Transfer</SelectItem></SelectContent></Select>} />{field("type")}</div><div className="space-y-2"><Label htmlFor="transaction-date">Date</Label><Input id="transaction-date" type="date" max={today} {...register("transaction_date")} />{field("transaction_date")}</div></div>
    {type === "transfer" ? <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label>From account</Label><Controller name="source_account_id" control={control} render={({ field: item }) => <Select value={item.value} onValueChange={item.onChange}><SelectTrigger aria-label="Source account"><SelectValue placeholder="Choose account" /></SelectTrigger><SelectContent>{activeAccounts.map((a) => <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>)}</SelectContent></Select>} />{field("source_account_id")}</div><div className="space-y-2"><Label>To account</Label><Controller name="destination_account_id" control={control} render={({ field: item }) => <Select value={item.value} onValueChange={item.onChange}><SelectTrigger aria-label="Destination account"><SelectValue placeholder="Choose account" /></SelectTrigger><SelectContent>{activeAccounts.map((a) => <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>)}</SelectContent></Select>} />{field("destination_account_id")}</div></div> : <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label>Account</Label><Controller name="account_id" control={control} render={({ field: item }) => <Select value={item.value} onValueChange={item.onChange}><SelectTrigger aria-label="Account"><SelectValue placeholder="Choose account" /></SelectTrigger><SelectContent>{activeAccounts.map((a) => <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>)}</SelectContent></Select>} />{field("account_id")}</div><div className="space-y-2"><Label>Category</Label><Controller name="category_id" control={control} render={({ field: item }) => <Select value={item.value} onValueChange={item.onChange}><SelectTrigger aria-label="Category"><SelectValue placeholder="Choose category" /></SelectTrigger><SelectContent>{validCategories.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent></Select>} />{field("category_id")}</div></div>}
    <div className="space-y-2"><Label htmlFor="transaction-amount">Amount (PHP)</Label><Input id="transaction-amount" inputMode="decimal" placeholder="0.00" {...register("amount")} />{field("amount")}</div>
    <div className="space-y-2"><Label htmlFor="transaction-description">Description</Label><Input id="transaction-description" {...register("description")} />{field("description")}</div>
    <div className="space-y-2"><Label htmlFor="transaction-notes">Notes (optional)</Label><textarea id="transaction-notes" className="min-h-20 w-full border border-input bg-transparent px-3 py-2 text-sm" {...register("notes")} />{field("notes")}</div>
    <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button disabled={isSubmitting} type="submit">{isSubmitting && <LoaderCircle className="animate-spin" />}{transaction ? "Save changes" : "Create transaction"}</Button></DialogFooter>
  </form></DialogContent></Dialog>
}
