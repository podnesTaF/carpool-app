"use client";
import { getEvent } from "@/api/event";
import DriverList from "@/components/events/DriverList";
import Navbar from "@/components/nav/navbar";
import PeopleAvatarList from "@/components/other/PeopleAvatarList";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import useAuthStore from "@/store/authStore"; // Import the auth store to get the current user
import { formatDate } from "@/utils/time-helpers";
import { useQuery } from "@tanstack/react-query";
import { Pin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

const EventDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuthStore(); // Get the current user from the auth store
  const {
    data: event,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["event", id as any],
    queryFn: () => getEvent(+id!),
    enabled: !!id,
  });

  const registeredRide = event?.rides?.find(
    (ride) => ride.user.id === user?.id
  );

  // Render error state
  if (isError) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-red-600">
          Failed to load event details. Please try again later.
        </p>
      </div>
    );
  }

  // Main event details
  return (
    <div>
      <Navbar />
      <div className="lg:ml-28 lg:mr-14">
        <div className="flex flex-col pt-24 items-center justify-center">
          <div className="flex flex-col gap-6 w-full px-4 mb-80">
            {!event || isLoading ? (
              <Skeleton className="max-w-4xl lg:mx-auto rounded-xl w-full h-96" />
            ) : (
              <div className="max-w-4xl lg:mx-auto rounded-xl w-full relative">
                <Link href={`/events`} className="absolute left-4 top-4 z-10">
                  <Button>To All Events</Button>
                </Link>
                <Image
                  src={event.bannerUrl || "/car-event 1.png"}
                  alt="event banner"
                  width={800}
                  height={400}
                  className="w-full top-0 left-0 h-64 md:h-96 rounded-xl absolute object-cover z-0"
                />
                <div className="max-w-3xl bg-white shadow-lg p-5 rounded-xl z-10 relative mx-auto mt-40 md:mt-60 flex flex-col gap-1">
                  <h3>{event.title}</h3>
                  <div className="flex items-center gap-2">
                    <Pin size={16} className="text-primary-orange" />{" "}
                    <p className="text-primary-orange font-semibold">
                      {event.address}
                    </p>
                  </div>
                  <div className="flex justify-between gap-6 items-center">
                    <p className="text-secondary-medium font-medium">
                      {formatDate(event.startDateTime, true)}
                    </p>
                  </div>
                  <div className="flex flex-col md:flex-row gap-2 items-center justify-between mt-3">
                    {event && event.rides && (
                      <PeopleAvatarList
                        people={event.rides.map((r) => r.user)}
                        displayCount={3}
                        size={40}
                        text="Participants"
                      />
                    )}
                    <Link href={`/events/${event.id}/map`}>
                      <Button variant={"link"}>View On Map</Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
            <div className="my-6 lg:my-12 max-w-3xl lg:mx-auto w-full">
              <div>
                <h3 className="font-bold text-primary-dark text-xl mb-2">
                  About
                </h3>
                {event?.description ? (
                  <p className="text-sm md:text-base text-secondary">
                    {event?.description}
                  </p>
                ) : (
                  <Skeleton className="w-full h-32" />
                )}
              </div>
              <div className="my-4">
                {event ? (
                  <DriverList
                    drivers={event.rides?.filter((r) => r.driver) || []}
                  />
                ) : (
                  <Skeleton className="w-full h-20" />
                )}
              </div>
              <div className="flex fixed bottom-4 gap-2 left-4 right-4 md:left-auto md:right-auto max-w-3xl md:w-full">
                {registeredRide ? (
                  <div className="w-full">
                    <Link href={"/carpools/" + registeredRide.id}>
                      <Button
                        className={`w-full rounded-full text-white font-semibold px-4 py-6 ${
                          registeredRide.driver
                            ? "bg-primary-orange"
                            : "bg-teal-900"
                        } pointer-events-none`}
                      >
                        View My Ride
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <>
                    <Link
                      href={`/events/${event?.id}/register/driver`}
                      className="w-full"
                    >
                      <Button className="bg-primary-orange w-full rounded-full text-white font-semibold px-4 py-6">
                        Become a Driver
                      </Button>
                    </Link>
                    <Link
                      href={`/events/${event?.id}/register/passenger`}
                      className="w-full"
                    >
                      <Button className="bg-secondary w-full rounded-full text-white font-semibold px-4 py-6">
                        Request a Ride
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
