import { User } from "@/models/user";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";

const DriverInfoItem = ({ user, rideId }: { user: User; rideId?: number }) => {
  return (
    <div className="bg-gray-100 rounded-xl px-4 py-3 flex justify-between items-center">
      <div className="flex gap-2 items-center">
        <Avatar>
          <AvatarImage src={user.avatarUrl as string} />
          <AvatarFallback>{user.username?.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <p className="font-semibold text-sm">Driver</p>
          <p className="font-semibold text-secondary text-sm">
            {user.username}
          </p>
        </div>
      </div>
      {rideId && (
        <Link href={`/carpools/${rideId}`}>
          <Button variant="link">Ride Details</Button>
        </Link>
      )}
    </div>
  );
};

export default DriverInfoItem;
