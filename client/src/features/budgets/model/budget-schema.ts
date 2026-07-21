import { z } from "zod"

const amountSchema = z.string()
  .trim()
  .min(1, "Amount is required")
  .regex(/^\d+(\.\d{1,2})?$/, "Enter an amount with no more than 2 decimal places")
  .refine((value) => Number(value) > 0, "Amount must be greater than zero")
  .refine((value) => Number(value) <= 999999999999.99, "Amount is too large")

export const createBudgetSchema = z.object({
  categoryId: z.string().min(1, "Choose an expense category"),
  amount: amountSchema,
})

export const updateBudgetSchema = z.object({ amount: amountSchema })

export type CreateBudgetFormValues = z.infer<typeof createBudgetSchema>
export type UpdateBudgetFormValues = z.infer<typeof updateBudgetSchema>
