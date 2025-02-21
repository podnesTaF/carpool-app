import Navbar from "@/components/nav/navbar";
import { auth0 } from "@/lib/auth0";
import AdminGuard from "@/providers/AdminGuard";
import { redirect } from "next/navigation";
import React from "react";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth0.getSession();
  if (!session) {
    redirect("/");
  }
  const userSub = session.user.sub;

  return (
    <AdminGuard userSub={userSub}>
      <Navbar />
      {children}
    </AdminGuard>
  );
};

export default Layout;
