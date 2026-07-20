import { http, HttpResponse } from "msw"
import { useState } from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { AuthProvider, useAuth } from "@/features/auth/model/auth-context"
import { server } from "@/test/server"

const user = { id: 1, name: "Test User", email: "test@example.com" }

function AuthProbe() {
  const auth = useAuth()
  const [error, setError] = useState("")

  return (
    <div>
      <p>{auth.status}</p>
      <p>{auth.user?.email}</p>
      <p>{error}</p>
      <button
        onClick={() =>
          void auth.login({ email: "test@example.com", password: "password" }).catch((reason: unknown) => {
            setError(reason instanceof Error ? reason.message : "failed")
          })
        }
      >
        Login
      </button>
      <button onClick={() => void auth.logout()}>Logout</button>
    </div>
  )
}

describe("AuthProvider", () => {
  it("loads a guest session, logs in, and logs out", async () => {
    server.use(
      http.get("http://localhost:8080/api/v1/auth/me", () =>
        HttpResponse.json({ message: "Unauthenticated" }, { status: 401 })
      ),
      http.get("http://localhost:8080/sanctum/csrf-cookie", () => new HttpResponse(null, { status: 204 })),
      http.post("http://localhost:8080/api/v1/auth/login", () => HttpResponse.json({ user })),
      http.post("http://localhost:8080/api/v1/auth/logout", () => new HttpResponse(null, { status: 204 }))
    )

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    )

    expect(await screen.findByText("guest")).toBeInTheDocument()

    await userEvent.click(screen.getByRole("button", { name: "Login" }))
    expect(await screen.findByText("authenticated")).toBeInTheDocument()
    expect(screen.getByText("test@example.com")).toBeInTheDocument()

    await userEvent.click(screen.getByRole("button", { name: "Logout" }))
    await waitFor(() => expect(screen.getByText("guest")).toBeInTheDocument())
  })

  it("keeps API failures separate from guest sessions", async () => {
    server.use(
      http.get("http://localhost:8080/api/v1/auth/me", () =>
        HttpResponse.json({ message: "Unavailable" }, { status: 503 })
      )
    )

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    )

    expect(await screen.findByText("error")).toBeInTheDocument()
  })
})
