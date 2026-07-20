import { LogOut, Moon, Sun } from "lucide-react"
import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { UserAvatar } from "@/components/user-avatar"
import { useTheme } from "@/components/theme-provider"
import { useAuth } from "@/features/auth/model/auth-context"
import { getDashboardTitle } from "@/features/dashboard/model/navigation"

export function DashboardHeader() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState<string | null>(null)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    setLogoutError(null)
    try {
      await logout()
      navigate("/login", { replace: true })
    } catch {
      setLogoutError("Logout failed. Please try again.")
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-5" />
      <h1 className="font-heading text-sm font-semibold">{getDashboardTitle(pathname)}</h1>

      <div className="ml-auto flex items-center gap-2">
        {logoutError && <span className="hidden text-xs text-destructive sm:inline">{logoutError}</span>}
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Toggle color theme"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun /> : <Moon />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 gap-2 px-2">
              {user ? (
                <UserAvatar
                  userId={user.id}
                  name={user.name}
                  decorative
                  className="size-7"
                />
              ) : null}
              <span className="hidden max-w-32 truncate text-xs sm:inline">{user?.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <span className="block truncate font-medium">{user?.name}</span>
              <span className="block truncate font-normal text-muted-foreground">{user?.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={isLoggingOut} onSelect={() => void handleLogout()}>
              <LogOut />
              {isLoggingOut ? "Signing out..." : "Sign out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
