import { Pencil, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatPhp } from "@/features/budgets/model/budget-format"
import type { Budget } from "@/features/budgets/model/budget-types"
import { categoryIconMap } from "@/features/categories/model/category-icons"

interface BudgetTableProps {
  budgets: Budget[]
  onEdit: (budget: Budget) => void
  onDelete: (budget: Budget) => void
}

export function BudgetTable({ budgets, onEdit, onDelete }: BudgetTableProps) {
  return (
    <div className="border">
      <Table>
        <TableHeader><TableRow><TableHead>Expense category</TableHead><TableHead>Planned</TableHead><TableHead>Spent / Remaining</TableHead><TableHead>Progress</TableHead><TableHead className="w-28 text-right">Actions</TableHead></TableRow></TableHeader>
        <TableBody>{budgets.map((budget) => {
          const Icon = categoryIconMap[budget.category.icon]
          return <TableRow key={budget.id}>
            <TableCell><div className="flex items-center gap-3"><span className="flex size-8 items-center justify-center text-white" style={{ backgroundColor: budget.category.color }}><Icon className="size-4" /></span><div><p className="font-medium">{budget.category.name}</p>{budget.category.is_archived && <Badge variant="outline" className="mt-1">Archived category</Badge>}</div></div></TableCell>
            <TableCell className="font-mono font-medium">{formatPhp(budget.amount)}</TableCell><TableCell><p>{formatPhp(budget.spent)} spent</p><p className="text-xs text-muted-foreground">{formatPhp(budget.remaining)} remaining</p></TableCell><TableCell><div className="h-2 w-28 overflow-hidden bg-muted"><div className="h-full bg-primary" style={{ width: `${Math.min(Number(budget.progress_percentage), 100)}%` }} /></div><p className="mt-1 text-xs">{budget.progress_percentage}%</p></TableCell>
            <TableCell><div className="flex justify-end gap-1"><Button size="icon-sm" variant="ghost" aria-label={`Edit ${budget.category.name} budget`} title="Edit budget" onClick={() => onEdit(budget)}><Pencil /></Button><Button size="icon-sm" variant="ghost" aria-label={`Delete ${budget.category.name} budget`} title="Delete budget" onClick={() => onDelete(budget)}><Trash2 /></Button></div></TableCell>
          </TableRow>
        })}</TableBody>
      </Table>
    </div>
  )
}
