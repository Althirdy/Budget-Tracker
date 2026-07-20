export const categoryTypes = ["income", "expense"] as const
export type CategoryType = (typeof categoryTypes)[number]

export const categoryIcons = [
  "shopping-cart",
  "utensils",
  "house",
  "car",
  "heart-pulse",
  "graduation-cap",
  "plane",
  "receipt",
  "briefcase-business",
  "banknote",
  "gift",
  "circle-ellipsis",
] as const
export type CategoryIconName = (typeof categoryIcons)[number]

export type CategoryStatus = "active" | "archived" | "all"

export interface Category {
  id: number
  name: string
  type: CategoryType
  color: string
  icon: CategoryIconName
  is_archived: boolean
  created_at: string
  updated_at: string
}

export interface CategoryPayload {
  name: string
  type: CategoryType
  color: string
  icon: CategoryIconName
}

export interface CategoryFilters {
  status: CategoryStatus
  type?: CategoryType
  search?: string
}
