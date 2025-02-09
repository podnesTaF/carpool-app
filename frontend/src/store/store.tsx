import { create } from "zustand";

interface StoreState {
  isLogoutModalOpen: boolean;
  user: { profilePictureUrl: string | null };
  openLogoutModal: () => void;
  closeLogoutModal: () => void;
  setUserProfile: (profilePictureUrl: string) => void;
  clearUser: () => void; // Add clearUser method
  refetchNotifications: boolean;
  setRefetchNotifications: (refetchNotifications: boolean) => void;
  
  // Add redirecting and progress to store
  redirecting: boolean;
  setRedirecting: (redirecting: boolean) => void;
  progress: number;
  setProgress: (progress: number) => void;
  resetProgress: () => void; // Add resetProgress method
}

const useStore = create<StoreState>((set) => ({
  isLogoutModalOpen: false,
  user: { profilePictureUrl: null },
  openLogoutModal: () => set({ isLogoutModalOpen: true }),
  closeLogoutModal: () => set({ isLogoutModalOpen: false }),
  setUserProfile: (profilePictureUrl: string) => set({ user: { profilePictureUrl } }),
  clearUser: () => set({ user: { profilePictureUrl: null } }), // Reset user state
  refetchNotifications: false,
  setRefetchNotifications: (refetchNotifications: boolean) => set({ refetchNotifications: refetchNotifications }),
  
  // Redirecting and progress state
  redirecting: false,
  setRedirecting: (redirecting: boolean) => set({ redirecting }),
  progress: 0,
  setProgress: (progress: number) => set({ progress }),
  resetProgress: () => set({ progress: 0, redirecting: false }), // Implement resetProgress
}));

export default useStore;