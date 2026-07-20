import { Navigate, Outlet, useLocation } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth/model/auth-context"
import { AuthLoadingScreen } from "@/features/auth/routes/auth-loading-screen"

export function ProtectedRoute() {
  const { status, refreshUser } = useAuth()
  const location = useLocation()

  if (status === "loading") {
    return <AuthLoadingScreen />
  }

  if (status === "error") {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
        <div>
          <h1 className="font-heading text-xl font-semibold">We could not verify your session</h1>
          <p className="mt-1 text-sm text-muted-foreground">Check that the API is running, then try again.</p>
        </div>
        <Button onClick={() => void refreshUser()}>Retry</Button>
      </div>
    )
  }

  if (status !== "authenticated") {
    return <Navigate replace to="/login" state={{ from: location.pathname }} />
  }

  return <Outlet />
}
