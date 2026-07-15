import type { ApiErrorResponse } from "../type";
import { env } from "$env/dynamic/public";

export const API = (env.PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1").replace(/\/$/, "");

export async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const response = await fetch(`${API}/${endpoint}`, {
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...options.headers
        },
        ...options
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        const error = data as ApiErrorResponse;

        throw new ApiError(
            error?.message ?? `HTTP ${response.status}`,
            response.status,
            error
        );
    }

    return data as T;
}

export class ApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public data?: unknown
    ) {
        super(message);
        this.name = "ApiError";
    }
}
