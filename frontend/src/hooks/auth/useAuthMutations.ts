import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { queryKeys } from '../../lib/queryKeys';
import type { AuthResponse, RegisterResponse } from '../../types';

export const useLogin = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (credentials: any) => api.login(credentials),
        onSuccess: (data: AuthResponse) => {
            queryClient.setQueryData(queryKeys.auth.user(), data.user);
        },
    });
};

export const useRegister = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userData: any) => api.register(userData),
        onSuccess: (data: RegisterResponse) => {
            queryClient.setQueryData(queryKeys.auth.user(), data.user);
        },
    });
};
