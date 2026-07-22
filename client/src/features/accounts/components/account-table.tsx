import { Archive, Pencil, RotateCcw } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { accountIconMap, accountTypeLabels } from "@/features/accounts/model/account-icons"
import type { Account } from "@/features/accounts/model/account-types"

interface Props { accounts: Account[]; onEdit: (account: Account) => void; onArchive: (account: Account) => void; onRestore: (account: Account) => void }
const php = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" })

export function AccountTable({ accounts, onEdit, onArchive, onRestore }: Props) {
  return <div className="border"><Table><TableHeader><TableRow><TableHead>Account</TableHead><TableHead>Type</TableHead><TableHead>Current balance</TableHead><TableHead className="w-28 text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{accounts.map((account) => {
    const Icon = accountIconMap[account.icon]
    return <TableRow key={account.id}><TableCell><div className="flex items-center gap-3"><span className="flex size-8 items-center justify-center text-white" style={{ backgroundColor: account.color }}><Icon className="size-4" /></span><div><p className="font-medium">{account.name}</p><p className="text-[11px] text-muted-foreground">Opened at {php.format(Number(account.opening_balance))}</p></div></div></TableCell><TableCell><Badge variant={account.is_liability ? "destructive" : "secondary"}>{accountTypeLabels[account.type]}</Badge></TableCell><TableCell><div className="font-medium">{php.format(Number(account.current_balance))}</div>{account.is_liability && <div className="text-xs text-muted-foreground">Amount owed</div>}</TableCell><TableCell><div className="flex justify-end gap-1">{account.is_archived ? <Button size="icon-sm" variant="ghost" aria-label={`Restore ${account.name}`} title="Restore account" onClick={() => onRestore(account)}><RotateCcw /></Button> : <><Button size="icon-sm" variant="ghost" aria-label={`Edit ${account.name}`} title="Edit account" onClick={() => onEdit(account)}><Pencil /></Button><Button size="icon-sm" variant="ghost" aria-label={`Archive ${account.name}`} title="Archive account" onClick={() => onArchive(account)}><Archive /></Button></>}</div></TableCell></TableRow>
  })}</TableBody></Table></div>
}
