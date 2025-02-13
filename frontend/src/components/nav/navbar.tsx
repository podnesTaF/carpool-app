"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useAuthStore from "@/store/authStore";
import { useUser } from "@auth0/nextjs-auth0";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import NavItems from "./navItems";
import NavMenu from "./navMenu";
import NotificationButton from "./notificationButton";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user } = useUser(); // Fetch user data from Auth0
  const { user: backenduser } = useAuthStore();

  const pathname = usePathname();
  const firstNameLetter = user
    ? Array.from(user.name as string)[0]
        .toString()
        .toUpperCase() +
      Array.from(user.name as string)[1]
        .toString()
        .toUpperCase()
    : null;
  return (
    <div>
      <div className="hidden fixed left-0 lg:flex justify-between w-16 h-full z-30 ">
        <div className="w-full flex flex-col gap-2 pt-20 bg-white shadow-md">
          <NavItems />
        </div>
      </div>
      <div
        className={`fixed top-0 right-0 left-0 z-20 mx-2 lg:mx-0 ${
          pathname === "/events" || pathname.includes("map") ? "mt-2" : "mt-0"
        }`}
      >
        <div
          className={`flex justify-between items-center w-full p-2 lg:mx-auto backdrop-blur-xl ${
            pathname === "/events" || pathname.includes("map")
              ? "rounded-full shadow-lg lg:w-1/4 lg:rounded-xl bg-white bg-opacity-70 "
              : "lg:w-auto lg:mr-14 lg:ml-28 pt-4 rounded-none"
          }`}
        >
          <svg
            onClick={() => setOpen(!open)}
            className={
              "cursor-pointer m-0 p-0 w-12 h-12 transition lg:hidden" +
              (open ? " bg-[#F5F5F5]" : "") +
              (pathname === "/events" || pathname.includes("map")
                ? " rounded-full"
                : " rounded-lg")
            }
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 10 10"
            stroke="#000"
            strokeWidth=".6"
            fill="rgba(0,0,0,0)"
            strokeLinecap="round"
          >
            <path d="M2,3L5,3L8,3M2,5L8,5M2,7L5,7L8,7">
              <animate
                dur="0.2s"
                attributeName="d"
                values="M2,3L5,3L8,3M2,5L8,5M2,7L5,7L8,7;M3,3L5,5L7,3M5,5L5,5M3,7L5,5L7,7"
                fill="freeze"
                begin="start.begin"
              />
              <animate
                dur="0.2s"
                attributeName="d"
                values="M3,3L5,5L7,3M5,5L5,5M3,7L5,5L7,7;M2,3L5,3L8,3M2,5L8,5M2,7L5,7L8,7"
                fill="freeze"
                begin="reverse.begin"
              />
            </path>
            <rect width="10" height="10" stroke="none">
              <animate
                dur="2s"
                id="reverse"
                attributeName="width"
                begin="click"
              />
            </rect>
            <rect width="10" height="10" stroke="none">
              <animate
                dur="0.001s"
                id="start"
                attributeName="width"
                values="10;0"
                fill="freeze"
                begin="click"
              />
              <animate
                dur="0.001s"
                attributeName="width"
                values="0;10"
                fill="freeze"
                begin="reverse.begin"
              />
            </rect>
          </svg>
          <Link
            href={"/events"}
            className={`w-2/4 lg:w-1/5 ${
              pathname === "/events" || pathname.includes("map")
                ? "lg:w-2/5"
                : ""
            }`}
          >
            <Image src="/logo.png" alt="Axxes Logo" width={300} height={54} />
          </Link>
          <div className="flex items-center gap-2">
            <NotificationButton pathname={pathname}></NotificationButton>
            <Link
              href="/profile"
              className={
                "bg-gray-300 transition" +
                (pathname === "/events" || pathname.includes("map")
                  ? " rounded-full lg:rounded-xl"
                  : " rounded-lg")
              }
            >
              <Avatar
                className={
                  "hover:opacity-50 transition" +
                  (pathname === "/events" || pathname.includes("map")
                    ? " rounded-full lg:rounded-xl"
                    : " rounded-lg")
                }
              >
                <AvatarImage
                  src={backenduser?.avatarUrl as string}
                  className="object-cover"
                />
                <AvatarFallback
                  className={
                    "hover:opacity-50 transition" +
                    (pathname === "/events" || pathname.includes("map")
                      ? " rounded-full lg:rounded-xl"
                      : " rounded-lg")
                  }
                >
                  {firstNameLetter}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
          <NavMenu open={open} />
        </div>
      </div>
    </div>
  );
}
