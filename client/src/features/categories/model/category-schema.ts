import { z } from "zod"

import { categoryIcons, categoryTypes } from "@/features/categories/model/category-types"

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Name must contain at least 2 characters").max(50, "Name must not exceed 50 characters"),
  type: z.enum(categoryTypes),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Choose a valid category color"),
  icon: z.enum(categoryIcons),
})

export type CategoryFormValues = z.infer<typeof categorySchema>
