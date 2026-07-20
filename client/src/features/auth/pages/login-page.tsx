import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoginForm } from "@/features/auth/components/login-form"

export function LoginPage() {
  return (
    <main className="grid min-h-svh place-items-center bg-muted/30 p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img
            src="/brand/tally-budget-logo.png"
            alt="Tally, the Budget Tracker mascot"
            className="mx-auto mb-2 size-20 object-contain"
          />
          <CardTitle className="font-heading text-xl">Tally</CardTitle>
          <CardDescription>Sign in to manage your budgets and spending.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <LoginForm />
          {import.meta.env.DEV && (
            <div className="border-t pt-4 text-center text-xs text-muted-foreground">
              Local account: <span className="font-mono">test@example.com</span> / <span className="font-mono">password</span>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
