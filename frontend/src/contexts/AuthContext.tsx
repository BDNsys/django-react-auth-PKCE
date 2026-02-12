import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { User } from '../types';
import api from '../services/api';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: any) => Promise<void>;
    register: (userData: any) => Promise<void>;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const logout = useCallback(() => {
        api.logout();
        setUser(null);
    }, []);

    const fetchUser = useCallback(async () => {
        try {
            // Check if we have tokens before fetching
            const tokens = api.getTokens();
            if (!tokens) {
                setIsLoading(false);
                return;
            }

            const response = await api.getCurrentUser();
            setUser(response);
        } catch (error) {
            console.error('Failed to fetch user', error);
            logout(); // session likely invalid
        } finally {
            setIsLoading(false);
        }
    }, [logout]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const login = async (credentials: any) => {
        const response = await api.login(credentials);
        setUser(response.user);
    };

    const register = async (userData: any) => {
        const response = await api.register(userData);
        setUser(response.user);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
