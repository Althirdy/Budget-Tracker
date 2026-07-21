import { http, HttpResponse } from "msw"

import { archiveAccount, createAccount, listAccounts, restoreAccount, updateAccount } from "@/features/accounts/api/accounts-api"
import type { Account, AccountPayload } from "@/features/accounts/model/account-types"
import { server } from "@/test/server"

const account: Account = { id: 1, name: "Cash Wallet", type: "cash", opening_balance: "2500.00", currency: "PHP", color: "#F97316", icon: "wallet", is_liability: false, is_archived: false, created_at: "2026-07-21T00:00:00Z", updated_at: "2026-07-21T00:00:00Z" }
const payload: AccountPayload = { name: "Cash Wallet", type: "cash", opening_balance: "2500.00", color: "#F97316", icon: "wallet" }

describe("accounts API", () => {
  it("passes filters and reads the collection", async () => {
    server.use(http.get("http://localhost:8080/api/v1/accounts", ({ request }) => { const url = new URL(request.url); expect(url.searchParams.get("status")).toBe("archived"); expect(url.searchParams.get("type")).toBe("cash"); expect(url.searchParams.get("search")).toBe("Wallet"); return HttpResponse.json({ data: [account] }) }))
    await expect(listAccounts({ status: "archived", type: "cash", search: "Wallet" })).resolves.toEqual([account])
  })
  it("supports create, update, archive, and restore", async () => {
    server.use(http.post("http://localhost:8080/api/v1/accounts", async ({ request }) => { expect(await request.json()).toEqual(payload); return HttpResponse.json({ data: account }, { status: 201 }) }), http.put("http://localhost:8080/api/v1/accounts/1", async ({ request }) => { expect(await request.json()).toEqual(payload); return HttpResponse.json({ data: account }) }), http.delete("http://localhost:8080/api/v1/accounts/1", () => new HttpResponse(null, { status: 204 })), http.post("http://localhost:8080/api/v1/accounts/1/restore", () => HttpResponse.json({ data: account })))
    await expect(createAccount(payload)).resolves.toEqual(account); await expect(updateAccount(1, payload)).resolves.toEqual(account); await expect(archiveAccount(1)).resolves.toBeUndefined(); await expect(restoreAccount(1)).resolves.toEqual(account)
  })
})
