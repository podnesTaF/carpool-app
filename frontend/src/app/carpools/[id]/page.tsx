"use client";

import { cancelRide, getRideById } from "@/api/rides";
import EventHeader from "@/components/events/EventHeader";
import ConfirmAlert from "@/components/other/ConfirmAlert";
import UserRideItem from "@/components/ride/UserRideItem";
import VehicleCard from "@/components/ride/VehicleCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Ride } from "@/models/ride";
import useAuthStore from "@/store/authStore";
import { generateGoogleMapsRouteUrl } from "@/utils/route-helpers";
import { isPassed } from "@/utils/time-helpers";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Navigation } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const CarpoolDetailsPage = () => {
  const router = useRouter();
  const { id } = useParams();
  const { user } = useAuthStore();
  const [myRide, setMyRide] = useState<Ride>();
  const {
    data: carpool,
    refetch,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["carpool", id],
    queryFn: () => getRideById(+id!),
    enabled: !!id,
    retry: 0,
  });

  const { mutate, isPending } = useMutation({
    mutationKey: ["remove ride", myRide?.id],
    mutationFn: () => cancelRide(myRide?.id),
    onSuccess: (message: string) => {
      toast.success(message);
      if (myRide?.driver) {
        router.push(`/events/${carpool?.event.id}`);
      } else {
        router.push(`/carpools/${carpool?.id}`);
      }
      refetch();
    },
    onError: () => {
      toast.error("error canceling ride");
    },
  });

  useEffect(() => {
    if (carpool?.user.id === user?.id) {
      setMyRide(carpool);
    } else {
      const passengerRide = carpool?.passengerRides?.find(
        (p) => p.user.id === user?.id
      );
      if (passengerRide) {
        setMyRide(passengerRide);
      }
    }
  }, [carpool, user, isPending, isFetching]);

  if (error) {
    return (
      <div className="h-screen flex justify-center items-center">
        {(error as any).response?.data}
      </div>
    );
  }

  return (
    <div className="lg:ml-28 lg:mr-14">
      <div className="flex flex-col pt-24 items-center justify-center">
        <div className="flex flex-col gap-6 w-full px-4 mb-40">
          <EventHeader event={carpool?.event} />
          <div className="max-w-4xl w-full mx-auto">
            {myRide && (
              <>
                <h4 className="font-bold mb-3">Trip map</h4>
                <div className="mb-6">
                  <Link href={`/carpools/${id}/map`} className="w-full">
                    <Button className="bg-primary-orange rounded-full text-white font-semibold px-6 py-4">
                      Open the ride&apos;s map
                    </Button>
                  </Link>
                </div>
              </>
            )}
            <h4 className="font-bold mb-3">Trip details</h4>
            <div className="flex flex-col gap-3">
              <h5 className="font-semibold">Driver</h5>
              {carpool ? (
                <UserRideItem ride={carpool} />
              ) : (
                <Skeleton className="w-full h-48" />
              )}
            </div>
            <div className="flex flex-col gap-3">
              <h5 className="font-semibold">Vehicle</h5>
              {carpool?.vehicle ? (
                <VehicleCard vehicle={carpool.vehicle} />
              ) : (
                <Skeleton className="w-full h-32" />
              )}
            </div>
            <div className="flex flex-col gap-5 py-6">
              <h5 className="font-semibold mb-2">Passengers</h5>
              {!carpool ? (
                <Skeleton className="w-full h-96" />
              ) : !carpool.passengerRides ||
                carpool.passengerRides.length < 1 ? (
                <p className="text-center text-primary-dark font-semibold">
                  No passengers yet
                </p>
              ) : (
                carpool.passengerRides
                  .sort(
                    (a, b) => (a.pickupSequence || 0) - (b.pickupSequence || 0)
                  )
                  .map((p) => (
                    <UserRideItem
                      ride={p}
                      key={p.id}
                      hidePersonalInfo={!myRide}
                    />
                  ))
              )}
            </div>
            <div className="flex flex-col gap-3 py-6">
              {carpool && myRide?.driver && (
                <div className="flex gap-2 w-full">
                  <Link
                    target="_blank"
                    href={`${generateGoogleMapsRouteUrl(carpool)}`}
                    className="w-full"
                  >
                    <Button className="bg-primary-orange w-full rounded-full text-white font-semibold px-4 py-6">
                      Open route in google maps
                    </Button>
                  </Link>
                  {!isPassed(carpool.event.startDateTime) && (
                    <ConfirmAlert
                      title={"Are you sure you want to cancel this ride?"}
                      description="This action cannot be undone. This will permanently delete your ride from our servers."
                      onConfirm={() => mutate()}
                    >
                      <Button
                        variant={"destructive"}
                        disabled={isPending}
                        className="w-full rounded-full text-white font-semibold px-4 py-6"
                      >
                        Cancel this ride
                      </Button>
                    </ConfirmAlert>
                  )}
                </div>
              )}
              {myRide && !myRide.driver && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-start">
                  <Link
                    href={`https://www.google.com/maps?q=${myRide.pickupLat},${myRide.pickupLong}`}
                    target="_blank"
                  >
                    <Button className="bg-primary-orange hover:bg-primary-orange/90 rounded-full px-8 py-6 gap-6 items-center w-full">
                      <p className="text-white font-semibold">
                        Open my pickup point on maps
                      </p>
                      <Navigation className="text-white" />
                    </Button>
                  </Link>
                  {!isPassed(carpool?.event.startDateTime) && (
                    <ConfirmAlert
                      title={"Are you sure you want to quit this ride?"}
                      description="This action cannot be undone. This will permanently delete your ride from our servers."
                      onConfirm={() => mutate()}
                    >
                      <Button
                        variant={"destructive"}
                        disabled={isPending}
                        className="rounded-full px-8 py-6 gap-6 w-full"
                      >
                        <p className="text-white font-semibold">
                          I no longer want to participate in this carpool
                        </p>
                      </Button>
                    </ConfirmAlert>
                  )}
                </div>
              )}
              {!myRide && (
                <Link
                  href={`/events/${carpool?.event.id}/register/passenger?rideId=${carpool?.id}`}
                >
                  <Button className="bg-primary-orange hover:bg-primary-orange/90 rounded-full px-8 py-6 gap-6 items-center w-full">
                    <p className="text-white font-semibold">
                      Register for a carpool
                    </p>
                    <Navigation className="text-white" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarpoolDetailsPage;
