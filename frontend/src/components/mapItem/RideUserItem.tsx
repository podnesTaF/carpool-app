import { cn } from "@/lib/utils";
import { Ride } from "@/models/ride";
import { formatTime } from "@/utils/time-helpers";
import { Car, Timer, User } from "lucide-react";
import { CSSProperties, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const RideUserItem = ({
  ride,
  style,
}: {
  ride: Ride;
  style?: CSSProperties;
}) => {
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
      <div
        className={`absolute bottom-0 border-0 h-auto left-0 transform origin-bottom-left transition-transform duration-100 p-0 shadow-md rounded-3xl pr-2 w-max ${
          isHovered ? "w-max" : "w-max"
        } ${ride.driver ? "bg-primary-orange" : "bg-secondary"}`}
        style={{
          borderBottomLeftRadius: 0,
        }}
      >
        <div className={cn("flex items-center gap-3")}>
          <div className="p-3 flex flex-col gap-1">
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
          <Avatar
            className={`rounded-xl bg-none w-20 h-20 object-cover shadow-md`}
          >
            <AvatarImage src={ride.user.avatarUrl as string} className="object-cover mr-2" />
            <AvatarFallback
              className={`${
                ride.driver ? "bg-primary-orange" : "bg-secondary"
              } text-white`}
            >
              {ride.user.username?.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
};

export default RideUserItem;
