"use client";

import { getUsersRides } from "@/api/rides";
import EmptyListPlaceholder from "@/components/other/EmptyListPlaceholder";
import RideItem from "@/components/ride/RideItem";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useAuthStore from "@/store/authStore";
import { isPassed } from "@/utils/time-helpers";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

const MyCarpool = () => {
  const { user } = useAuthStore();
  const [type, setType] = useState<undefined | "driver" | "passenger">();
  const { data: rides } = useQuery({
    queryKey: ["userRides", user?.id, type],
    queryFn: () => getUsersRides(type),
    enabled: !!user?.id,
  });

  const sortedRides = useMemo(() => {
    if (!Array.isArray(rides)) return [];
    return rides
      .slice()
      .sort(
        (a, b) =>
          new Date(a.event.startDateTime ?? 0).getTime() -
          new Date(b.event.startDateTime ?? 0).getTime()
      )
      .filter((r) => !isPassed(r.event.startDateTime));
  }, [rides]);

  const pastRides = useMemo(() => {
    return rides?.filter((r) => isPassed(r.event.startDateTime));
  }, [rides]);

  return (
    <div className="lg:ml-28 lg:mr-14 pt-24">
      <div className="flex flex-col items-center justify-center w-full h-full px-2 lg:px-0">
        <div className="flex flex-col w-full h-10 lg:h-20 rounded-t-2xl bg-gradient-to-r from-primary to-secondary-medium"></div>
        <div className="flex flex-col w-full bg-gray-100 rounded-b-2xl lg:px-5">
          <div className="p-5 flex flex-col">
            <div className="flex justify-between items-center gap-5 mb-5">
              <p className="text-xl font-semibold text-black lg:text-3xl">
                My Carpools
              </p>
            </div>
            <Tabs
              defaultValue="all"
              className="w-full flex flex-col justify-center items-center"
              onValueChange={(v) => {
                setType(v as any);
              }}
            >
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="driver">As Driver</TabsTrigger>
                <TabsTrigger value="passenger">As Passenger</TabsTrigger>
                <TabsTrigger value="past">Past</TabsTrigger>
              </TabsList>
              <div className="w-full max-w-[700px] mx-auto flex flex-col gap-3">
                {sortedRides?.length ? (
                  <>
                    <TabsContent value="all">
                      {sortedRides.map((r) => (
                        <RideItem ride={r} key={r.id} />
                      ))}
                    </TabsContent>
                    <TabsContent value="driver">
                      {sortedRides
                        .filter((r) => r.driver)
                        .map((r) => (
                          <RideItem ride={r} key={r.id} />
                        ))}
                    </TabsContent>
                    <TabsContent value="passenger">
                      {sortedRides
                        .filter((r) => !r.driver)
                        .map((r) => (
                          <RideItem ride={r} key={r.id} />
                        ))}
                    </TabsContent>
                    <TabsContent value="past">
                      {pastRides && pastRides.length > 0 ? (
                        pastRides.map((r) => <RideItem ride={r} key={r.id} />)
                      ) : (
                        <EmptyListPlaceholder title="No carpools by selected category" />
                      )}
                    </TabsContent>
                  </>
                ) : (
                  <EmptyListPlaceholder title="No carpools by selected category" />
                )}
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyCarpool;
