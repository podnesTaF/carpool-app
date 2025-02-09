// components/AuthProvider.tsx
import { getUserByAuth0Sub } from "@/api/backendEndpoints";
import useAuthStore from "@/store/authStore";
import { useUser } from "@auth0/nextjs-auth0";
import { useEffect } from "react";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const user = useAuthStore((state) => state.user);
  const auth0User = useUser();
  //   const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    if (auth0User && auth0User.user && auth0User.user.sub && !user) {
      getUserByAuth0Sub({
        queryKey: ["getUserByAuth0Sub", { auth0Sub: auth0User.user.sub }],
      }).then((fetchedUser) => {
        if (fetchedUser) {
          setUser(fetchedUser);
        }
      });
    }
  }, [auth0User, setUser, user]);

  return <>{children}</>;
};
