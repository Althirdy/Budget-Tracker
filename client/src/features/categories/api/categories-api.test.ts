import { http, HttpResponse } from "msw"

import { archiveCategory, createCategory, listCategories, restoreCategory, updateCategory } from "@/features/categories/api/categories-api"
import type { Category, CategoryPayload } from "@/features/categories/model/category-types"
import { server } from "@/test/server"

const category: Category = { id: 1, name: "Groceries", type: "expense", color: "#F97316", icon: "shopping-cart", is_archived: false, created_at: "2026-07-20T00:00:00Z", updated_at: "2026-07-20T00:00:00Z" }
const payload: CategoryPayload = { name: "Groceries", type: "expense", color: "#F97316", icon: "shopping-cart" }

describe("categories API", () => {
  it("passes list filters and reads the resource collection", async () => {
    server.use(http.get("http://localhost:8080/api/v1/categories", ({ request }) => {
      const url = new URL(request.url)
      expect(url.searchParams.get("status")).toBe("archived")
      expect(url.searchParams.get("type")).toBe("expense")
      expect(url.searchParams.get("search")).toBe("Groc")
      return HttpResponse.json({ data: [category] })
    }))

    await expect(listCategories({ status: "archived", type: "expense", search: "Groc" })).resolves.toEqual([category])
  })

  it("supports create, update, archive, and restore", async () => {
    server.use(
      http.post("http://localhost:8080/api/v1/categories", async ({ request }) => { expect(await request.json()).toEqual(payload); return HttpResponse.json({ data: category }, { status: 201 }) }),
      http.put("http://localhost:8080/api/v1/categories/1", async ({ request }) => { expect(await request.json()).toEqual(payload); return HttpResponse.json({ data: category }) }),
      http.delete("http://localhost:8080/api/v1/categories/1", () => new HttpResponse(null, { status: 204 })),
      http.post("http://localhost:8080/api/v1/categories/1/restore", () => HttpResponse.json({ data: category }))
    )

    await expect(createCategory(payload)).resolves.toEqual(category)
    await expect(updateCategory(1, payload)).resolves.toEqual(category)
    await expect(archiveCategory(1)).resolves.toBeUndefined()
    await expect(restoreCategory(1)).resolves.toEqual(category)
  })
})
