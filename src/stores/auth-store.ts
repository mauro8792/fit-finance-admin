"use client";

import { create } from "zustand";

interface AdminUser {
  id: number;
  email: string;
  fullName: string;
  roles: { id: number; name: string }[];
}

interface AuthState {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  setAuth: (user: AdminUser, token: string) => void;
  logout: () => void;
  loadFromStorage: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, token) => {
    localStorage.setItem("admin_token", token);
    localStorage.setItem("admin_user", JSON.stringify(user));
    set({ user, token, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    window.location.href = "/auth/login";
  },

  loadFromStorage: () => {
    if (typeof window === "undefined") {
      set({ isLoading: false });
      return;
    }
    const token = localStorage.getItem("admin_token");
    const userStr = localStorage.getItem("admin_user");
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        // Verify user has admin/super-user role
        const isAdmin = user.roles?.some(
          (r: { name: string }) =>
            r.name === "admin" || r.name === "super-admin" || r.name === "super-user"
        );
        if (isAdmin) {
          set({ user, token, isAuthenticated: true, isLoading: false });
          return;
        }
      } catch {
        // invalid JSON
      }
    }
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  setLoading: (loading) => set({ isLoading: loading }),
}));
