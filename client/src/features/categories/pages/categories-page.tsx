import { AlertCircle, Plus, RefreshCw, Search, Tags } from "lucide-react"
import { useDeferredValue, useMemo, useState } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { ArchiveCategoryDialog } from "@/features/categories/components/archive-category-dialog"
import { CategoryFormDialog } from "@/features/categories/components/category-form-dialog"
import { CategoryTable } from "@/features/categories/components/category-table"
import type { Category, CategoryStatus, CategoryType } from "@/features/categories/model/category-types"
import { useCategories } from "@/features/categories/model/use-categories"

type TypeFilter = CategoryType | "all"

export function CategoriesPage() {
  const [status, setStatus] = useState<Exclude<CategoryStatus, "all">>("active")
  const [type, setType] = useState<TypeFilter>("all")
  const [search, setSearch] = useState("")
  const deferredSearch = useDeferredValue(search.trim())
  const [formOpen, setFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [archivingCategory, setArchivingCategory] = useState<Category | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const filters = useMemo(() => ({ status, type: type === "all" ? undefined : type, search: deferredSearch || undefined }), [deferredSearch, status, type])
  const { categories, isLoading, error, refresh, create, update, archive, restore } = useCategories(filters)

  const openCreate = () => { setEditingCategory(null); setFormOpen(true) }
  const openEdit = (category: Category) => { setEditingCategory(category); setFormOpen(true) }

  const restoreItem = async (category: Category) => {
    setActionError(null)
    try { await restore(category.id) } catch (reason) { setActionError(reason instanceof Error ? reason.message : "Unable to restore this category.") }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div><h2 className="font-heading text-2xl font-semibold tracking-tight">Categories</h2><p className="text-sm text-muted-foreground">Organize income and expenses for transactions and budgets.</p></div>
        <Button onClick={openCreate}><Plus />New category</Button>
      </div>

      <div className="flex flex-col gap-3 border p-3 lg:flex-row lg:items-center">
        <div className="relative flex-1"><Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-8" placeholder="Search categories" value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search categories" /></div>
        <Select value={type} onValueChange={(value) => setType(value as TypeFilter)}><SelectTrigger className="lg:w-40" aria-label="Filter by category type"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All types</SelectItem><SelectItem value="expense">Expenses</SelectItem><SelectItem value="income">Income</SelectItem></SelectContent></Select>
        <div className="flex border" role="group" aria-label="Category status"><Button className="flex-1" size="sm" variant={status === "active" ? "secondary" : "ghost"} onClick={() => setStatus("active")}>Active</Button><Button className="flex-1" size="sm" variant={status === "archived" ? "secondary" : "ghost"} onClick={() => setStatus("archived")}>Archived</Button></div>
      </div>

      {(error || actionError) && <Alert variant="destructive"><AlertCircle /><AlertTitle>Unable to complete the request</AlertTitle><AlertDescription>{error ?? actionError}</AlertDescription><Button variant="outline" size="sm" className="mt-2" onClick={() => void refresh()}><RefreshCw />Try again</Button></Alert>}

      {isLoading ? (
        <div className="space-y-2 border p-4" aria-label="Loading categories">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-12 w-full" />)}</div>
      ) : categories.length ? (
        <CategoryTable categories={categories} onEdit={openEdit} onArchive={setArchivingCategory} onRestore={(category) => void restoreItem(category)} />
      ) : (
        <div className="grid min-h-56 place-items-center border border-dashed p-8 text-center"><div><Tags className="mx-auto mb-3 size-8 text-muted-foreground" /><h3 className="font-heading font-semibold">{status === "archived" ? "No archived categories" : "No categories found"}</h3><p className="mt-1 text-sm text-muted-foreground">{search || type !== "all" ? "Try changing your search or filters." : "Create your first category to organize future transactions."}</p>{status === "active" && !search && type === "all" && <Button className="mt-4" onClick={openCreate}><Plus />Create category</Button>}</div></div>
      )}

      <CategoryFormDialog open={formOpen} category={editingCategory} onOpenChange={setFormOpen} onSubmit={(payload) => editingCategory ? update(editingCategory.id, payload) : create(payload)} />
      <ArchiveCategoryDialog category={archivingCategory} onOpenChange={(open) => { if (!open) setArchivingCategory(null) }} onConfirm={(category) => archive(category.id)} />
    </div>
  )
}
