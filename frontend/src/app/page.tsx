"use client";

import AppLoadingProgress from "@/components/other/AppLoadingProgress";
import { Button } from "@/components/ui/button";
import { useUser } from "@auth0/nextjs-auth0";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import useStore from "../store/store"; // Import your Zustand store

export default function Home() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  const { redirecting, setRedirecting, resetProgress } = useStore();

  useEffect(() => {
    if (user && !isLoading) {
      setRedirecting(true);
    } else {
      resetProgress();
      setRedirecting(false);
    }
  }, [user, isLoading, setRedirecting, resetProgress]);

  if (isLoading || (redirecting && !user)) {
    return <div></div>;
  }

  if (redirecting && user) {
    return <AppLoadingProgress onComplete={() => router.replace("/events")} />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center lg:p-6">
      {/* Logo */}
      <Image
        src="/logo.png"
        priority={true}
        alt="Axxes Logo"
        width={250}
        height={200}
      />

      {/* Main Content */}
      <div className="flex flex-col md:flex-row justify-center items-center w-full max-w-6xl p-4 md:p-12">
        {/* Left Image */}
        <div className="relative w-full md:w-1/2 rounded-lg overflow-hidden mb-6 md:mb-0">
          <Image
            src="/Carpool1.png"
            alt="Carpool Image"
            layout="responsive"
            width={700}
            height={400}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Section */}
        <div className="flex flex-col justify-center items-center md:items-start w-full md:w-1/2">
          <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-800 mb-6 text-center md:text-left">
            Welcome to Axxes Carpooling!
          </h1>

          {/* Button for login */}
          <a href="/auth/login">
            <Button className="flex gap-4 items-center justify-center mb-6 text-white py-3 px-6 transition duration-300 ease-in-out shadow-lg">
              <Icon icon="circum:login" width={"24"} height={"24"} />
              Login / Sign Up
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
