import { getRideById } from "@/api/rides";
import { prefetchQueries } from "@/utils/fetchUtils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import React from "react";

const Layout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) => {
  const p = await params;
  const queryClient = await prefetchQueries([
    { key: ["ride", p.id], fetchFn: () => getRideById(+p!.id) },
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="lg:ml-28 lg:mr-14">
        <div className="flex flex-col pt-24 items-center justify-center">
          {children}
        </div>
      </div>
    </HydrationBoundary>
  );
};

export default Layout;
