import type { ApiErrorResponse } from "../type";

const API = 'http://localhost:8080/api/v1';

export async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    console.log(API);
    const response = await fetch(`${API}/${endpoint}`, {
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

    return response.json();
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