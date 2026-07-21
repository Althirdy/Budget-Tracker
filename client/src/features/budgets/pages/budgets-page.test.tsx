import { render, screen } from "@testing-library/react"
import { http, HttpResponse } from "msw"

import { BudgetsPage } from "@/features/budgets/pages/budgets-page"
import { server } from "@/test/server"

const category = { id: 2, name: "Groceries", type: "expense", color: "#F97316", icon: "shopping-cart", is_archived: false, created_at: "2026-07-21T00:00:00Z", updated_at: "2026-07-21T00:00:00Z" }
const budget = { id: 1, period: "2026-07", amount: "5000.00", currency: "PHP", category: { id: 2, name: "Groceries", color: "#F97316", icon: "shopping-cart", is_archived: false }, created_at: "2026-07-21T00:00:00Z", updated_at: "2026-07-21T00:00:00Z" }

describe("BudgetsPage", () => {
  it("renders the monthly planned total and category budget", async () => {
    server.use(
      http.get("http://localhost:8080/api/v1/categories", () => HttpResponse.json({ data: [category] })),
      http.get("http://localhost:8080/api/v1/budgets", () => HttpResponse.json({ data: [budget], meta: { planned_total: "5000.00", currency: "PHP", period: "2026-07" } }))
    )
    render(<BudgetsPage />)

    expect(await screen.findByText("Groceries")).toBeInTheDocument()
    expect(screen.getAllByText(/5,000\.00/).length).toBeGreaterThan(0)
    expect(screen.getByRole("button", { name: "Edit Groceries budget" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Delete Groceries budget" })).toBeInTheDocument()
  })

  it("renders the empty month state", async () => {
    server.use(
      http.get("http://localhost:8080/api/v1/categories", () => HttpResponse.json({ data: [category] })),
      http.get("http://localhost:8080/api/v1/budgets", ({ request }) => { const period = new URL(request.url).searchParams.get("period"); return HttpResponse.json({ data: [], meta: { planned_total: "0.00", currency: "PHP", period } }) })
    )
    render(<BudgetsPage />)
    expect(await screen.findByText(/No budgets for/)).toBeInTheDocument()
  })
})
