import { http, HttpResponse } from "msw"

import { createBudget, deleteBudget, listBudgets, updateBudget } from "@/features/budgets/api/budgets-api"
import type { Budget, CreateBudgetPayload } from "@/features/budgets/model/budget-types"
import { server } from "@/test/server"

const budget: Budget = {
  id: 1,
  period: "2026-07",
  amount: "5000.00",
  spent: "1000.00",
  remaining: "4000.00",
  progress_percentage: "20.00",
  currency: "PHP",
  category: { id: 2, name: "Groceries", color: "#F97316", icon: "shopping-cart", is_archived: false },
  created_at: "2026-07-21T00:00:00Z",
  updated_at: "2026-07-21T00:00:00Z",
}

describe("budgets API", () => {
  it("lists the selected month and returns summary metadata", async () => {
    server.use(http.get("http://localhost:8080/api/v1/budgets", ({ request }) => {
      expect(new URL(request.url).searchParams.get("period")).toBe("2026-07")
      return HttpResponse.json({ data: [budget], meta: { planned_total: "5000.00", currency: "PHP", period: "2026-07" } })
    }))

    await expect(listBudgets("2026-07")).resolves.toEqual({
      data: [budget],
      meta: { planned_total: "5000.00", currency: "PHP", period: "2026-07" },
    })
  })

  it("supports create, amount update, and hard deletion", async () => {
    const payload: CreateBudgetPayload = { category_id: 2, period: "2026-07", amount: "5000.00" }
    server.use(
      http.post("http://localhost:8080/api/v1/budgets", async ({ request }) => { expect(await request.json()).toEqual(payload); return HttpResponse.json({ data: budget }, { status: 201 }) }),
      http.put("http://localhost:8080/api/v1/budgets/1", async ({ request }) => { expect(await request.json()).toEqual({ amount: "6000.00" }); return HttpResponse.json({ data: { ...budget, amount: "6000.00" } }) }),
      http.delete("http://localhost:8080/api/v1/budgets/1", () => new HttpResponse(null, { status: 204 }))
    )

    await expect(createBudget(payload)).resolves.toEqual(budget)
    await expect(updateBudget(1, { amount: "6000.00" })).resolves.toMatchObject({ amount: "6000.00" })
    await expect(deleteBudget(1)).resolves.toBeUndefined()
  })
})
