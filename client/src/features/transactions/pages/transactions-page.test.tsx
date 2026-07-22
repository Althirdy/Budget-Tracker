import { http, HttpResponse } from "msw"
import { TransactionsPage } from "@/features/transactions/pages/transactions-page"
import { server } from "@/test/server"
import { render, screen } from "@/test/render"

describe("TransactionsPage", () => {
  it("renders a logical transfer as one row", async () => {
    server.use(
      http.get("http://localhost:8080/api/v1/accounts", () => HttpResponse.json({ data: [] })),
      http.get("http://localhost:8080/api/v1/categories", () => HttpResponse.json({ data: [] })),
      http.get("http://localhost:8080/api/v1/transactions", () => HttpResponse.json({ data: [{ id: 1, type: "transfer", amount: "500.00", currency: "PHP", transaction_date: "2026-07-20", description: "Move savings", notes: null, category: null, account: null, source_account: { id: 1, name: "Checking", type: "checking", color: "#000000", icon: "landmark", is_archived: false }, destination_account: { id: 2, name: "Savings", type: "savings", color: "#22C55E", icon: "piggy-bank", is_archived: false }, is_deleted: false, created_at: "2026-07-20T00:00:00Z", updated_at: "2026-07-20T00:00:00Z" }], meta: { current_page: 1, last_page: 1, per_page: 25, total: 1 } }))
    )
    render(<TransactionsPage />)
    expect(await screen.findByText("Move savings")).toBeInTheDocument(); expect(screen.getByText("Checking → Savings")).toBeInTheDocument(); expect(screen.getAllByText("transfer")).toHaveLength(1)
  })
})
