import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render as testingRender, type RenderOptions } from "@testing-library/react"
import type { ReactElement, ReactNode } from "react"

export * from "@testing-library/react"

export function render(ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  function Wrapper({ children }: { children: ReactNode }) { return <QueryClientProvider client={client}>{children}</QueryClientProvider> }
  return testingRender(ui, { wrapper: Wrapper, ...options })
}
