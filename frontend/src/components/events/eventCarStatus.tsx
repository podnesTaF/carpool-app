import { Ride } from "@/models/ride";
import { Icon } from "@iconify/react/dist/iconify.js";

export default function EventCarStatus({ ride }: { ride: Ride }) {
  const isDriver = ride.driver;
  const statusText = isDriver ? "You shared your car" : "Carpool requested";
  const statusBgColor = isDriver ? "bg-primary-orange" : "bg-secondary";

  return (
    <div className="px-2 text-center flex items-center justify-between gap-x-4">
      <div className={`rounded-full ${statusBgColor} flex justify-center items-center px-3 py-1 w-[90%]`}>
        <p className="text-white w-full text-sm py-0.5">{statusText}</p>
      </div>
      <Icon className="text-secondary-medium" icon="mdi:close" width="34" height="34" />
    </div>
  );
}
