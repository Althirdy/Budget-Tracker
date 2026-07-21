import axios from "axios"

import type { Account, AccountFilters, AccountPayload } from "@/features/accounts/model/account-types"
import { httpClient } from "@/lib/http/client"

interface AccountResponse { data: Account }
interface AccountCollectionResponse { data: Account[] }
interface ValidationErrorResponse { message?: string; errors?: Record<string, string[]> }

export class AccountApiError extends Error {
  constructor(message: string, public readonly fieldErrors: Record<string, string[]> = {}) {
    super(message)
    this.name = "AccountApiError"
  }
}

function toAccountApiError(error: unknown): AccountApiError {
  if (!axios.isAxiosError<ValidationErrorResponse>(error) || !error.response) return new AccountApiError("Unable to reach the server. Please try again.")
  if (error.response.status === 401) return new AccountApiError("Your session has expired. Please sign in again.")
  if (error.response.status === 404) return new AccountApiError("This account no longer exists.")
  const body = error.response.data
  return new AccountApiError(body.message ?? "The account request could not be completed.", body.errors)
}

export async function listAccounts(filters: AccountFilters): Promise<Account[]> {
  try { const { data } = await httpClient.get<AccountCollectionResponse>("/api/v1/accounts", { params: filters }); return data.data } catch (error) { throw toAccountApiError(error) }
}
export async function createAccount(payload: AccountPayload): Promise<Account> {
  try { const { data } = await httpClient.post<AccountResponse>("/api/v1/accounts", payload); return data.data } catch (error) { throw toAccountApiError(error) }
}
export async function updateAccount(id: number, payload: AccountPayload): Promise<Account> {
  try { const { data } = await httpClient.put<AccountResponse>(`/api/v1/accounts/${id}`, payload); return data.data } catch (error) { throw toAccountApiError(error) }
}
export async function archiveAccount(id: number): Promise<void> {
  try { await httpClient.delete(`/api/v1/accounts/${id}`) } catch (error) { throw toAccountApiError(error) }
}
export async function restoreAccount(id: number): Promise<Account> {
  try { const { data } = await httpClient.post<AccountResponse>(`/api/v1/accounts/${id}/restore`); return data.data } catch (error) { throw toAccountApiError(error) }
}
