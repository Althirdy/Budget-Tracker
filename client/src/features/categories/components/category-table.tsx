import { Archive, Pencil, RotateCcw } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { categoryIconMap } from "@/features/categories/model/category-icons"
import type { Category } from "@/features/categories/model/category-types"

interface CategoryTableProps {
  categories: Category[]
  onEdit: (category: Category) => void
  onArchive: (category: Category) => void
  onRestore: (category: Category) => void
}

export function CategoryTable({ categories, onEdit, onArchive, onRestore }: CategoryTableProps) {
  return (
    <div className="border">
      <Table>
        <TableHeader><TableRow><TableHead>Category</TableHead><TableHead>Type</TableHead><TableHead className="w-28 text-right">Actions</TableHead></TableRow></TableHeader>
        <TableBody>
          {categories.map((category) => {
            const Icon = categoryIconMap[category.icon]
            return (
              <TableRow key={category.id}>
                <TableCell><div className="flex items-center gap-3"><span className="flex size-8 items-center justify-center text-white" style={{ backgroundColor: category.color }}><Icon className="size-4" /></span><div><p className="font-medium">{category.name}</p><p className="font-mono text-[11px] text-muted-foreground">{category.color}</p></div></div></TableCell>
                <TableCell><Badge variant={category.type === "income" ? "default" : "secondary"} className="capitalize">{category.type}</Badge></TableCell>
                <TableCell><div className="flex justify-end gap-1">
                  {category.is_archived ? (
                    <Button size="icon-sm" variant="ghost" aria-label={`Restore ${category.name}`} title="Restore category" onClick={() => onRestore(category)}><RotateCcw /></Button>
                  ) : (<>
                    <Button size="icon-sm" variant="ghost" aria-label={`Edit ${category.name}`} title="Edit category" onClick={() => onEdit(category)}><Pencil /></Button>
                    <Button size="icon-sm" variant="ghost" aria-label={`Archive ${category.name}`} title="Archive category" onClick={() => onArchive(category)}><Archive /></Button>
                  </>)}
                </div></TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
