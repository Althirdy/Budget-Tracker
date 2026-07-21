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
import { AccountApiError } from "@/features/accounts/api/accounts-api"
import { accountIconLabels, accountIconMap, accountTypeLabels } from "@/features/accounts/model/account-icons"
import { accountSchema, type AccountFormValues } from "@/features/accounts/model/account-schema"
import { accountIcons, accountTypes, type Account, type AccountPayload } from "@/features/accounts/model/account-types"
import { firstErrorMessage } from "@/lib/http/api-error"

interface Props { open: boolean; account?: Account | null; onOpenChange: (open: boolean) => void; onSubmit: (payload: AccountPayload) => Promise<void> }
const defaults: AccountFormValues = { name: "", type: "cash", opening_balance: "0.00", color: "#F97316", icon: "wallet" }

export function AccountFormDialog({ open, account, onOpenChange, onSubmit }: Props) {
  const { register, control, handleSubmit, reset, setError, setValue, watch, formState: { errors, isSubmitting } } = useForm<AccountFormValues>({ resolver: zodResolver(accountSchema), defaultValues: defaults })
  useEffect(() => { reset(account ? { name: account.name, type: account.type, opening_balance: account.opening_balance, color: account.color, icon: account.icon } : defaults) }, [account, open, reset])
  const selectedColor = watch("color")
  const selectedType = watch("type")

  const submit = handleSubmit(async (values) => {
    try { await onSubmit({ ...values, color: values.color.toUpperCase() }); onOpenChange(false); toast.success(account ? "Account updated" : "Account created") }
    catch (reason) {
      if (reason instanceof AccountApiError) {
        const entries = Object.entries(reason.fieldErrors)
        const unmapped = entries.filter(([field]) => !(field in defaults))
        entries.forEach(([field, messages]) => { if (field in defaults) setError(field as keyof AccountFormValues, { message: messages[0] }) })
        if (!entries.length) toast.error(reason.message)
        else if (unmapped.length) toast.error(unmapped.flatMap(([, messages]) => messages)[0] ?? firstErrorMessage(reason, "Unable to save the account."))
      } else toast.error(firstErrorMessage(reason, "Unable to save the account. Please try again."))
    }
  })

  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>{account ? "Edit account" : "Create account"}</DialogTitle><DialogDescription>Opening balances establish the starting point for future transactions.</DialogDescription></DialogHeader><form className="space-y-4" onSubmit={submit}>
    <div className="space-y-2"><Label htmlFor="account-name">Name</Label><Input id="account-name" autoFocus aria-invalid={Boolean(errors.name)} {...register("name")} />{errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}</div>
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2"><Label>Type</Label><Controller name="type" control={control} render={({ field }) => <Select value={field.value} onValueChange={field.onChange}><SelectTrigger aria-label="Account type"><SelectValue /></SelectTrigger><SelectContent>{accountTypes.map((type) => <SelectItem key={type} value={type}>{accountTypeLabels[type]}</SelectItem>)}</SelectContent></Select>} /></div>
      <div className="space-y-2"><Label htmlFor="opening-balance">{selectedType === "credit-card" ? "Opening amount owed" : "Opening balance"}</Label><div className="relative"><span className="absolute top-1/2 left-2.5 -translate-y-1/2 text-xs text-muted-foreground">PHP</span><Input id="opening-balance" className="pl-11" inputMode="decimal" aria-invalid={Boolean(errors.opening_balance)} {...register("opening_balance")} /></div>{errors.opening_balance && <p className="text-xs text-destructive">{errors.opening_balance.message}</p>}</div>
    </div>
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2"><Label htmlFor="account-color">Color</Label><div className="flex gap-2"><input id="account-color-picker" type="color" className="h-8 w-10 border border-input bg-transparent p-0.5" value={selectedColor} onChange={(event) => setValue("color", event.target.value.toUpperCase(), { shouldDirty: true, shouldValidate: true })} aria-label="Choose account color" /><Input id="account-color" aria-invalid={Boolean(errors.color)} {...register("color")} /></div>{errors.color && <p className="text-xs text-destructive">{errors.color.message}</p>}</div>
      <div className="space-y-2"><Label>Icon</Label><Controller name="icon" control={control} render={({ field }) => <Select value={field.value} onValueChange={field.onChange}><SelectTrigger aria-label="Account icon"><SelectValue /></SelectTrigger><SelectContent>{accountIcons.map((icon) => { const Icon = accountIconMap[icon]; return <SelectItem key={icon} value={icon}><span className="flex items-center gap-2"><Icon className="size-4" />{accountIconLabels[icon]}</span></SelectItem> })}</SelectContent></Select>} /></div>
    </div>
    <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" disabled={isSubmitting}>{isSubmitting && <LoaderCircle className="animate-spin" />}{account ? "Save changes" : "Create account"}</Button></DialogFooter>
  </form></DialogContent></Dialog>
}
