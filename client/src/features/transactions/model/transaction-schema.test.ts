import { transactionSchema } from "@/features/transactions/model/transaction-schema"

describe("transactionSchema", () => {
  const base = { type: "expense", amount: "100.00", transaction_date: "2026-07-20", description: "Groceries", notes: "", account_id: "1", category_id: "2", source_account_id: "", destination_account_id: "" }
  it("accepts a regular transaction", () => { expect(transactionSchema.safeParse(base).success).toBe(true) })
  it("requires two different transfer accounts", () => { expect(transactionSchema.safeParse({ ...base, type: "transfer", account_id: "", category_id: "", source_account_id: "1", destination_account_id: "1" }).success).toBe(false) })
  it("rejects negative and over-precision amounts", () => { expect(transactionSchema.safeParse({ ...base, amount: "-1" }).success).toBe(false); expect(transactionSchema.safeParse({ ...base, amount: "1.234" }).success).toBe(false) })
})
