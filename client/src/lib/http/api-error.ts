export class ApiError extends Error {
  constructor(message: string, public readonly fieldErrors: Record<string, string[]> = {}) {
    super(message)
    this.name = "ApiError"
  }
}

export function firstErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    const fieldMessage = Object.values(error.fieldErrors).flat().find(Boolean)
    return fieldMessage ?? error.message
  }

  return error instanceof Error ? error.message : fallback
}
