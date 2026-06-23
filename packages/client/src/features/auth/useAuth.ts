import { useQuery, useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { User } from '@us-always/shared';

export function useAuth() {
  const { user, isAuthenticated, accessToken, setUser, logout } = useAuthStore();

  const { data, isLoading, error } = useQuery<User>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const { data } = await api.get<User>('/auth/me');
      return data;
    },
    enabled: isAuthenticated && !!accessToken,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (data) {
      // Keep existing tokens, just refresh user data
      const { accessToken, refreshToken } = useAuthStore.getState();
      setUser(data, accessToken!, refreshToken!);
    }
  }, [data, setUser]);

  useEffect(() => {
    if (error) logout();
  }, [error, logout]);

  return { user, isAuthenticated, isLoading, logout };
}