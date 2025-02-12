import { formatEventDate } from "@/lib/utils";
import { Event } from "@/models/event";
import { Ride } from "@/models/ride";
import { Icon } from "@iconify/react/dist/iconify.js";
import Image from "next/image";
import Link from "next/link";
import EventCarStatus from "./eventCarStatus";

export default function EventItem({
  event,
  rides,
  children,
}: {
  event: Event;
  rides?: Ride[];
  children?: React.ReactNode;
}) {
  // Assuming rides array is already filtered properly to include only relevant rides for the event
  const ride = rides?.[0]; // Ensure the same ride is used across tabs

  return (
    <div className="flex flex-col gap-y-2">
      <Link href={`/events/${event.id}`}>
        <div className="flex gap-6 items-center hover:bg-gray-50 rounded-lg">
          <Image
            src={event.bannerUrl}
            alt={`Image for event ${event.title}`}
            width={80}
            height={80}
            className="rounded-xl"
          />
          <div className="flex flex-col">
            <p className="font-semibold text-black">{event.title}</p>
            <div className="flex gap-x-2">
              <Icon
                className="text-primary-orange -ml-2"
                icon="mdi:location"
                width="24"
                height="24"
              />
              <p className="text-primary-orange font-semibold">
                {event.address}
              </p>
            </div>
            <p className="text-gray-500 text-sm">
              {event.startDateTime && event.endDateTime
                ? formatEventDate(event.startDateTime, event.endDateTime)
                : null}
            </p>
          </div>
        </div>
      </Link>
      {ride && <EventCarStatus ride={ride} />}
      {children}
    </div>
  );
}
