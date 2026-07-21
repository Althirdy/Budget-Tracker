import { render, screen } from "@testing-library/react"
import { http, HttpResponse } from "msw"

import { AccountsPage } from "@/features/accounts/pages/accounts-page"
import { server } from "@/test/server"

describe("AccountsPage", () => {
  it("renders account metadata and liability wording", async () => {
    server.use(http.get("http://localhost:8080/api/v1/accounts", () => HttpResponse.json({ data: [{ id: 1, name: "Credit Card", type: "credit-card", opening_balance: "5000.00", currency: "PHP", color: "#EF4444", icon: "credit-card", is_liability: true, is_archived: false, created_at: "2026-07-21T00:00:00Z", updated_at: "2026-07-21T00:00:00Z" }] })))
    render(<AccountsPage />)
    expect((await screen.findAllByText("Credit Card")).length).toBeGreaterThan(0); expect(screen.getByText("Amount owed")).toBeInTheDocument(); expect(screen.getByRole("button", { name: "Edit Credit Card" })).toBeInTheDocument()
  })
  it("renders empty and error states", async () => {
    server.use(http.get("http://localhost:8080/api/v1/accounts", () => HttpResponse.json({ data: [] })))
    const { unmount } = render(<AccountsPage />); expect(await screen.findByText("No accounts found")).toBeInTheDocument(); unmount()
    server.use(http.get("http://localhost:8080/api/v1/accounts", () => HttpResponse.json({ message: "Unavailable" }, { status: 503 })))
    render(<AccountsPage />); expect(await screen.findByText("Unable to complete the request")).toBeInTheDocument()
  })
})
