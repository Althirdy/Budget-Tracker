import axios from "axios"

import type { Category, CategoryFilters, CategoryPayload } from "@/features/categories/model/category-types"
import { httpClient } from "@/lib/http/client"
import { ApiError } from "@/lib/http/api-error"

interface CategoryResponse { data: Category }
interface CategoryCollectionResponse { data: Category[] }
interface ValidationErrorResponse { message?: string; errors?: Record<string, string[]> }

export class CategoryApiError extends ApiError {
  constructor(
    message: string,
    fieldErrors: Record<string, string[]> = {}
  ) {
    super(message, fieldErrors)
    this.name = "CategoryApiError"
  }
}

function toCategoryApiError(error: unknown): CategoryApiError {
  if (!axios.isAxiosError<ValidationErrorResponse>(error) || !error.response) {
    return new CategoryApiError("Unable to reach the server. Please try again.")
  }

  if (error.response.status === 401) return new CategoryApiError("Your session has expired. Please sign in again.")
  if (error.response.status === 404) return new CategoryApiError("This category no longer exists.")

  const body = error.response.data
  return new CategoryApiError(body.message ?? "The category request could not be completed.", body.errors)
}

export async function listCategories(filters: CategoryFilters): Promise<Category[]> {
  try {
    const { data } = await httpClient.get<CategoryCollectionResponse>("/api/v1/categories", { params: filters })
    return data.data
  } catch (error) {
    throw toCategoryApiError(error)
  }
}

export async function createCategory(payload: CategoryPayload): Promise<Category> {
  try {
    const { data } = await httpClient.post<CategoryResponse>("/api/v1/categories", payload)
    return data.data
  } catch (error) {
    throw toCategoryApiError(error)
  }
}

export async function updateCategory(id: number, payload: CategoryPayload): Promise<Category> {
  try {
    const { data } = await httpClient.put<CategoryResponse>(`/api/v1/categories/${id}`, payload)
    return data.data
  } catch (error) {
    throw toCategoryApiError(error)
  }
}

export async function archiveCategory(id: number): Promise<void> {
  try {
    await httpClient.delete(`/api/v1/categories/${id}`)
  } catch (error) {
    throw toCategoryApiError(error)
  }
}

export async function restoreCategory(id: number): Promise<Category> {
  try {
    const { data } = await httpClient.post<CategoryResponse>(`/api/v1/categories/${id}/restore`)
    return data.data
  } catch (error) {
    throw toCategoryApiError(error)
  }
}
