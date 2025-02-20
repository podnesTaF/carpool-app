// components/AdminGuard.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isUserAdmin } from "@/api/backendEndpoints";

interface AdminGuardProps {
  userSub: string;
  children: React.ReactNode;
}

export default function AdminGuard({ userSub, children }: AdminGuardProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAdmin() {
      try {
        const result = await isUserAdmin(userSub);
        if (!result) {
          // Redirect if not admin
          router.replace("/events");
        } else {
          setAuthorized(true);
        }
      } catch (error) {
        console.error("Error checking admin status", error);
        // Optionally handle error, e.g. setAuthorized(false)
        router.replace("/events");
      }
    }
    checkAdmin();
  }, [userSub, router]);

  // While waiting for admin check, you can render a loading state
  if (authorized === null) {
    return <p>Loading...</p>;
  }

  return <>{children}</>;
}
