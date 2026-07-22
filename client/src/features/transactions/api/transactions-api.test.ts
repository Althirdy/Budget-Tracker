import { http, HttpResponse } from "msw"
import { createTransaction, deleteTransaction, listTransactions, restoreTransaction } from "@/features/transactions/api/transactions-api"
import type { Transaction, TransactionPayload } from "@/features/transactions/model/transaction-types"
import { server } from "@/test/server"

const item: Transaction = { id: 1, type: "expense", amount: "100.00", currency: "PHP", transaction_date: "2026-07-20", description: "Groceries", notes: null, category: { id: 2, name: "Groceries", type: "expense", color: "#F97316", icon: "shopping-cart", is_archived: false }, account: { id: 1, name: "Cash", type: "cash", color: "#F97316", icon: "wallet", is_archived: false }, source_account: null, destination_account: null, is_deleted: false, created_at: "2026-07-20T00:00:00Z", updated_at: "2026-07-20T00:00:00Z" }
const payload: TransactionPayload = { type: "expense", account_id: 1, category_id: 2, amount: "100.00", transaction_date: "2026-07-20", description: "Groceries", notes: null }
describe("transactions API", () => {
  it("passes pagination and filters", async () => { server.use(http.get("http://localhost:8080/api/v1/transactions", ({ request }) => { const url = new URL(request.url); expect(url.searchParams.get("page")).toBe("2"); expect(url.searchParams.get("type")).toBe("expense"); return HttpResponse.json({ data: [item], meta: { current_page: 2, last_page: 2, per_page: 25, total: 26 } }) })); await expect(listTransactions({ status: "active", type: "expense", page: 2 })).resolves.toMatchObject({ data: [item] }) })
  it("supports create, delete, and restore", async () => { server.use(http.post("http://localhost:8080/api/v1/transactions", () => HttpResponse.json({ data: item }, { status: 201 })), http.delete("http://localhost:8080/api/v1/transactions/1", () => new HttpResponse(null, { status: 204 })), http.post("http://localhost:8080/api/v1/transactions/1/restore", () => HttpResponse.json({ data: item }))); await expect(createTransaction(payload)).resolves.toEqual(item); await expect(deleteTransaction(1)).resolves.toBeUndefined(); await expect(restoreTransaction(1)).resolves.toEqual(item) })
})
