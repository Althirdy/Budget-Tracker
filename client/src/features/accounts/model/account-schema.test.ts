import { accountSchema } from "@/features/accounts/model/account-schema"

describe("accountSchema", () => {
  const valid = { name: "Cash Wallet", type: "cash", opening_balance: "1000.00", color: "#F97316", icon: "wallet" }
  it("accepts the public enum contract and a two-decimal balance", () => { expect(accountSchema.safeParse(valid).success).toBe(true) })
  it("rejects invalid enum values and negative or over-precision balances", () => {
    expect(accountSchema.safeParse({ ...valid, type: "bank" }).success).toBe(false)
    expect(accountSchema.safeParse({ ...valid, opening_balance: "-1" }).success).toBe(false)
    expect(accountSchema.safeParse({ ...valid, opening_balance: "1.234" }).success).toBe(false)
  })
})
