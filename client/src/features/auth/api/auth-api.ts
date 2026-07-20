import axios from "axios"

import { httpClient } from "@/lib/http/client"
import type {
  AuthenticatedUser,
  AuthenticatedUserResponse,
  LoginCredentials,
} from "@/features/auth/model/auth-types"

export type LoginFailureKind = "credentials" | "rate-limit" | "network" | "server"

export class LoginFailure extends Error {
  constructor(
    public readonly kind: LoginFailureKind,
    message: string
  ) {
    super(message)
    this.name = "LoginFailure"
  }
}

export async function fetchCurrentUser(): Promise<AuthenticatedUser> {
  const { data } = await httpClient.get<AuthenticatedUserResponse>("/api/v1/auth/me")
  return data.user
}

export async function loginUser(credentials: LoginCredentials): Promise<AuthenticatedUser> {
  try {
    await httpClient.get("/sanctum/csrf-cookie")
    const { data } = await httpClient.post<AuthenticatedUserResponse>(
      "/api/v1/auth/login",
      credentials
    )
    return data.user
  } catch (error) {
    if (!axios.isAxiosError(error) || !error.response) {
      throw new LoginFailure("network", "Unable to reach the server. Check your connection and try again.")
    }

    if (error.response.status === 422) {
      throw new LoginFailure("credentials", "The email or password is incorrect.")
    }

    if (error.response.status === 429) {
      throw new LoginFailure("rate-limit", "Too many login attempts. Please wait a minute and try again.")
    }

    throw new LoginFailure("server", "The server could not complete the login request.")
  }
}

export async function logoutUser(): Promise<void> {
  await httpClient.post("/api/v1/auth/logout")
}

export function isUnauthenticatedError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 401
}
