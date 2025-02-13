import { Ride } from "@/models/ride";
import Link from "next/link";
import PeopleAvatarList from "../other/PeopleAvatarList";
import { Button } from "../ui/button";

const PassengersItem = ({ ride }: { ride: Ride }) => {
  return (
    <div className="bg-gray-100 rounded-xl px-4 py-3 flex justify-between items-center">
      <div className="flex gap-4 items-center">
        {ride?.passengerRides && ride.passengerRides.length ? (
          <PeopleAvatarList
            people={ride.passengerRides.map((r) => r.user)}
            size={34}
            displayCount={3}
          />
        ) : null}
        <div className="flex flex-col">
          <p className="font-semibold text-sm">Passengers</p>
          <p className="font-semibold text-sm text-secondary">
            {ride?.passengerRides?.length || 0} /{" "}
            {ride.vehicle?.maxPassengers || 0}
          </p>
        </div>
      </div>

      <Link href={`/carpools/${ride.id}`}>
        <Button variant="link">Ride Details</Button>
      </Link>
    </div>
  );
};

export default PassengersItem;
