import { create } from "zustand";
import authService from "@/api/authService";

const useAuthStore = create((set) => ({
  user: authService.getCurrentUser(),
  token: localStorage.getItem("token"),
  isAuthenticated: !!localStorage.getItem("token"),
  loading: false,
  error: null,

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const data = await authService.login(credentials);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isAuthenticated: true, loading: false });
      return data;
    } catch (error) {
      const message = error.response?.data?.error || "Erro ao fazer login";
      set({ error: message, loading: false });
      throw error;
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const data = await authService.register(userData);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isAuthenticated: true, loading: false });
      return data;
    } catch (error) {
      const message = error.response?.data?.error || "Erro ao registrar";
      set({ error: message, loading: false });
      throw error;
    }
  },

  logout: () => {
    authService.logout();
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  setUser: (user) => {
    localStorage.setItem("user", JSON.stringify(user));
    set({ user });
  },

  clearError: () => set({ error: null }),
}));

export { useAuthStore };