import { getNotifications } from "@/api/backendEndpoints";
import Navbar from "@/components/nav/navbar";
import { prefetchQueries } from "@/utils/fetchUtils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import React from "react";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const queryClient = await prefetchQueries([
    { key: ["notifications"], fetchFn: getNotifications },
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Navbar />
      {children}
    </HydrationBoundary>
  );
};

export default Layout;
