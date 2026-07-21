import { z } from "zod"

import { accountIcons, accountTypes } from "@/features/accounts/model/account-types"

export const accountSchema = z.object({
  name: z.string().trim().min(2, "Name must contain at least 2 characters").max(50, "Name must not exceed 50 characters"),
  type: z.enum(accountTypes),
  opening_balance: z.string().trim().regex(/^\d+(\.\d{1,2})?$/, "Enter a non-negative amount with up to 2 decimal places").refine((value) => Number(value) <= 999999999999.99, "Opening balance is too large"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Choose a valid account color"),
  icon: z.enum(accountIcons),
})

export type AccountFormValues = z.infer<typeof accountSchema>
