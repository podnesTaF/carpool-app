import { getRides } from "@/api/backendEndpoints";
import { Input } from "@/components/ui/input";
import { Event } from "@/models/event";
import useAuthStore from "@/store/authStore";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useQuery } from "@tanstack/react-query";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import EventItem from "./eventItem";
import NoEventData from "./noEventData";

export default function EventsList({ events }: { events: Event[] }) {
  const [filteredEvents, setFilteredEvents] = useState(events);
  const [open, setOpen] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuthStore();

  const { data } = useQuery({
    queryKey: ["rides"],
    queryFn: getRides,
  });

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!open) return; // Only handle clicks when open

      const target = event.target as Node;

      // Check if click is within component
      if (componentRef.current?.contains(target)) {
        return;
      }

      // Check if click is on a mapbox element
      const isMapboxClick = (target as Element).closest(
        ".mapboxgl-map, .mapboxgl-marker"
      );

      if (isMapboxClick) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside, true);
    };
  }, [open]);

  // Focus input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  function onSearchChange(e: ChangeEvent<HTMLInputElement>) {
    const newFilter = e.target.value.toLowerCase();
    if (newFilter === "") {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(
        events.filter(
          (event) =>
            event.title.toLowerCase().includes(newFilter) ||
            event.address.toLowerCase().includes(newFilter)
        )
      );
    }
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 mx-2">
      {/* Overlay to catch clicks when open */}
      {open && (
        <div
          className="fixed inset-0"
          onClick={() => setOpen(false)}
          style={{ backgroundColor: "transparent" }}
        />
      )}
      <div
        ref={componentRef}
        className={`relative w-full lg:w-2/5 bg-white mx-auto lg:rounded-xl transition-all ease-in-out shadow-lg ${
          open ? "mb-0 px-4 py-4 rounded-xl" : "mb-4 px-1 py-1 rounded-full"
        }`}
      >
        {/* Container that moves up when opened */}
        <div
          className={`relative transition-all duration-300 ${
            open ? "mb-[60vh]" : "mb-0"
          }`}
        >
          {/* Search Bar */}
          <div className="relative w-full">
            <div
              className="relative w-full h-12 flex items-center px-4 cursor-pointer"
              onClick={() => !open && setOpen(true)}
            >
              {open && (
                <div
                  className="absolute left-4 cursor-pointer text-gray-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(false);
                  }}
                >
                  <Icon icon="mdi:arrow-left" className="text-2xl" />
                </div>
              )}
              <Input
                ref={inputRef}
                className={`w-full h-full ${
                  open ? "pl-12" : "pl-10"
                } text-lg text-gray-700 bg-transparent outline-none border-none focus:ring-0`}
                placeholder="Search for an event"
                onChange={onSearchChange}
                readOnly={!open}
              />
              {!open && (
                <div className="absolute left-4 text-gray-400">
                  <Icon icon="mdi:magnify" className="text-2xl text-primary" />
                </div>
              )}
            </div>
          </div>

          {/* Events List */}
          <div
            className={`absolute top-14 left-0 right-0 transition-all duration-300 ${
              open
                ? "opacity-100 visible"
                : "opacity-0 invisible pointer-events-none"
            }`}
          >
            <div className="p-4">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="all" className="flex-1">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="registered" className="flex-1">
                    Registered
                  </TabsTrigger>
                </TabsList>

                {/* Tab contents remain the same */}
                <TabsContent
                  value="all"
                  className="max-h-[50vh] overflow-y-auto w-full"
                >
                  {data?._embedded.rides && filteredEvents.length > 0 ? (
                    <div className="flex flex-col gap-y-4">
                      {filteredEvents.map((event: Event) => {
                        const eventRides = data?._embedded?.rides.filter(
                          (ride) =>
                            ride.event.id === event.id &&
                            ride.user.id === user?.id
                        );
                        return (
                          <EventItem
                            event={event}
                            rides={eventRides}
                            key={event.id}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <NoEventData />
                  )}
                </TabsContent>

                <TabsContent
                  value="registered"
                  className="max-h-[50vh] overflow-y-auto w-full"
                >
                  {data?._embedded.rides &&
                  data?._embedded.rides.length > 0 &&
                  filteredEvents.length > 0 ? (
                    <div className="flex flex-col gap-y-4">
                      {filteredEvents.map((event: Event) => {
                        const eventUserRides = data?._embedded?.rides.filter(
                          (ride) =>
                            ride.event.id === event.id &&
                            ride.user.id === user?.id
                        );

                        return eventUserRides.length > 0 ? (
                          <EventItem
                            event={event}
                            rides={eventUserRides}
                            key={event.id}
                          />
                        ) : null;
                      })}
                    </div>
                  ) : (
                    <NoEventData />
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
