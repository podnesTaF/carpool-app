"use client";

import { convertIntoAddress } from "@/api/locationApi";
import { cn } from "@/lib/utils";
import { Ride } from "@/models/ride";
//import useAuthStore from "@/store/authStore";
import { formatDate, formatLongDate, formatTime } from "@/utils/time-helpers";
import { useQuery } from "@tanstack/react-query";
import { Mailbox, Phone, Pin, UsersRound } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

const UserRideItem = ({
  ride,
  shortForm,
  rideLink,
  hidePersonalInfo,
  rideAvailable,
}: {
  ride: Ride;
  shortForm?: boolean;
  rideLink?: boolean;
  rideAvailable?: boolean;
  hidePersonalInfo?: boolean;
}) => {
  const { data } = useQuery({
    queryKey: ["convertedLocation", ride.pickupLat, ride.pickupLong],
    queryFn: () =>
      convertIntoAddress({ lat: ride.pickupLat, lng: ride.pickupLong }),
    enabled: !!ride.pickupLat && !!ride.pickupLong,
  });

  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleSendEmail = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  return (
    <div className="flex flex-col w-full gap-2 pb-3 transition-none border-b border-b-gray-400/40">
      <div className="flex gap-6 items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="font-bold text-primary-orange text-xl">
            {ride.pickupSequence}
          </p>
          <Avatar className="w-12 h-12">
            <AvatarImage src={ride.user.avatarUrl as string} />
            <AvatarFallback>{ride.user.username?.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-2">
            <p className="text-base font-semibold text-secondary-light">
              {ride.user.username}
            </p>
            {!hidePersonalInfo && (
              <div className="flex items-center gap-2">
                <Pin className="text-primary-orange" size={20} />
                <Link
                  href={`https://www.google.com/maps?q=${ride.pickupLat},${ride.pickupLong}`}
                  target="_black"
                >
                  <p className="text-primary-orange font-medium text-sm">
                    {data?.address}
                  </p>
                </Link>
              </div>
            )}
            {rideLink && (
              <div className="flex items-center gap-2">
                <UsersRound className="text-secondary-light" />
                <p>
                  {ride.registeredCount || 0} /{" "}
                  {ride.vehicle?.maxPassengers || 0}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      {!shortForm && (
        <div className="flex justify-between gap-12">
          <div className="flex flex-col gap-2">
            <p className="font-semibold">
              {ride.driver ? "Trip Start Date and Time" : "Start Time"}
            </p>
            <p className="font-medium text-secondary-medium ">
              {ride.startDateTime
                ? formatLongDate(ride.startDateTime, true)
                : formatTime(ride.startDateTime)}
            </p>
          </div>
          {!hidePersonalInfo && (
            <div className="flex flex-col gap-2">
              <p className="font-semibold text-center">Contact</p>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() =>
                        handleCopyToClipboard(ride.user.phone ?? "")
                      }
                      className="rounded-full h-12 w-12"
                    >
                      <Phone className="text-white" size={24} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-secondary-light">
                    <p>
                      {copied
                        ? "copied!"
                        : "Copy phone number to the clipboard"}
                    </p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => handleSendEmail(ride.user.email)}
                      className="rounded-full h-12 w-12"
                    >
                      <Mailbox className="text-white" size={24} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-secondary-light">
                    <p>Send email to {ride.user.email}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          )}
        </div>
      )}
      {rideLink &&
        ((ride.registeredCount || 0) < (ride.vehicle?.maxPassengers || 0) ? (
          rideAvailable ? (
            <Link href={`/carpools/${ride.id}`}>
              <Button
                className={cn(
                  "rounded-full py-1 w-full px-4",
                  (ride.registeredCount || 0) <
                    (ride.vehicle?.maxPassengers || 0)
                    ? "bg-primary-orange hover:bg-primary-orange/90"
                    : "bg-secondary-light"
                )}
              >
                View Ride
              </Button>
            </Link>
          ) : (
            <Button
              className={cn("rounded-full py-1 w-full px-4 bg-secondary-light")}
            >
              Ride opens on {formatDate(ride.event.registerDeadline, true)}
            </Button>
          )
        ) : (
          <Button
            disabled
            className={cn(
              "rounded-full py-1 w-full px-4",
              "bg-secondary-light"
            )}
          >
            The Ride is Full
          </Button>
        ))}
    </div>
  );
};

export default UserRideItem;
