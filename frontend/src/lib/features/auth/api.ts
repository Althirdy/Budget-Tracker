import { apiFetch } from "$lib/shared/api/client";
import { loginSchema } from "./schema";
import type { LoginSuccessResponse } from "./type";
import type { z } from "zod";

type LoginRequest = z.infer<typeof loginSchema>;

export async function loginAccount(data: LoginRequest) {
    const validated = loginSchema.parse(data);

    return apiFetch<LoginSuccessResponse>("auth/login", {
        method: "POST",
        body: JSON.stringify(validated),
    });
}