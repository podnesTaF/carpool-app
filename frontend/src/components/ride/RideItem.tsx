import { cancelRide } from "@/api/rides"; // Make sure you have the cancelRide function
import ConfirmAlert from "@/components/other/ConfirmAlert"; // Import your existing ConfirmAlert component
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Ride } from "@/models/ride";
import { isPassed } from "@/utils/time-helpers";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useMutation, useQueryClient } from "@tanstack/react-query"; // Import useQueryClient
import { useMemo, useState } from "react";
import { toast } from "sonner"; // For displaying notifications
import EventItem from "../events/eventItem";
import DriverInfoItem from "./DriverInfoItem";
import PassengersItem from "./PassengersItem";

const RideItem = ({ ride }: { ride: Ride }) => {
  const isBeforeDeadline = useMemo(() => {
    return !isPassed(ride.event.registerDeadline);
  }, [ride]);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  // Mutation for canceling the ride
  const { mutate } = useMutation({
    mutationKey: ["cancelRide", ride.id],
    mutationFn: () => cancelRide(ride.id),
    onMutate: () => {
      // Optimistically remove the canceled ride from the local data
      queryClient.setQueryData(
        ["userRides", ride.user.id],
        (oldData: Ride[] | undefined) => {
          if (Array.isArray(oldData)) {
            return oldData.filter((r: Ride) => r.id !== ride.id); // Remove the canceled ride
          }
          return oldData;
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userRides", ride.user.id] });
      toast.success("Ride canceled successfully");
    },
    onError: () => {
      toast.error("Error canceling the ride");
    },
  });

  // Function to handle confirming cancellation
  const cancelRideHandler = () => {
    setIsLoading(true);
    mutate();
  };
  return (
    <EventItem event={ride.event}>
      <div className="flex flex-col w-full gap-2 py-4">
        {isBeforeDeadline ? (
          ride.driver ? (
            <div className="flex justify-center items-center gap-4 mx-auto w-full">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="bg-primary-orange rounded-full w-full py-2 text-center text-white">
                    You shared your car
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-primary-orange/90">
                  <p className="text-white text-sm max-w-[10vw] text-center">
                    Your ride will be visible after the event registration
                    deadline.
                  </p>
                </TooltipContent>
              </Tooltip>
              <div className="flex items-center justify-center">
                <ConfirmAlert
                  title="Are you sure you want to cancel this ride?"
                  description="This action cannot be undone. Your ride will be canceled."
                  onConfirm={cancelRideHandler} // Trigger cancel ride function
                  onCancel={() => {}} // Optionally handle cancel
                >
                  <button
                    className="text-slate-500 cursor-pointer"
                    aria-label="Cancel ride"
                    disabled={isLoading} // Disable the button while loading
                  >
                    <Icon icon="akar-icons:cross" width="35" height="35" />
                  </button>
                </ConfirmAlert>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center gap-4 mx-auto w-full">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="bg-teal-800 rounded-full w-full py-2 text-center text-white">
                    Carpool requested
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-teal-800/90">
                  <p className="text-white text-sm max-w-[10vw] text-center">
                    Your ride will be visible after the event registration
                    deadline.
                  </p>
                </TooltipContent>
              </Tooltip>
              <div className="flex items-center justify-center">
                <ConfirmAlert
                  title="Are you sure you want to cancel this carpool request?"
                  description="This action cannot be undone. Your carpool request will be canceled."
                  onConfirm={cancelRideHandler} // Trigger cancel carpool request
                  onCancel={() => {}} // Optionally handle cancel
                >
                  <button
                    className="text-slate-500 cursor-pointer"
                    aria-label="Cancel carpool request"
                    disabled={isLoading} // Disable the button while loading
                  >
                    <Icon icon="akar-icons:cross" width="35" height="35" />
                  </button>
                </ConfirmAlert>
              </div>
            </div>
          )
        ) : (
          <>
            {ride.driver ? (
              <>
                <p className="font-semibold">You are a driver!</p>
                <p className="text-secondary-light text-sm">
                  We assigned some passengers for your ride. You can check the
                  pick-up points by opening the carpool details page.
                </p>
                <PassengersItem ride={ride} />
              </>
            ) : (
              <>
                <p className="font-semibold">You are a passenger!</p>
                <p className="text-secondary-light text-sm">
                  We assigned you to a driver. Enter the carpool page to see
                  your pick-up point and ride details.
                </p>
                {ride.driverRide && (
                  <DriverInfoItem
                    rideId={ride.id}
                    user={ride.driverRide.user}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>
    </EventItem>
  );
};

export default RideItem;
