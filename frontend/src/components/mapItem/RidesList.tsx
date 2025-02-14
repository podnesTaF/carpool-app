import { Ride } from "@/models/ride";
import { formatTime } from "@/utils/time-helpers";
import { Car, Timer, User } from "lucide-react";
import { CSSProperties } from "react";

const RidesList = ({
  rides,
  style,
}: {
  rides: Ride[];
  style?: CSSProperties;
}) => {
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
          w-max bg-secondary overflow-hidden `}
        style={{
          borderBottomLeftRadius: 0,
        }}
      >
        <div className={"flex items-center flex-col"}>
          {rides.map((ride) => (
            <div
              key={ride.id}
              className={`w-full flex items-center gap-3 p-3 ${
                ride.driver ? "bg-primary-orange" : "bg-primary"
              }`}
            >
              <div className="flex items-center gap-2">
                {ride.driver ? (
                  <Car className="text-white" />
                ) : (
                  <User className="text-white" />
                )}
                <p className="text-white font-semibold text-sm">
                  {ride.user.username}
                </p>
              </div>
              {ride.driverRide && (
                <div className="flex items-center gap-2">
                  <Car className="text-white" />
                  <p className="text-white font-semibold text-sm">
                    {ride.driverRide.user?.username}
                  </p>
                </div>
              )}
              {ride.startDateTime && (
                <div className="flex items-center gap-2">
                  <Timer className="text-white" />
                  <p className="text-white font-semibold text-sm">
                    {formatTime(ride.startDateTime)}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RidesList;
