"use client";

import { getEvents } from "@/api/event";
import EventsList2 from "@/components/events/EventList";
import EventsMap from "@/components/events/EventsMap";
import Navbar from "@/components/nav/navbar";
import { useQuery } from "@tanstack/react-query";
import "mapbox-gl/dist/mapbox-gl.css";

export default function Events() {
  const { data } = useQuery({
    queryKey: ["events"],
    queryFn: getEvents,
  });

  const filteredEvents = data?.filter((event) => !event.archived);
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="lg:pl-16 w-full h-full">
        <EventsList2 events={filteredEvents || []} />
        {data && <EventsMap events={data} />}
      </div>
    </div>
  );
}
