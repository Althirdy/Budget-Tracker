export interface AuthenticatedUser {
  id: number
  name: string
  email: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthenticatedUserResponse {
  user: AuthenticatedUser
}

export type AuthStatus = "loading" | "authenticated" | "guest" | "error"
