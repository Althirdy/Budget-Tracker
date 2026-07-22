import type { Account } from "@/features/accounts/model/account-types"
import type { Category } from "@/features/categories/model/category-types"

export const transactionTypes = ["income", "expense", "transfer"] as const
export type TransactionType = (typeof transactionTypes)[number]
export type TransactionStatus = "active" | "deleted"
export type TransactionAccount = Pick<Account, "id" | "name" | "type" | "color" | "icon" | "is_archived">
export type TransactionCategory = Pick<Category, "id" | "name" | "type" | "color" | "icon" | "is_archived">

export interface Transaction {
  id: number; type: TransactionType; amount: string; currency: "PHP"; transaction_date: string
  description: string; notes: string | null; category: TransactionCategory | null
  account: TransactionAccount | null; source_account: TransactionAccount | null; destination_account: TransactionAccount | null
  is_deleted: boolean; created_at: string; updated_at: string
}

export interface TransactionPayload {
  type: TransactionType; amount: string; transaction_date: string; description: string; notes: string | null
  account_id?: number; category_id?: number; source_account_id?: number; destination_account_id?: number
}

export interface TransactionFilters {
  status: TransactionStatus; type?: TransactionType; account_id?: number; category_id?: number
  date_from?: string; date_to?: string; search?: string; page: number
}

export interface TransactionListResult {
  data: Transaction[]
  meta: { current_page: number; last_page: number; per_page: number; total: number }
}
