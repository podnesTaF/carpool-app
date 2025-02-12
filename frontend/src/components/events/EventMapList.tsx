import { Event } from "@/models/event";
import { formatLongDate } from "@/utils/time-helpers";
import { useRouter } from "next/navigation";
import { CSSProperties } from "react";
import { Card, CardContent, CardDescription } from "../ui/card";
import { Label } from "../ui/label";

const EventMapList = ({
  events,
  style,
}: {
  events: Event[];
  style?: CSSProperties;
}) => {
  const router = useRouter();

  return (
    <div
      className="relative group transition-all transition-100"
      style={{
        transform: "translate(0, -100%)", // Align left-bottom corner to location
        ...style,
      }}
    >
      <div
        className={`absolute bottom-0 border-0 h-auto left-0 transform origin-bottom-left transition-transform duration-100 p-0 shadow-md rounded-3xl
          w-max bg-primary overflow-hidden `}
        style={{
          borderBottomLeftRadius: 0,
        }}
      >
        <div className={"flex items-center flex-col"}>
          {events.map((event) => (
            <Card
              key={event.id}
              onClick={() => router.push(`/events/${event.id}`)}
              className={`w-full flex items-center gap-3 p-3 bg-primary border-none hover:opacity-70 cursor-pointer`}
            >
              <CardContent className="p-0 flex items-center gap-4">
                <Label
                  className={`cursor-pointer bg-primary-orange text-white rounded-full w-max px-2 font-medium py-0.5 text-sm`}
                >
                  {`${formatLongDate(event.startDateTime)}`}
                </Label>
                <CardDescription className="text-white text-sm font-semibold">
                  {event.title}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventMapList;
