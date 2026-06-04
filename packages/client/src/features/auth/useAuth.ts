import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { User } from '@us-always/shared';

export function useAuth() {
  const { user, isAuthenticated, setUser, logout } = useAuthStore();

  const { data, isLoading, error } = useQuery<User>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const { data } = await api.get<User>('/auth/me');
      return data;
    },
    enabled: isAuthenticated,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (data) setUser(data);
  }, [data, setUser]);

  useEffect(() => {
    if (error) logout();
  }, [error, logout]);

  return { user, isAuthenticated, isLoading, logout };
}
