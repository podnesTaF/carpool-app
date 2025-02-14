import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Event } from "@/models/event";
import { formatLongDate, formatTime } from "@/utils/time-helpers";
import Link from "next/link";
import { CSSProperties, useState } from "react";

const MapItem = ({ event, style }: { event: Event; style?: CSSProperties }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: "translate(0, -100%)", // Align left-bottom corner to location
        ...style,
      }}
    >
      {/* Card without pin, left-bottom corner radius = 0 */}
      <Card
        className={`absolute bottom-0 border-0 h-auto left-0 transform origin-bottom-left transition-transform duration-100 p-3 bg-primary shadow-md rounded-3xl w-max ${
          isHovered ? "w-max" : "w-max"
        }`}
        style={{
          borderBottomLeftRadius: 0, // Remove bottom-left radius
        }}
      >
        <CardHeader className="p-0">
          <Label
            className={`cursor-pointer bg-primary-orange text-white rounded-full w-max px-2 font-medium py-0.5 text-sm`}
          >
            {`${formatLongDate(event.startDateTime)}`}
          </Label>
          <CardDescription className="text-white text-sm font-semibold mt-2">
            {event.title}
          </CardDescription>
        </CardHeader>

        <div
          className={`overflow-hidden transition-all duration-100 p-0 ${
            isHovered ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <CardContent className="flex flex-col gap-1 p-0">
            <div className="text-primary-white">
              {formatLongDate(event.startDateTime, true)} -{" "}
              {formatTime(event.endDateTime)}
            </div>
            <div className="text-primary-white">
              <span className="font-bold">Address:</span> {event.address}
            </div>
          </CardContent>

          <CardFooter className="flex w-full justify-end p-0">
            <Link
              href={`/events/${event.id}`}
              className="text-primary-orange underline text-sm font-semibold cursor-pointer hover:text-secondary-medium"
            >
              Read More & Register
            </Link>
          </CardFooter>
        </div>
      </Card>
    </div>
  );
};

export default MapItem;
