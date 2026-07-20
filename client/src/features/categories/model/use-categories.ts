import { useCallback, useEffect, useState } from "react"

import {
  archiveCategory,
  createCategory,
  listCategories,
  restoreCategory,
  updateCategory,
} from "@/features/categories/api/categories-api"
import type { Category, CategoryFilters, CategoryPayload } from "@/features/categories/model/category-types"

export function useCategories(filters: CategoryFilters) {
  const { status, type, search } = filters
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      setCategories(await listCategories({ status, type, search }))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load categories.")
    } finally {
      setIsLoading(false)
    }
  }, [search, status, type])

  useEffect(() => { void refresh() }, [refresh])

  const create = async (payload: CategoryPayload) => {
    await createCategory(payload)
    await refresh()
  }

  const update = async (id: number, payload: CategoryPayload) => {
    await updateCategory(id, payload)
    await refresh()
  }

  const archive = async (id: number) => {
    await archiveCategory(id)
    await refresh()
  }

  const restore = async (id: number) => {
    await restoreCategory(id)
    await refresh()
  }

  return { categories, isLoading, error, refresh, create, update, archive, restore }
}
