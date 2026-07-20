/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react"

import {
  fetchCurrentUser,
  isUnauthenticatedError,
  loginUser,
  logoutUser,
} from "@/features/auth/api/auth-api"
import type {
  AuthenticatedUser,
  AuthStatus,
  LoginCredentials,
} from "@/features/auth/model/auth-types"

interface AuthContextValue {
  user: AuthenticatedUser | null
  status: AuthStatus
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>("loading")

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await fetchCurrentUser()
      setUser(currentUser)
      setStatus("authenticated")
    } catch (error) {
      setUser(null)
      setStatus(isUnauthenticatedError(error) ? "guest" : "error")
    }
  }, [])

  useEffect(() => {
    void refreshUser()
  }, [refreshUser])

  const login = useCallback(async (credentials: LoginCredentials) => {
    const authenticatedUser = await loginUser(credentials)
    setUser(authenticatedUser)
    setStatus("authenticated")
  }, [])

  const logout = useCallback(async () => {
    await logoutUser()
    setUser(null)
    setStatus("guest")
  }, [])

  const value = useMemo(
    () => ({ user, status, login, logout, refreshUser }),
    [user, status, login, logout, refreshUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
