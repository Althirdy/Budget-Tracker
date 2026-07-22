import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { archiveAccount, createAccount, listAccounts, restoreAccount, updateAccount } from "@/features/accounts/api/accounts-api"
import type { AccountFilters, AccountPayload } from "@/features/accounts/model/account-types"

export const accountKeys = { all: ["accounts"] as const, list: (filters: AccountFilters) => ["accounts", "list", filters] as const }

export function useAccounts(filters: AccountFilters) {
  const client = useQueryClient()
  const query = useQuery({ queryKey: accountKeys.list(filters), queryFn: () => listAccounts(filters) })
  const invalidate = () => client.invalidateQueries({ queryKey: accountKeys.all })
  const createMutation = useMutation({ mutationFn: createAccount, onSuccess: invalidate })
  const updateMutation = useMutation({ mutationFn: ({ id, payload }: { id: number; payload: AccountPayload }) => updateAccount(id, payload), onSuccess: invalidate })
  const archiveMutation = useMutation({ mutationFn: archiveAccount, onSuccess: invalidate })
  const restoreMutation = useMutation({ mutationFn: restoreAccount, onSuccess: invalidate })

  return {
    accounts: query.data ?? [], isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null, refresh: query.refetch,
    create: async (payload: AccountPayload) => { await createMutation.mutateAsync(payload) },
    update: async (id: number, payload: AccountPayload) => { await updateMutation.mutateAsync({ id, payload }) },
    archive: async (id: number) => { await archiveMutation.mutateAsync(id) }, restore: async (id: number) => { await restoreMutation.mutateAsync(id) },
  }
}
