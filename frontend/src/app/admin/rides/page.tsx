"use client";

import { cancelRide, getAllRides } from "@/api/rides";
import ConfirmAlert from "@/components/other/ConfirmAlert";
import TooltipButton from "@/components/other/TooltipButton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDate } from "@/utils/time-helpers";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const RidesPage = () => {
  const router = useRouter();
  const [includeArchive, setIncludeArchive] = useState(false);
  const [driversOnly, setDriversOnly] = useState(false);
  const [isActive, setIsActive] = useState(false);

  // For pagination controls
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const {
    data: ridePage,
    isLoading,
    refetch,
    error,
  } = useQuery({
    queryKey: ["rides", includeArchive, driversOnly, isActive, page, size],
    queryFn: () =>
      getAllRides(includeArchive, driversOnly, isActive, page, size),
  });

  const { mutate, isPending } = useMutation({
    mutationKey: ["remove ride"],
    mutationFn: (rideId: number) => cancelRide(rideId),
    onSuccess: (message: string) => {
      toast.success(message);
      refetch();
    },
    onError: () => {
      toast.error("error canceling ride");
    },
  });

  const rides = ridePage?.content ?? [];
  const totalPages = ridePage?.totalPages ?? 1;
  return (
    <div className="lg:ml-28 lg:mr-14 pt-24">
      <div className="flex flex-col items-center justify-center w-full h-full px-2 lg:px-0">
        {/* Top gradient bar */}
        <div className="flex flex-col w-full h-10 lg:h-20 rounded-t-2xl bg-gradient-to-r from-primary to-secondary-medium" />

        {/* Main content pane */}
        <div className="flex flex-col w-full bg-gray-100 rounded-b-2xl lg:px-5 pb-8">
          {/* Header row */}
          <div className="p-5 flex flex-col">
            <div className="flex justify-between items-center gap-5">
              <div className="text-xl lg:text-3xl text-black font-semibold">
                Manage Rides
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href={"/admin"}>
                    <Button variant={"default"}>
                      <Icon icon={"mdi:arrow-left"} />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-white text-xs">Back to admin overview</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* FILTER PANE */}
          <div className="bg-white rounded-lg p-5 mx-5 mb-5 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Filters</h2>
            <div className="flex items-center space-x-2 mb-2">
              <Checkbox
                id="includeArchive"
                checked={includeArchive}
                onCheckedChange={(checked) => setIncludeArchive(!!checked)}
              />
              <Label htmlFor="includeArchive">
                Include Archive (past events)
              </Label>
            </div>

            {/* Drivers Only */}
            <div className="flex items-center space-x-2 mb-2">
              <Checkbox
                id="driversOnly"
                checked={driversOnly}
                onCheckedChange={(checked) => setDriversOnly(!!checked)}
              />
              <Label htmlFor="driversOnly">Drivers Only</Label>
            </div>

            {/* Is Active */}
            <div className="flex items-center space-x-2 mb-2">
              <Checkbox
                id="isActive"
                checked={isActive}
                onCheckedChange={(checked) => setIsActive(!!checked)}
              />
              <Label htmlFor="isActive">Is Active</Label>
            </div>
          </div>

          {/* MAIN CONTENT: Rides Table or Loading/Errors */}
          {isLoading ? (
            <div className="w-full h-full bg-primary-white rounded-lg p-5 mt-5">
              <p className="text-lg text-gray-600 flex gap-2 justify-start items-center">
                <Icon icon={"mdi:loading"} className="animate-spin" />
                Loading rides...
              </p>
            </div>
          ) : error ? (
            <div className="w-full h-full bg-red-50 rounded-lg p-5 mt-5">
              <p className="text-lg text-red-600">
                Something went wrong: {String(error)}
              </p>
            </div>
          ) : rides.length > 0 ? (
            <div className="w-full h-full bg-primary-white rounded-lg p-5 mt-5 shadow-lg">
              <table className="table-fixed w-full">
                <thead className="border-b-2 rounded-full border-gray-300">
                  <tr>
                    <th className="hidden text-left lg:table-cell lg:w-2/6">
                      Event Title
                    </th>
                    <th className="w-1/12">Type</th>
                    <th className="hidden lg:table-cell lg:w-2/12">
                      Start Time
                    </th>
                    <th className="hidden lg:table-cell w-1/12">Passengers</th>
                    <th className="w-1/4 lg:w-1/12">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Rides Rows */}
                  {rides.map((ride) => (
                    <tr key={ride.id} className="border-b border-gray-200">
                      <td className="hidden md:table-cell p-2">
                        {ride.event.title}
                      </td>
                      <td className="p-2 text-center">
                        {ride.driver ? "driver" : "passenger"}
                      </td>
                      <td className="hidden lg:table-cell text-center p-2">
                        {ride.startDateTime
                          ? formatDate(ride.startDateTime, true)
                          : "-"}
                      </td>
                      <td className="hidden lg:table-cell text-center p-2">
                        {ride.driver ? ride.registeredCount : "-"}
                      </td>
                      <td className="p-2 flex items-center gap-2">
                        <TooltipButton
                          tooltip="Open Ride Details"
                          tooltipClass="bg-primary"
                          buttonProps={{
                            className: "bg-primary hover:bg-primary/80",
                            type: "button",
                            onClick: () => {
                              router.push("/carpools/" + ride.id);
                            },
                          }}
                          icon={<Icon icon={"mdi:eye"} />}
                        />
                        <ConfirmAlert
                          title={"Are you sure you want to cancel this ride?"}
                          description="This action cannot be undone. This will permanently delete your ride from our servers."
                          onConfirm={() => mutate(ride.id)}
                        >
                          <TooltipButton
                            tooltip="Delete Ride"
                            tooltipClass="bg-red-800/80"
                            buttonProps={{
                              className:
                                "bg-destructive hover:bg-destructive/80",
                              type: "button",
                              disabled: isPending,
                            }}
                            icon={<Icon icon={"mdi:bin"} />}
                          />
                        </ConfirmAlert>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* PAGINATION */}
              <div className="mt-4 flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                  disabled={page === 0}
                >
                  Previous
                </Button>

                <div>
                  Page {page + 1} of {totalPages}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setPage((prev) => prev + 1)}
                  disabled={page + 1 >= totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-full h-full bg-primary-white rounded-lg p-5 mt-5 flex justify-between items-center">
              <p className="text-lg text-gray-600">No rides found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RidesPage;
