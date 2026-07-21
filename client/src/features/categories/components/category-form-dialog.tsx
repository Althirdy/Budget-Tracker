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
import { CategoryApiError } from "@/features/categories/api/categories-api"
import { categoryIconLabels, categoryIconMap } from "@/features/categories/model/category-icons"
import { categorySchema, type CategoryFormValues } from "@/features/categories/model/category-schema"
import { categoryIcons, type Category, type CategoryPayload } from "@/features/categories/model/category-types"
import { firstErrorMessage } from "@/lib/http/api-error"

interface CategoryFormDialogProps {
  open: boolean
  category?: Category | null
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: CategoryPayload) => Promise<void>
}

const defaults: CategoryFormValues = { name: "", type: "expense", color: "#F97316", icon: "shopping-cart" }

export function CategoryFormDialog({ open, category, onOpenChange, onSubmit }: CategoryFormDialogProps) {
  const { register, control, handleSubmit, reset, setError, setValue, watch, formState: { errors, isSubmitting } } = useForm<CategoryFormValues>({ resolver: zodResolver(categorySchema), defaultValues: defaults })

  useEffect(() => {
    reset(category ? { name: category.name, type: category.type, color: category.color, icon: category.icon } : defaults)
  }, [category, open, reset])

  const selectedColor = watch("color")

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit({ ...values, color: values.color.toUpperCase() })
      onOpenChange(false)
      toast.success(category ? "Category updated" : "Category created")
    } catch (reason) {
      if (reason instanceof CategoryApiError) {
        const entries = Object.entries(reason.fieldErrors)
        const unmapped = entries.filter(([field]) => !(field in defaults))
        entries.forEach(([field, messages]) => {
          if (field in defaults) setError(field as keyof CategoryFormValues, { message: messages[0] })
        })
        if (!entries.length) toast.error(reason.message)
        else if (unmapped.length) toast.error(unmapped.flatMap(([, messages]) => messages)[0] ?? firstErrorMessage(reason, "Unable to save the category."))
      } else {
        toast.error(firstErrorMessage(reason, "Unable to save the category. Please try again."))
      }
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? "Edit category" : "Create category"}</DialogTitle>
          <DialogDescription>Categories organize transactions and budget reporting.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="category-name">Name</Label>
            <Input id="category-name" autoFocus aria-invalid={Boolean(errors.name)} {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Type</Label>
              <Controller name="type" control={control} render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}><SelectTrigger aria-label="Category type"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="expense">Expense</SelectItem><SelectItem value="income">Income</SelectItem></SelectContent></Select>
              )} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-color">Color</Label>
              <div className="flex gap-2">
                <input id="category-color-picker" type="color" className="h-8 w-10 border border-input bg-transparent p-0.5" value={selectedColor} onChange={(event) => setValue("color", event.target.value.toUpperCase(), { shouldDirty: true, shouldValidate: true })} aria-label="Choose category color" />
                <Input id="category-color" aria-invalid={Boolean(errors.color)} {...register("color")} />
              </div>
              {errors.color && <p className="text-xs text-destructive">{errors.color.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Icon</Label>
            <Controller name="icon" control={control} render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}><SelectTrigger aria-label="Category icon"><SelectValue /></SelectTrigger><SelectContent>{categoryIcons.map((icon) => { const Icon = categoryIconMap[icon]; return <SelectItem value={icon} key={icon}><span className="flex items-center gap-2"><Icon className="size-4" />{categoryIconLabels[icon]}</span></SelectItem> })}</SelectContent></Select>
            )} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting && <LoaderCircle className="animate-spin" />}{category ? "Save changes" : "Create category"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
