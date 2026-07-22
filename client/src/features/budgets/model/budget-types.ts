import type { CategoryIconName } from "@/features/categories/model/category-types"

export interface BudgetCategory {
  id: number
  name: string
  color: string
  icon: CategoryIconName
  is_archived: boolean
}

export interface Budget {
  id: number
  period: string
  amount: string
  spent: string
  remaining: string
  progress_percentage: string
  currency: "PHP"
  category: BudgetCategory
  created_at: string
  updated_at: string
}

export interface BudgetListMeta {
  planned_total: string
  currency: "PHP"
  period: string
}

export interface BudgetListResult {
  data: Budget[]
  meta: BudgetListMeta
}

export interface CreateBudgetPayload {
  category_id: number
  period: string
  amount: string
}

export interface UpdateBudgetPayload {
  amount: string
}
