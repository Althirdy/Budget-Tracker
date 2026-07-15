import { get, writable } from "svelte/store";
import { API, ApiError } from "$lib/shared/api/client";
import { loginAccount, logoutAccount, refreshAccount } from "./api";
import type { User } from "./type";

type AuthState = {
    status: "idle" | "loading" | "authenticated" | "guest";
    accessToken: string | null;
    user: User | null;
};

const initialState: AuthState = { status: "idle", accessToken: null, user: null };
export const auth = writable<AuthState>(initialState);

let initialization: Promise<AuthState> | null = null;
let refreshRequest: Promise<boolean> | null = null;

function authenticatedState(response: { accessToken: string; user: User }): AuthState {
    return { status: "authenticated", accessToken: response.accessToken, user: response.user };
}

export async function initializeAuth(): Promise<AuthState> {
    if (initialization) return initialization;
    const current = get(auth);
    if (current.status !== "idle" && current.status !== "loading") return current;

    auth.update((state) => ({ ...state, status: "loading" }));
    initialization = refreshAccount()
        .then((response) => {
            const state = authenticatedState(response);
            auth.set(state);
            return state;
        })
        .catch(() => {
            const state: AuthState = { ...initialState, status: "guest" };
            auth.set(state);
            return state;
        })
        .finally(() => { initialization = null; });

    return initialization;
}

export async function signIn(login: string, password: string): Promise<void> {
    const response = await loginAccount({ login, password });
    auth.set(authenticatedState(response));
}

export async function signOut(): Promise<void> {
    try {
        await logoutAccount();
    } finally {
        auth.set({ ...initialState, status: "guest" });
    }
}

async function renewAccess(): Promise<boolean> {
    if (refreshRequest) return refreshRequest;
    refreshRequest = refreshAccount()
        .then((response) => {
            auth.set(authenticatedState(response));
            return true;
        })
        .catch(() => {
            auth.set({ ...initialState, status: "guest" });
            return false;
        })
        .finally(() => { refreshRequest = null; });
    return refreshRequest;
}

export async function authFetch<T>(endpoint: string, options: RequestInit = {}, retry = true): Promise<T> {
    const token = get(auth).accessToken;
    const response = await fetch(`${API}/${endpoint}`, {
        ...options,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers
        }
    });

    if (response.status === 401 && retry && await renewAccess()) {
        return authFetch<T>(endpoint, options, false);
    }

    const data = await response.json().catch(() => null);
    if (!response.ok) {
        throw new ApiError(data?.message ?? `HTTP ${response.status}`, response.status, data);
    }
    return data as T;
}
