import { Navigate, Outlet } from "react-router-dom"

import { useAuth } from "@/features/auth/model/auth-context"
import { AuthLoadingScreen } from "@/features/auth/routes/auth-loading-screen"

export function GuestRoute() {
  const { status } = useAuth()

  if (status === "loading") {
    return <AuthLoadingScreen />
  }

  if (status === "authenticated") {
    return <Navigate replace to="/dashboard" />
  }

  return <Outlet />
}
