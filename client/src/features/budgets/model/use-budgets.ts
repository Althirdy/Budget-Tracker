import { useCallback, useEffect, useState } from "react"

import { createBudget, deleteBudget, listBudgets, updateBudget } from "@/features/budgets/api/budgets-api"
import type { Budget, BudgetListMeta, CreateBudgetPayload } from "@/features/budgets/model/budget-types"

const emptyMeta = (period: string): BudgetListMeta => ({ planned_total: "0.00", currency: "PHP", period })

export function useBudgets(period: string) {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [meta, setMeta] = useState<BudgetListMeta>(() => emptyMeta(period))
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    setMeta(emptyMeta(period))
    try {
      const result = await listBudgets(period)
      setBudgets(result.data)
      setMeta(result.meta)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load budgets.")
    } finally {
      setIsLoading(false)
    }
  }, [period])

  useEffect(() => { void refresh() }, [refresh])

  const create = async (payload: CreateBudgetPayload) => {
    await createBudget(payload)
    await refresh()
  }

  const update = async (id: number, amount: string) => {
    await updateBudget(id, { amount })
    await refresh()
  }

  const remove = async (id: number) => {
    await deleteBudget(id)
    await refresh()
  }

  return { budgets, meta, isLoading, error, refresh, create, update, remove }
}
