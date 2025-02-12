"use client";

import { getEvent } from "@/api/event";
import { assignUsers, getEventRides } from "@/api/rides";
import RidesMap from "@/components/map/RidesMap";
import { Button } from "@/components/ui/button";
import { Ride } from "@/models/ride";
import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const Map = () => {
  const { id } = useParams<{ id: string }>();
  const { data, refetch } = useQuery({
    queryKey: ["rides-map", id],
    queryFn: () => getEventRides(+id!),
    enabled: !!id,
  });

  const { data: event } = useQuery({
    queryKey: ["event", id as any],
    queryFn: () => getEvent(+id!),
    enabled: !!id,
  });

  const { mutate } = useMutation({
    mutationKey: ["assign_rides"],
    mutationFn: () => assignUsers(+id!),
    onSuccess: () => {
      refetch();
      toast.success("successfully assigned");
    },
    onError: () => {
      toast.error("error occurred");
    },
  });

  const [rides, setRides] = useState<Ride[]>([]);

  useEffect(() => {
    if (data) {
      setRides(data);
    }
  }, [data]);

  return (
    <>
      {rides && <RidesMap rides={rides} rideEvent={event} />}
      <div className="absolute right-4 bottom-4 lg:right-20 lg:bottom-20 flex gap-6">
        <Button onClick={() => mutate()}>Assign Rides</Button>
      </div>
      <div className="absolute z-30 left-4 lg:left-24 bottom-4 lg:top-4">
        <Link href={`/events/${event?.id}`}>
          <Button>Back to Event</Button>
        </Link>
      </div>
    </>
  );
};

export default Map;
