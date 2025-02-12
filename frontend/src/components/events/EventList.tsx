import { getRides } from "@/api/backendEndpoints";
import { getUsersRides } from "@/api/rides";
import { Event } from "@/models/event";
import useAuthStore from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";
import EmptyListPlaceholder from "../other/EmptyListPlaceholder";
import FilterableList from "./FilterableList";
import EventItem from "./eventItem";

export default function EventsList2({ events }: { events: Event[] }) {
  const { data } = useQuery({
    queryKey: ["rides"],
    queryFn: getRides,
  });

  const { user } = useAuthStore();
  const { data: userRides } = useQuery({
    queryKey: ["userRides", user?.id],
    queryFn: () => getUsersRides(),
    enabled: !!user?.id,
  });

  return (
    <FilterableList
      emptyListPlaceholder={<EmptyListPlaceholder title="No Events Found" />}
      data={events}
      renderItem={(event) => {
        const rides = data?._embedded?.rides.filter(
          (ride) => ride.event?.id === event?.id
        );
        return <EventItem event={event} rides={rides} key={event.id} />;
      }}
      searchPlaceholder="Search for an event"
      tabs={[
        { value: "all", label: "All", filter: () => true },
        {
          value: "registered",
          label: "Registered",
          filter: (event) => {
            return userRides
              ? userRides?.some((ride) => ride.event?.id === event.id)
              : false;
          },
        },
      ]}
    />
  );
}
