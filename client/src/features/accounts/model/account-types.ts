export const accountTypes = ["cash", "checking", "savings", "e-wallet", "credit-card", "investment"] as const
export type AccountType = (typeof accountTypes)[number]

export const accountIcons = ["wallet", "landmark", "piggy-bank", "smartphone", "credit-card", "chart-no-axes-combined"] as const
export type AccountIconName = (typeof accountIcons)[number]

export type AccountStatus = "active" | "archived" | "all"

export interface Account {
  id: number
  name: string
  type: AccountType
  opening_balance: string
  currency: "PHP"
  color: string
  icon: AccountIconName
  is_liability: boolean
  is_archived: boolean
  created_at: string
  updated_at: string
}

export interface AccountPayload {
  name: string
  type: AccountType
  opening_balance: string
  color: string
  icon: AccountIconName
}

export interface AccountFilters {
  status: AccountStatus
  type?: AccountType
  search?: string
}
