import { getAdminStatus } from "@/api/auth0";
import Navbar from "@/components/nav/navbar";
import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import React from "react";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth0.getSession();
  if (!session) {
    redirect("/");
  }

  const isAdmin = await getAdminStatus(session.user.sub);
  if (!isAdmin.length) {
    redirect("/events");
  }

  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

export default Layout;
