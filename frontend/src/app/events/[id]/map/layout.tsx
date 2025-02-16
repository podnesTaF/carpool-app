import { getAdminStatus } from "@/api/auth0";
import { getEventRides } from "@/api/rides";
import Navbar from "@/components/nav/navbar";
import { auth0 } from "@/lib/auth0";
import { prefetchQueries } from "@/utils/fetchUtils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import React from "react";

const Layout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const session = await auth0.getSession();
  if (!session) {
    redirect("/");
  }

  const isAdmin = await getAdminStatus(session?.user.sub);
  if (!isAdmin.length) {
    redirect(`/events/${id}`);
  }

  const queryClient = await prefetchQueries([
    { key: ["rides-map", id], fetchFn: () => getEventRides(+id) },
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-col h-screen">
        <Navbar />
        <div className="lg:pl-16 w-full h-full">{children}</div>
      </div>
    </HydrationBoundary>
  );
};

export default Layout;
