import { AlertCircle, Landmark, Plus, RefreshCw, Search } from "lucide-react"
import { useDeferredValue, useMemo, useState } from "react"
import { toast } from "sonner"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { ArchiveAccountDialog } from "@/features/accounts/components/archive-account-dialog"
import { AccountFormDialog } from "@/features/accounts/components/account-form-dialog"
import { AccountTable } from "@/features/accounts/components/account-table"
import { accountTypeLabels } from "@/features/accounts/model/account-icons"
import { accountTypes, type Account, type AccountStatus, type AccountType } from "@/features/accounts/model/account-types"
import { useAccounts } from "@/features/accounts/model/use-accounts"
import { firstErrorMessage } from "@/lib/http/api-error"

type TypeFilter = AccountType | "all"

export function AccountsPage() {
  const [status, setStatus] = useState<Exclude<AccountStatus, "all">>("active")
  const [type, setType] = useState<TypeFilter>("all")
  const [search, setSearch] = useState("")
  const deferredSearch = useDeferredValue(search.trim())
  const [formOpen, setFormOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [archivingAccount, setArchivingAccount] = useState<Account | null>(null)
  const filters = useMemo(() => ({ status, type: type === "all" ? undefined : type, search: deferredSearch || undefined }), [deferredSearch, status, type])
  const { accounts, isLoading, error, refresh, create, update, archive, restore } = useAccounts(filters)

  const openCreate = () => { setEditingAccount(null); setFormOpen(true) }
  const openEdit = (account: Account) => { setEditingAccount(account); setFormOpen(true) }
  const restoreItem = async (account: Account) => { try { await restore(account.id); toast.success(`${account.name} was restored`) } catch (reason) { toast.error(firstErrorMessage(reason, "Unable to restore this account.")) } }

  return <div className="space-y-6">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="font-heading text-2xl font-semibold tracking-tight">Accounts</h2><p className="text-sm text-muted-foreground">Manage where your money is held and establish opening balances.</p></div><Button onClick={openCreate}><Plus />New account</Button></div>
    <div className="flex flex-col gap-3 border p-3 lg:flex-row lg:items-center"><div className="relative flex-1"><Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-8" placeholder="Search accounts" value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search accounts" /></div><Select value={type} onValueChange={(value) => setType(value as TypeFilter)}><SelectTrigger className="lg:w-44" aria-label="Filter by account type"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All types</SelectItem>{accountTypes.map((value) => <SelectItem key={value} value={value}>{accountTypeLabels[value]}</SelectItem>)}</SelectContent></Select><div className="flex border" role="group" aria-label="Account status"><Button className="flex-1" size="sm" variant={status === "active" ? "secondary" : "ghost"} onClick={() => setStatus("active")}>Active</Button><Button className="flex-1" size="sm" variant={status === "archived" ? "secondary" : "ghost"} onClick={() => setStatus("archived")}>Archived</Button></div></div>
    {error && <Alert variant="destructive"><AlertCircle /><AlertTitle>Unable to load accounts</AlertTitle><AlertDescription>{error}</AlertDescription><Button variant="outline" size="sm" className="mt-2" onClick={() => void refresh()}><RefreshCw />Try again</Button></Alert>}
    {isLoading ? <div className="space-y-2 border p-4" aria-label="Loading accounts">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-12 w-full" />)}</div> : accounts.length ? <AccountTable accounts={accounts} onEdit={openEdit} onArchive={setArchivingAccount} onRestore={(account) => void restoreItem(account)} /> : <div className="grid min-h-56 place-items-center border border-dashed p-8 text-center"><div><Landmark className="mx-auto mb-3 size-8 text-muted-foreground" /><h3 className="font-heading font-semibold">{status === "archived" ? "No archived accounts" : "No accounts found"}</h3><p className="mt-1 text-sm text-muted-foreground">{search || type !== "all" ? "Try changing your search or filters." : "Create your first account to begin tracking your money."}</p>{status === "active" && !search && type === "all" && <Button className="mt-4" onClick={openCreate}><Plus />Create account</Button>}</div></div>}
    <AccountFormDialog open={formOpen} account={editingAccount} onOpenChange={setFormOpen} onSubmit={(payload) => editingAccount ? update(editingAccount.id, payload) : create(payload)} />
    <ArchiveAccountDialog account={archivingAccount} onOpenChange={(open) => { if (!open) setArchivingAccount(null) }} onConfirm={(account) => archive(account.id)} />
  </div>
}
