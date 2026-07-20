import { CircleDollarSign, PiggyBank, TrendingDown, TrendingUp } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const summaries = [
  { title: "Total Balance", icon: CircleDollarSign },
  { title: "Monthly Income", icon: TrendingUp },
  { title: "Monthly Spending", icon: TrendingDown },
  { title: "Budget Remaining", icon: PiggyBank },
]

export function OverviewCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {summaries.map((summary) => (
        <Card key={summary.title}>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">{summary.title}</CardTitle>
            <summary.icon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">—</p>
            <CardDescription>No data yet</CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
