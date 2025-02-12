import { Ride } from "@/models/ride";
import { isPassed } from "@/utils/time-helpers";
import EmptyListPlaceholder from "../other/EmptyListPlaceholder";
import PeopleAvatarList from "../other/PeopleAvatarList";
import UserRideItem from "../ride/UserRideItem";
import { Button } from "../ui/button";
import FilterableList from "./FilterableList";

const DriverList = ({ drivers }: { drivers: Ride[] }) => {
  return (
    <FilterableList
      data={drivers}
      emptyListPlaceholder={<EmptyListPlaceholder title="No Drivers Found" />}
      renderItem={(ride) => {
        return (
          <UserRideItem
            key={ride.id}
            ride={ride}
            shortForm={true}
            rideLink={true}
            rideAvailable={isPassed(ride.event.registerDeadline)}
          />
        );
      }}
      tabs={[
        { value: "all", label: "All", filter: () => true },
        {
          value: "my",
          label: "My Ride",
          filter: (driver) => drivers[0]?.id === driver.id,
        },
      ]}
      openTrigger={
        <div className="bg-gray-50 rounded-xl w-full flex p-5 items-center justify-between outline-none">
          <PeopleAvatarList
            people={drivers.map((r) => r.user)}
            displayCount={3}
            size={50}
            text={
              drivers.length === 1
                ? "Driver"
                : drivers.length < 1
                ? "No Drivers"
                : "Drivers"
            }
          />
          <Button variant={"link"}>View Drivers</Button>
        </div>
      }
      className="bottom-20"
    />
  );
};

export default DriverList;
