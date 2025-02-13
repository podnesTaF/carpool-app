import React, { useState, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";
import { Icon } from "@iconify/react/dist/iconify.js";
import useStore from "@/store/store";
import NotificationBlock from "../notifications/notifications";

interface NotificationButtonProps {
  pathname: string;
}

const NotificationButton: React.FC<NotificationButtonProps> = ({
  pathname,
}) => {
  const { refetchNotifications } = useStore();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkIsDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkIsDesktop();
    window.addEventListener("resize", checkIsDesktop);
    return () => window.removeEventListener("resize", checkIsDesktop);
  }, []);

  const commonContent = (
    <div>
      {refetchNotifications && (
        <div className="absolute">
          <span className="relative flex size-3">
            <span className="absolute -top-3 -left-3 inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative -top-3 -left-3 inline-flex size-3 rounded-full bg-sky-500"></span>
          </span>
        </div>
      )}
      <Icon
        icon="solar:bell-bing-outline"
        className="transition w-full h-full"
        width="24"
        height="24"
      />
    </div>
  );

  const className = `p-2 hover:bg-gray-300 lg:bg-white hover:text-secondary text-gray-500 transition cursor-pointer
    ${
      pathname === "/events" || pathname.includes("map")
        ? "rounded-full lg:rounded-xl"
        : "rounded-lg"
    }
    ${pathname === "/notifications" ? "text-primary-orange" : ""}`;

  return isDesktop ? (
    <Popover>
      <PopoverTrigger className={className}>{commonContent}</PopoverTrigger>
      <PopoverContent className="w-[400px] flex justify-center rounded-xl shadow-xl mx-auto">
        <div className="w-full">
          <NotificationBlock />
        </div>
      </PopoverContent>
    </Popover>
  ) : (
    <Link href="/notifications" className={className}>
      {commonContent}
    </Link>
  );
};

export default NotificationButton;
