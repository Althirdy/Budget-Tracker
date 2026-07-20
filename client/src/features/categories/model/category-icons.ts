import {
  Banknote,
  BriefcaseBusiness,
  Car,
  CircleEllipsis,
  Gift,
  GraduationCap,
  HeartPulse,
  House,
  Plane,
  Receipt,
  ShoppingCart,
  Utensils,
  type LucideIcon,
} from "lucide-react"

import type { CategoryIconName } from "@/features/categories/model/category-types"

export const categoryIconMap: Record<CategoryIconName, LucideIcon> = {
  "shopping-cart": ShoppingCart,
  utensils: Utensils,
  house: House,
  car: Car,
  "heart-pulse": HeartPulse,
  "graduation-cap": GraduationCap,
  plane: Plane,
  receipt: Receipt,
  "briefcase-business": BriefcaseBusiness,
  banknote: Banknote,
  gift: Gift,
  "circle-ellipsis": CircleEllipsis,
}

export const categoryIconLabels: Record<CategoryIconName, string> = {
  "shopping-cart": "Shopping cart",
  utensils: "Dining",
  house: "Home",
  car: "Transport",
  "heart-pulse": "Health",
  "graduation-cap": "Education",
  plane: "Travel",
  receipt: "Bills",
  "briefcase-business": "Work",
  banknote: "Income",
  gift: "Gifts",
  "circle-ellipsis": "Other",
}
