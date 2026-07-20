import { categorySchema } from "@/features/categories/model/category-schema"

describe("categorySchema", () => {
  it("accepts and trims a valid category", () => {
    expect(categorySchema.parse({ name: "  Groceries ", type: "expense", color: "#F97316", icon: "shopping-cart" }).name).toBe("Groceries")
  })

  it("rejects invalid names, types, colors, and icons", () => {
    expect(categorySchema.safeParse({ name: "X", type: "transfer", color: "orange", icon: "unknown" }).success).toBe(false)
  })
})
