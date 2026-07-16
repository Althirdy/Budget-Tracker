import { apiFetch } from "$lib/shared/api/client";
import { loginSchema } from "./schema";
import type { LoginSuccessResponse, MeResponse } from "./type";
import type { z } from "zod";

type LoginRequest = z.infer<typeof loginSchema>;

export async function loginAccount(data: LoginRequest) {
    const validated = loginSchema.parse(data);

    return apiFetch<LoginSuccessResponse>("auth/login", {
        method: "POST",
        body: JSON.stringify(validated),
    });
}

export function refreshAccount() {
    return apiFetch<LoginSuccessResponse>("auth/refresh", { method: "POST" });
}

export function logoutAccount() {
    return apiFetch<{ success: boolean }>("auth/logout", { method: "POST" });
}

export function fetchCurrentUser(accessToken: string) {
    return apiFetch<MeResponse>("auth/me", {
        headers: { Authorization: `Bearer ${accessToken}` }
    });
}
