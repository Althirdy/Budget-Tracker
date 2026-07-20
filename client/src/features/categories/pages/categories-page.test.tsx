import { render, screen } from "@testing-library/react"
import { http, HttpResponse } from "msw"

import { CategoriesPage } from "@/features/categories/pages/categories-page"
import { server } from "@/test/server"

describe("CategoriesPage", () => {
  it("renders category visual metadata and actions", async () => {
    server.use(http.get("http://localhost:8080/api/v1/categories", () => HttpResponse.json({ data: [{ id: 1, name: "Groceries", type: "expense", color: "#F97316", icon: "shopping-cart", is_archived: false, created_at: "2026-07-20T00:00:00Z", updated_at: "2026-07-20T00:00:00Z" }] })))
    render(<CategoriesPage />)

    expect(await screen.findByText("Groceries")).toBeInTheDocument()
    expect(screen.getByText("#F97316")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Edit Groceries" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Archive Groceries" })).toBeInTheDocument()
  })

  it("renders an empty state", async () => {
    server.use(http.get("http://localhost:8080/api/v1/categories", () => HttpResponse.json({ data: [] })))
    render(<CategoriesPage />)
    expect(await screen.findByText("No categories found")).toBeInTheDocument()
  })

  it("renders a server error with retry", async () => {
    server.use(http.get("http://localhost:8080/api/v1/categories", () => HttpResponse.json({ message: "Unavailable" }, { status: 503 })))
    render(<CategoriesPage />)
    expect(await screen.findByText("Unable to complete the request")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument()
  })
})
