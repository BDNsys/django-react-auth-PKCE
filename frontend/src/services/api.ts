import type { AuthTokens, AuthResponse, RegisterResponse, ApiError, User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

class ApiService {
    private tokens: AuthTokens | null = null;
    private refreshInProgress: Promise<string | null> | null = null;

    constructor() {
        const storedTokens = localStorage.getItem('auth_tokens');
        if (storedTokens) {
            try {
                this.tokens = JSON.parse(storedTokens);
            } catch (e) {
                console.error('Failed to parse stored tokens', e);
            }
        }
    }

    setTokens(tokens: AuthTokens | null) {
        this.tokens = tokens;
        if (tokens) {
            localStorage.setItem('auth_tokens', JSON.stringify(tokens));
        } else {
            localStorage.removeItem('auth_tokens');
        }
    }

    getTokens(): AuthTokens | null {
        return this.tokens;
    }

    private async refreshToken(): Promise<string | null> {
        if (this.refreshInProgress) return this.refreshInProgress;

        if (!this.tokens?.refresh) return null;

        this.refreshInProgress = (async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/token/refresh/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refresh: this.tokens?.refresh }),
                });

                if (!response.ok) throw new Error('Refresh failed');

                const data = await response.json();
                const newTokens = { ...this.tokens!, access: data.access };
                this.setTokens(newTokens);
                return data.access;
            } catch (error) {
                this.setTokens(null);
                return null;
            } finally {
                this.refreshInProgress = null;
            }
        })();

        return this.refreshInProgress;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        let headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string>),
        };

        if (this.tokens?.access) {
            headers['Authorization'] = `Bearer ${this.tokens.access}`;
        }

        let response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        // Auto-refresh if 401 Unauthorized
        if (response.status === 401 && this.tokens?.refresh) {
            const newAccessToken = await this.refreshToken();
            if (newAccessToken) {
                headers['Authorization'] = `Bearer ${newAccessToken}`;
                response = await fetch(`${API_BASE_URL}${endpoint}`, {
                    ...options,
                    headers,
                });
            }
        }

        const data = await response.json();

        if (!response.ok) {
            const error: ApiError = data;
            throw error;
        }

        return data as T;
    }

    async login(credentials: any): Promise<AuthResponse> {
        const data = await this.request<AuthResponse>('/login/', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
        this.setTokens({ access: data.access, refresh: data.refresh });
        return data;
    }

    async register(userData: any): Promise<RegisterResponse> {
        const data = await this.request<RegisterResponse>('/users/', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
        // Remove direct token setting here if the backend doesn't return tokens on register immediately
        // But based on views.py, it does return tokens.
        if (data.access && data.refresh) {
            this.setTokens({ access: data.access, refresh: data.refresh });
        }
        return data;
    }

    async googleLogin(code: string, codeVerifier: string): Promise<AuthResponse> {
        const data = await this.request<AuthResponse>('/google/login/', {
            method: 'POST',
            body: JSON.stringify({ code, code_verifier: codeVerifier }),
        });
        if (data.access && data.refresh) {
            this.setTokens({ access: data.access, refresh: data.refresh });
        }
        return data;
    }

    async getCurrentUser(): Promise<User> {
        return this.request<User>('/users/me/');
    }

    async get<T>(endpoint: string): Promise<{ data?: T; error?: string }> {
        try {
            const data = await this.request<T>(endpoint, { method: 'GET' });
            return { data };
        } catch (error: any) {
            return { error: error.detail || error.message || 'An error occurred' };
        }
    }

    async post<T>(endpoint: string, body: any): Promise<{ data?: T; error?: string }> {
        try {
            const data = await this.request<T>(endpoint, {
                method: 'POST',
                body: JSON.stringify(body),
            });
            return { data };
        } catch (error: any) {
            return { error: error.detail || error.message || 'An error occurred' };
        }
    }

    async put<T>(endpoint: string, body: any): Promise<{ data?: T; error?: string }> {
        try {
            const data = await this.request<T>(endpoint, {
                method: 'PUT',
                body: JSON.stringify(body),
            });
            return { data };
        } catch (error: any) {
            return { error: error.detail || error.message || 'An error occurred' };
        }
    }

    async delete<T>(endpoint: string): Promise<{ data?: T; error?: string }> {
        try {
            const data = await this.request<T>(endpoint, { method: 'DELETE' });
            return { data };
        } catch (error: any) {
            return { error: error.detail || error.message || 'An error occurred' };
        }
    }

    logout() {
        this.setTokens(null);
    }
}

export const api = new ApiService();
export default api;
