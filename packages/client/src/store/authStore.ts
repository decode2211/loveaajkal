import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@us-always/shared';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  setUser: (user: User, accessToken: string, refreshToken: string) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      setUser: (user, accessToken, refreshToken) =>
        set({ user, isAuthenticated: true, accessToken, refreshToken }),
      setAccessToken: (accessToken) => set({ accessToken }),
      logout: () =>
        set({ user: null, isAuthenticated: false, accessToken: null, refreshToken: null }),
    }),
    {
      name: 'us-always-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    },
  ),
);