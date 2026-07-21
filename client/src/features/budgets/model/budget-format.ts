export function currentPeriod(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

export function formatPeriod(period: string): string {
  const [year, month] = period.split("-").map(Number)
  return new Intl.DateTimeFormat("en-PH", { month: "long", year: "numeric" }).format(new Date(year, month - 1, 1))
}

export function formatPhp(value: string | number): string {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(Number(value))
}
