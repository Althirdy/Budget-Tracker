export interface User {
    id: number;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    role: number;
    roleName: string;
}

export interface LoginSuccessResponse {
    accessToken: string;
    accessTokenExpiresAt: string;
    user: User;
}

export interface MeResponse {
    user: User;
}
