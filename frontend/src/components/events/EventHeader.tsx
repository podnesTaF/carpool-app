import { Event } from "@/models/event";
import { formatDate } from "@/utils/time-helpers";
import { Pin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

const EventHeader = ({ event }: { event?: Event }) => {
  if (!event) {
    return <Skeleton className="max-w-4xl lg:mx-auto rounded-xl w-full h-64" />;
  }

  return (
    <div className="max-w-4xl lg:mx-auto rounded-xl w-full relative">
      <Image
        src={event.bannerUrl || "/car-event 1.png"}
        alt="event banner"
        width={800}
        height={400}
        className="w-full top-0 left-0 h-40 md:h-64 rounded-xl absolute object-cover z-0"
      />
      <div className="max-w-3xl bg-white shadow-lg p-5 rounded-xl z-10 relative mx-auto mt-20 md:mt-40 flex flex-col gap-1">
        <h3>{event.title}</h3>
        <div className="flex items-center gap-2">
          <Pin size={16} className="text-primary-orange" />{" "}
          <p className="text-primary-orange font-semibold">{event.address}</p>
        </div>
        <div className="flex justify-between gap-6 items-center">
          <p className="text-secondary-medium font-medium">
            {formatDate(event.startDateTime, true)}
          </p>
          <Link href={`/events/${event.id}`}>
            <Button variant={"link"}>View Event</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventHeader;
