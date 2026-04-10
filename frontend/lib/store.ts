import { create } from 'zustand';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'owner' | 'admin';
  phone?: string;
  favorites?: string[];
  createdAt?: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setAuth:   (user: User, token: string) => void;
  clearAuth: () => void;
  setLoading:(v: boolean) => void;
  initAuth:  () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user:      null,
  token:     null,
  isLoading: true,

  setAuth: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gbrentals_token', token);
      localStorage.setItem('gbrentals_user',  JSON.stringify(user));
    }
    set({ user, token, isLoading: false });
  },

  clearAuth: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gbrentals_token');
      localStorage.removeItem('gbrentals_user');
    }
    set({ user: null, token: null, isLoading: false });
  },

  setLoading: (v) => set({ isLoading: v }),

  initAuth: () => {
    if (typeof window !== 'undefined') {
      const token   = localStorage.getItem('gbrentals_token');
      const userStr = localStorage.getItem('gbrentals_user');
      if (token && userStr) {
        try {
          set({ user: JSON.parse(userStr), token, isLoading: false });
        } catch {
          localStorage.removeItem('gbrentals_token');
          localStorage.removeItem('gbrentals_user');
          set({ isLoading: false });
        }
      } else {
        set({ isLoading: false });
      }
    }
  },
}));
