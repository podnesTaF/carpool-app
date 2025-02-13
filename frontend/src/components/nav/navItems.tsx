import { getAdminStatus } from "@/api/auth0";
import useStore from "@/store/store";
import { useUser } from "@auth0/nextjs-auth0";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

const navLinks = [
  { href: "/events", icon: "uil:calendar", label: "Events" },
  { href: "/carpools", icon: "mdi:carpool-lane", label: "Carpools" },
  { href: "/cars", icon: "mdi:car", label: "Vehicles" },
  { href: "/profile", icon: "gg:profile", label: "Profile" },
  {
    href: "/admin",
    icon: "mdi:administrator-outline",
    label: "Admin",
    needsAdmin: true,
  },
];

function NavItem({
  href,
  icon,
  label,
  isActive,
}: {
  href: string;
  icon: string;
  label: string;
  isActive: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={href}
          className={
            "p-2 hover:opacity-80 hover:text-secondary text-gray-300 rounded-lg lg:rounded-none transition w-full hover:cursor-pointer"
          }
        >
          <Icon
            icon={icon}
            className={`transition-all duration-75 w-full h-full lg:w-3/4 lg:mx-auto ${
              isActive ? "text-primary-orange" : ""
            }`}
            width="20"
            height="20"
          />
        </Link>
      </TooltipTrigger>
      <TooltipContent className="bg-white bg-opacity-50 backdrop-blur-md">
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export default function NavItems() {
  const pathname = usePathname();
  const openLogoutModal = useStore((state) => state.openLogoutModal);
  const { user } = useUser(); // Fetch user data from Auth0
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    if (user) {
      getAdminStatus(user.sub as string).then((roles: { name: string }[]) => {
        setIsAdmin(
          roles.some((role: { name: string }) => role.name === "admin")
        );
      });
    }
  }, [user]);
  return (
    <>
      {navLinks.map(({ href, icon, label, needsAdmin }) =>
        !needsAdmin ? (
          <NavItem
            key={href}
            href={href}
            label={label}
            icon={icon}
            isActive={
              pathname === href ||
              (pathname.includes("admin") && href.includes("admin"))
            }
          />
        ) : (
          isAdmin && (
            <NavItem
              key={href}
              href={href}
              label={label}
              icon={icon}
              isActive={
                pathname === href ||
                (pathname.includes("admin") && href.includes("admin"))
              }
            />
          )
        )
      )}
      <div
        onClick={openLogoutModal}
        className="p-2 lg:mt-auto mt-10 hover:bg-gray-300 hover:text-secondary text-gray-500 rounded-lg lg:rounded-none transition w-full hover:cursor-pointer"
      >
        <Icon
          icon="mdi:logout"
          className="transition w-full h-full lg:w-3/4 lg:mx-auto"
          width="20"
          height="20"
        />
      </div>
    </>
  );
}
