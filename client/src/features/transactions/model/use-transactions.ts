import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createTransaction, deleteTransaction, listTransactions, restoreTransaction, updateTransaction } from "@/features/transactions/api/transactions-api"
import type { TransactionFilters, TransactionPayload } from "@/features/transactions/model/transaction-types"

export const transactionKeys = { all: ["transactions"] as const, list: (filters: TransactionFilters) => ["transactions", "list", filters] as const }
export function useTransactions(filters: TransactionFilters) {
  const client = useQueryClient(); const query = useQuery({ queryKey: transactionKeys.list(filters), queryFn: () => listTransactions(filters) })
  const invalidate = async () => { await Promise.all(["transactions", "accounts", "budgets"].map((key) => client.invalidateQueries({ queryKey: [key] }))) }
  const createMutation = useMutation({ mutationFn: createTransaction, onSuccess: invalidate })
  const updateMutation = useMutation({ mutationFn: ({ id, payload }: { id: number; payload: TransactionPayload }) => updateTransaction(id, payload), onSuccess: invalidate })
  const deleteMutation = useMutation({ mutationFn: deleteTransaction, onSuccess: invalidate })
  const restoreMutation = useMutation({ mutationFn: restoreTransaction, onSuccess: invalidate })
  return { result: query.data, isLoading: query.isLoading, error: query.error instanceof Error ? query.error.message : null, refresh: query.refetch,
    create: async (payload: TransactionPayload) => { await createMutation.mutateAsync(payload) }, update: async (id: number, payload: TransactionPayload) => { await updateMutation.mutateAsync({ id, payload }) }, remove: async (id: number) => { await deleteMutation.mutateAsync(id) }, restore: async (id: number) => { await restoreMutation.mutateAsync(id) } }
}
