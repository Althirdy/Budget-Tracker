import { z } from "zod"
import { transactionTypes } from "@/features/transactions/model/transaction-types"
import { localToday } from "@/features/transactions/model/transaction-date"

export const transactionSchema = z.object({
  type: z.enum(transactionTypes), amount: z.string().trim().regex(/^\d+(\.\d{1,2})?$/, "Enter a positive amount with up to 2 decimals").refine((v) => Number(v) > 0, "Amount must be greater than zero"),
  transaction_date: z.string().min(1, "Choose a date").refine((v) => v <= localToday(), "Future transactions are not allowed"),
  description: z.string().trim().min(2, "Description must contain at least 2 characters").max(100), notes: z.string().trim().max(500).optional(),
  account_id: z.string().optional(), category_id: z.string().optional(), source_account_id: z.string().optional(), destination_account_id: z.string().optional(),
}).superRefine((values, context) => {
  if (values.type === "transfer") {
    if (!values.source_account_id) context.addIssue({ code: "custom", path: ["source_account_id"], message: "Choose a source account" })
    if (!values.destination_account_id) context.addIssue({ code: "custom", path: ["destination_account_id"], message: "Choose a destination account" })
    if (values.source_account_id && values.source_account_id === values.destination_account_id) context.addIssue({ code: "custom", path: ["destination_account_id"], message: "Choose a different destination account" })
  } else {
    if (!values.account_id) context.addIssue({ code: "custom", path: ["account_id"], message: "Choose an account" })
    if (!values.category_id) context.addIssue({ code: "custom", path: ["category_id"], message: "Choose a category" })
  }
})
export type TransactionFormValues = z.infer<typeof transactionSchema>
