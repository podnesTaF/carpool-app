import { User } from "@/models/user";
import { create } from "zustand";

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  setUser: (user: User | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
}

const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  isAdmin: false,
  setIsAdmin: (isAdmin: boolean) => set({ isAdmin }),
  setUser: (user: User | null) => set({ user: user }),
  setIsAuthenticated: (isAuthenticated: boolean) =>
    set({ isAuthenticated: isAuthenticated }),
}));

export default useAuthStore;
