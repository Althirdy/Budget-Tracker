import type { PropsWithChildren } from "react"
import { BrowserRouter } from "react-router-dom"

import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/features/auth/model/auth-context"

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}
