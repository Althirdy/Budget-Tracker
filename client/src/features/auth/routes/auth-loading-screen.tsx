import { Skeleton } from "@/components/ui/skeleton"

export function AuthLoadingScreen() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-sm space-y-4" aria-label="Loading session">
        <Skeleton className="mx-auto size-12 rounded-full" />
        <Skeleton className="mx-auto h-6 w-40" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  )
}
