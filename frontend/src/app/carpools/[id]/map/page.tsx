"use client";

import { getRideById } from "@/api/rides";
import RidesMap from "@/components/map/RidesMap";
import { Button } from "@/components/ui/button";
import { generateGoogleMapsRouteUrl } from "@/utils/route-helpers";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";

const CarpoolMap = () => {
  const { id } = useParams<{ id: string }>();
  const { data: carpool } = useQuery({
    queryKey: ["carpool", id],
    queryFn: () => getRideById(+id!),
    enabled: !!id,
    retry: 0,
  });

  const rides = useMemo(() => {
    return (
      carpool?.passengerRides?.reduce(
        (acc, curr) => [...acc, curr],
        [carpool]
      ) || []
    );
  }, [carpool]);

  return (
    <div className="lg:pl-16 w-full h-full">
      {carpool && (
        <RidesMap
          rides={rides}
          rideEvent={carpool.event}
          actions={
            <div className="absolute bottom-4 right-4 flex items-center gap-4">
              <Link href={`/carpools/${carpool.id}`}>
                <Button className="bg-primary rounded-full text-white font-semibold px-4 py-6">
                  Back to carpool
                </Button>
              </Link>
              <Link
                target="_blank"
                href={`${generateGoogleMapsRouteUrl(carpool)}`}
                className="w-full"
              >
                <Button className="bg-primary-orange rounded-full text-white font-semibold px-4 py-6">
                  Open route in google maps
                </Button>
              </Link>
            </div>
          }
        />
      )}
    </div>
  );
};

export default CarpoolMap;
