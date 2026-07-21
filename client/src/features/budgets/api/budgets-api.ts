import axios from "axios"

import type { Budget, BudgetListResult, CreateBudgetPayload, UpdateBudgetPayload } from "@/features/budgets/model/budget-types"
import { httpClient } from "@/lib/http/client"
import { ApiError } from "@/lib/http/api-error"

interface BudgetResponse { data: Budget }
interface ValidationErrorResponse { message?: string; errors?: Record<string, string[]> }

export class BudgetApiError extends ApiError {
  constructor(
    message: string,
    fieldErrors: Record<string, string[]> = {}
  ) {
    super(message, fieldErrors)
    this.name = "BudgetApiError"
  }
}

function toBudgetApiError(error: unknown): BudgetApiError {
  if (!axios.isAxiosError<ValidationErrorResponse>(error) || !error.response) {
    return new BudgetApiError("Unable to reach the server. Please try again.")
  }

  if (error.response.status === 401) return new BudgetApiError("Your session has expired. Please sign in again.")
  if (error.response.status === 404) return new BudgetApiError("This budget no longer exists.")

  return new BudgetApiError(
    error.response.data.message ?? "The budget request could not be completed.",
    error.response.data.errors
  )
}

export async function listBudgets(period: string): Promise<BudgetListResult> {
  try {
    const { data } = await httpClient.get<BudgetListResult>("/api/v1/budgets", { params: { period } })
    return data
  } catch (error) {
    throw toBudgetApiError(error)
  }
}

export async function createBudget(payload: CreateBudgetPayload): Promise<Budget> {
  try {
    const { data } = await httpClient.post<BudgetResponse>("/api/v1/budgets", payload)
    return data.data
  } catch (error) {
    throw toBudgetApiError(error)
  }
}

export async function updateBudget(id: number, payload: UpdateBudgetPayload): Promise<Budget> {
  try {
    const { data } = await httpClient.put<BudgetResponse>(`/api/v1/budgets/${id}`, payload)
    return data.data
  } catch (error) {
    throw toBudgetApiError(error)
  }
}

export async function deleteBudget(id: number): Promise<void> {
  try {
    await httpClient.delete(`/api/v1/budgets/${id}`)
  } catch (error) {
    throw toBudgetApiError(error)
  }
}
