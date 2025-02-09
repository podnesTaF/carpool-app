import { User } from "@/models/user";
import { create } from "zustand";

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  setUser: (user: User | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
}

const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  setUser: (user: User | null) => set({ user: user }),
  setIsAuthenticated: (isAuthenticated: boolean) =>
    set({ isAuthenticated: isAuthenticated }),
}));

export default useAuthStore;