import { http, HttpResponse } from "msw"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { render, screen } from "@testing-library/react"

import { AuthProvider } from "@/features/auth/model/auth-context"
import { ProtectedRoute } from "@/features/auth/routes/protected-route"
import { server } from "@/test/server"

describe("ProtectedRoute", () => {
  it("redirects guests to login", async () => {
    server.use(
      http.get("http://localhost:8080/api/v1/auth/me", () =>
        HttpResponse.json({ message: "Unauthenticated" }, { status: 401 })
      )
    )

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <AuthProvider>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<p>Dashboard</p>} />
            </Route>
            <Route path="/login" element={<p>Login page</p>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    )

    expect(await screen.findByText("Login page")).toBeInTheDocument()
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument()
  })
})
