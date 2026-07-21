import type { PropsWithChildren } from "react"
import { BrowserRouter } from "react-router-dom"

import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/features/auth/model/auth-context"

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
        <Toaster />
      </BrowserRouter>
    </ThemeProvider>
  )
}
