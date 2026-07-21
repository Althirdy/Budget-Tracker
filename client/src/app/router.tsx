import { Navigate, Route, Routes } from "react-router-dom"

import { DashboardLayout } from "@/features/dashboard/layouts/dashboard-layout"
import { OverviewPage } from "@/features/dashboard/pages/overview-page"
import { PlaceholderPage } from "@/features/dashboard/pages/placeholder-page"
import { LoginPage } from "@/features/auth/pages/login-page"
import { GuestRoute } from "@/features/auth/routes/guest-route"
import { ProtectedRoute } from "@/features/auth/routes/protected-route"
import { useAuth } from "@/features/auth/model/auth-context"
import { CategoriesPage } from "@/features/categories/pages/categories-page"
import { BudgetsPage } from "@/features/budgets/pages/budgets-page"

function HomeRedirect() {
  const { status } = useAuth()

  if (status === "loading") {
    return null
  }

  return <Navigate replace to={status === "authenticated" ? "/dashboard" : "/login"} />
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<OverviewPage />} />
          <Route path="budgets" element={<BudgetsPage />} />
          <Route path="transactions" element={<PlaceholderPage title="Transactions" />} />
          <Route path="accounts" element={<PlaceholderPage title="Accounts" />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="settings" element={<PlaceholderPage title="Settings" />} />
        </Route>
      </Route>
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  )
}
