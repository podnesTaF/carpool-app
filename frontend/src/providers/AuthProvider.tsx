// components/AuthProvider.tsx
import { getAdminStatus } from "@/api/auth0";
import { getUserByAuth0Sub } from "@/api/backendEndpoints";
import useAuthStore from "@/store/authStore";
import { useUser } from "@auth0/nextjs-auth0";
import { useEffect } from "react";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const user = useAuthStore((state) => state.user);
  const auth0User = useUser();
  const { setUser, setIsAdmin } = useAuthStore();

  useEffect(() => {
    if (auth0User && auth0User.user && auth0User.user.sub && !user) {
      getUserByAuth0Sub({
        queryKey: ["getUserByAuth0Sub", { auth0Sub: auth0User.user.sub }],
      }).then((fetchedUser) => {
        if (fetchedUser) {
          setUser(fetchedUser);
        }
      });
      getAdminStatus(auth0User.user.sub).then((data) =>
        setIsAdmin(data.some((r) => r.name === "admin"))
      );
    }
  }, [auth0User, setUser, user, setIsAdmin]);

  return <>{children}</>;
};
