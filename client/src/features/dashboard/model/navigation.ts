import {
  Landmark,
  LayoutDashboard,
  ListChecks,
  Settings,
  WalletCards,
  type LucideIcon,
} from "lucide-react"

export interface DashboardNavigationItem {
  label: string
  path: string
  icon: LucideIcon
}

export const dashboardNavigation: DashboardNavigationItem[] = [
  { label: "Overview", path: "/dashboard", icon: LayoutDashboard },
  { label: "Budgets", path: "/dashboard/budgets", icon: WalletCards },
  { label: "Transactions", path: "/dashboard/transactions", icon: ListChecks },
  { label: "Accounts", path: "/dashboard/accounts", icon: Landmark },
  { label: "Settings", path: "/dashboard/settings", icon: Settings },
]

export function getDashboardTitle(pathname: string): string {
  return dashboardNavigation.find((item) => item.path === pathname)?.label ?? "Budget Tracker"
}
