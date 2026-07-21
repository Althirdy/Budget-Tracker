import { createBudgetSchema, updateBudgetSchema } from "@/features/budgets/model/budget-schema"

describe("budget schemas", () => {
  it("accepts positive amounts with up to two decimal places", () => {
    expect(createBudgetSchema.safeParse({ categoryId: "1", amount: "5000.50" }).success).toBe(true)
    expect(updateBudgetSchema.safeParse({ amount: "1" }).success).toBe(true)
  })

  it("rejects missing categories, zero, negative, and excessive precision", () => {
    expect(createBudgetSchema.safeParse({ categoryId: "", amount: "100" }).success).toBe(false)
    expect(updateBudgetSchema.safeParse({ amount: "0" }).success).toBe(false)
    expect(updateBudgetSchema.safeParse({ amount: "-10" }).success).toBe(false)
    expect(updateBudgetSchema.safeParse({ amount: "10.999" }).success).toBe(false)
  })
})
