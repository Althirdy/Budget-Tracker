import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { archiveCategory, createCategory, listCategories, restoreCategory, updateCategory } from "@/features/categories/api/categories-api"
import type { CategoryFilters, CategoryPayload } from "@/features/categories/model/category-types"

export const categoryKeys = { all: ["categories"] as const, list: (filters: CategoryFilters) => ["categories", "list", filters] as const }

export function useCategories(filters: CategoryFilters) {
  const client = useQueryClient()
  const query = useQuery({ queryKey: categoryKeys.list(filters), queryFn: () => listCategories(filters) })
  const invalidate = () => client.invalidateQueries({ queryKey: categoryKeys.all })
  const createMutation = useMutation({ mutationFn: createCategory, onSuccess: invalidate })
  const updateMutation = useMutation({ mutationFn: ({ id, payload }: { id: number; payload: CategoryPayload }) => updateCategory(id, payload), onSuccess: invalidate })
  const archiveMutation = useMutation({ mutationFn: archiveCategory, onSuccess: invalidate })
  const restoreMutation = useMutation({ mutationFn: restoreCategory, onSuccess: invalidate })
  return {
    categories: query.data ?? [], isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null, refresh: query.refetch,
    create: async (payload: CategoryPayload) => { await createMutation.mutateAsync(payload) },
    update: async (id: number, payload: CategoryPayload) => { await updateMutation.mutateAsync({ id, payload }) },
    archive: async (id: number) => { await archiveMutation.mutateAsync(id) }, restore: async (id: number) => { await restoreMutation.mutateAsync(id) },
  }
}
