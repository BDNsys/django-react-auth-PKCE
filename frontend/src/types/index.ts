export interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    date_joined: string;
}

export interface AuthTokens {
    access: string;
    refresh: string;
}

export interface AuthResponse {
    user: User;
    access: string;
    refresh: string;
}

export interface RegisterResponse {
    user: User;
    access: string;
    refresh: string;
}

export interface ApiError {
    detail?: string;
    [key: string]: any;
}
