import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { queryKeys } from '../../lib/queryKeys';
import type { User } from '../../types';

export const useUser = (enabled: boolean = true) => {
    return useQuery<User>({
        queryKey: queryKeys.auth.user(),
        queryFn: () => api.getCurrentUser(),
        enabled,
        staleTime: Infinity, // User data rarely changes. Invalidate manually on profile update.
        retry: false,
    });
};
