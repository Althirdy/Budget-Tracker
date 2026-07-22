import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { createBudget, deleteBudget, listBudgets, updateBudget } from "@/features/budgets/api/budgets-api"
import type { BudgetListMeta, CreateBudgetPayload } from "@/features/budgets/model/budget-types"

const emptyMeta = (period: string): BudgetListMeta => ({ planned_total: "0.00", currency: "PHP", period })
export const budgetKeys = { all: ["budgets"] as const, list: (period: string) => ["budgets", "list", period] as const }

export function useBudgets(period: string) {
  const client = useQueryClient()
  const query = useQuery({ queryKey: budgetKeys.list(period), queryFn: () => listBudgets(period) })
  const invalidate = () => client.invalidateQueries({ queryKey: budgetKeys.all })
  const createMutation = useMutation({ mutationFn: createBudget, onSuccess: invalidate })
  const updateMutation = useMutation({ mutationFn: ({ id, amount }: { id: number; amount: string }) => updateBudget(id, { amount }), onSuccess: invalidate })
  const deleteMutation = useMutation({ mutationFn: deleteBudget, onSuccess: invalidate })
  return {
    budgets: query.data?.data ?? [], meta: query.data?.meta ?? emptyMeta(period), isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null, refresh: query.refetch,
    create: async (payload: CreateBudgetPayload) => { await createMutation.mutateAsync(payload) },
    update: async (id: number, amount: string) => { await updateMutation.mutateAsync({ id, amount }) },
    remove: async (id: number) => { await deleteMutation.mutateAsync(id) },
  }
}
