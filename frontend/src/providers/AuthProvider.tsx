// components/AuthProvider.tsx
import { getUserByAuth0Sub, isUserAdmin } from "@/api/backendEndpoints";
import useAuthStore from "@/store/authStore";
import { useUser } from "@auth0/nextjs-auth0";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const auth0User = useUser();
  const { setUser, setIsAdmin } = useAuthStore();

  const auth0Sub = auth0User?.user?.sub;

  const { data: fetchedUser, isSuccess: userSuccess } = useQuery({
    queryKey: ["getUserByAuth0Sub", { auth0Sub }],
    queryFn: () => getUserByAuth0Sub(auth0Sub!),
    enabled: !!auth0Sub,
    retry: 2,
  });

  const { data: adminStatus, isSuccess: adminSuccess } = useQuery({
    queryKey: ["getAdminStatus", { auth0Sub }],
    queryFn: () => isUserAdmin(auth0Sub!),
    enabled: !!auth0Sub,
    retry: 2,
  });

  useEffect(() => {
    if (userSuccess && fetchedUser) {
      setUser(fetchedUser);
    }
  }, [userSuccess, fetchedUser, setUser]);

  useEffect(() => {
    if (adminSuccess && adminStatus) {
      setIsAdmin(adminStatus);
    }
  }, [adminSuccess, adminStatus, setIsAdmin]);

  return <>{children}</>;
};
