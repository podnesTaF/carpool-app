import { getEvents } from "@/api/event";
import WithPageAuthRequired from "@/components/hok/withPageAuthRequired";
import { prefetchQueries } from "@/utils/fetchUtils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import React from "react";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const queryClient = await prefetchQueries([
    { key: ["events"], fetchFn: getEvents },
  ]);
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
};
export default WithPageAuthRequired(Layout);
