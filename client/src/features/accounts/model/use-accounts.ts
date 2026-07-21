import { useCallback, useEffect, useState } from "react"

import { archiveAccount, createAccount, listAccounts, restoreAccount, updateAccount } from "@/features/accounts/api/accounts-api"
import type { Account, AccountFilters, AccountPayload } from "@/features/accounts/model/account-types"

export function useAccounts(filters: AccountFilters) {
  const { status, type, search } = filters
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true); setError(null)
    try { setAccounts(await listAccounts({ status, type, search })) }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to load accounts.") }
    finally { setIsLoading(false) }
  }, [search, status, type])

  useEffect(() => { void refresh() }, [refresh])

  const create = async (payload: AccountPayload) => { await createAccount(payload); await refresh() }
  const update = async (id: number, payload: AccountPayload) => { await updateAccount(id, payload); await refresh() }
  const archive = async (id: number) => { await archiveAccount(id); await refresh() }
  const restore = async (id: number) => { await restoreAccount(id); await refresh() }

  return { accounts, isLoading, error, refresh, create, update, archive, restore }
}
