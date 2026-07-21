import { formatPeriod, formatPhp } from "@/features/budgets/model/budget-format"

describe("budget formatting", () => {
  it("formats PHP amounts and calendar periods", () => {
    expect(formatPhp("5000.00")).toContain("5,000.00")
    expect(formatPeriod("2026-07")).toBe("July 2026")
  })
})
