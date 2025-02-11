"use client";

import { Button } from "@/components/ui/button";
import useAuthStore from "@/store/authStore";
import useStore from "@/store/store";
import Link from "next/link";
import { useState } from "react";

export default function LogoutModal() {
  const isLogoutModalOpen = useStore((state) => state.isLogoutModalOpen);
  const closeLogoutModal = useStore((state) => state.closeLogoutModal);
  const setUser = useAuthStore((state) => state.setUser);
  const setIsAuthenticated = useAuthStore((state) => state.setIsAuthenticated);

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  if (!isLogoutModalOpen) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-4 rounded-lg shadow-lg mx-4">
        {isLoggingOut ? (
          <h1 className="text-xl font-bold">Logging out...</h1>
        ) : (
          <>
            <h1 className="text-lg font-bold text-center">
              Are you sure you want to logout?
            </h1>
            <div className="flex gap-10 mt-4 justify-center items-center">
              <Link
                href="/auth/logout"
                onClick={(e) => {
                  e.preventDefault();
                  setIsLoggingOut(true);
                  const logoutURL = `https://dev-o1f855c2je0c61ae.us.auth0.com/v2/logout?client_id=StYZYILNMyXXnqiC7fuRGJZjC8n0Rw4f&returnTo=${encodeURIComponent(
                    window.location.origin + "/auth/logout"
                  )}`;

                  // update state
                  setIsAuthenticated(false);
                  setUser(null);

                  window.location.href = logoutURL; // Redirect to Auth0 logout
                }}
              >
                <Button className="bg-primary-orange">Logout</Button>
              </Link>
              <Button onClick={() => closeLogoutModal()} variant="secondary">
                Cancel
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
