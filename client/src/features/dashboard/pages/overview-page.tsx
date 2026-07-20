import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OverviewCards } from "@/features/dashboard/components/overview-cards"

export function OverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-semibold tracking-tight">Financial overview</h2>
        <p className="text-sm text-muted-foreground">Your budget workspace is ready for accounts and transactions.</p>
      </div>

      <OverviewCards />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent transactions</CardTitle>
            <CardDescription>Your latest income and expenses will appear here.</CardDescription>
          </CardHeader>
          <CardContent className="grid min-h-44 place-items-center border-t text-center text-sm text-muted-foreground">
            No transactions yet
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Monthly budget</CardTitle>
            <CardDescription>Category progress will appear after budgets are created.</CardDescription>
          </CardHeader>
          <CardContent className="grid min-h-44 place-items-center border-t text-center text-sm text-muted-foreground">
            No budgets yet
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
