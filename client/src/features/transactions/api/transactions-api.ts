import axios from "axios"
import type { Transaction, TransactionFilters, TransactionListResult, TransactionPayload } from "@/features/transactions/model/transaction-types"
import { ApiError } from "@/lib/http/api-error"
import { httpClient } from "@/lib/http/client"

interface Response { data: Transaction }
interface ErrorResponse { message?: string; errors?: Record<string, string[]> }
export class TransactionApiError extends ApiError { constructor(message: string, fields: Record<string, string[]> = {}) { super(message, fields); this.name = "TransactionApiError" } }
function normalize(error: unknown) {
  if (!axios.isAxiosError<ErrorResponse>(error) || !error.response) return new TransactionApiError("Unable to reach the server. Please try again.")
  if (error.response.status === 401) return new TransactionApiError("Your session has expired. Please sign in again.")
  if (error.response.status === 404) return new TransactionApiError("This transaction no longer exists.")
  return new TransactionApiError(error.response.data.message ?? "The transaction request could not be completed.", error.response.data.errors)
}
export async function listTransactions(filters: TransactionFilters): Promise<TransactionListResult> { try { return (await httpClient.get<TransactionListResult>("/api/v1/transactions", { params: filters })).data } catch (e) { throw normalize(e) } }
export async function createTransaction(payload: TransactionPayload): Promise<Transaction> { try { return (await httpClient.post<Response>("/api/v1/transactions", payload)).data.data } catch (e) { throw normalize(e) } }
export async function updateTransaction(id: number, payload: TransactionPayload): Promise<Transaction> { try { return (await httpClient.put<Response>(`/api/v1/transactions/${id}`, payload)).data.data } catch (e) { throw normalize(e) } }
export async function deleteTransaction(id: number): Promise<void> { try { await httpClient.delete(`/api/v1/transactions/${id}`) } catch (e) { throw normalize(e) } }
export async function restoreTransaction(id: number): Promise<Transaction> { try { return (await httpClient.post<Response>(`/api/v1/transactions/${id}/restore`)).data.data } catch (e) { throw normalize(e) } }
