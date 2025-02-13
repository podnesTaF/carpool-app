import { Vehicle } from "@/models/vehicle";
import Image from "next/image";

const VehicleCard = ({ vehicle }: { vehicle: Vehicle }) => {
  return (
    <div className="rounded-xl flex h-32 w-full overflow-hidden gap-6 bg-primary">
      <Image
        src={vehicle.imgUrl || "/carpool1.png"}
        alt="vehicle image"
        width={250}
        height={200}
        className="object-cover w-1/3"
      />
      <div className="p-4 w-max">
        <p className="text-lg font-semibold text-white mb-3">
          {vehicle.brand}, {vehicle.model}
        </p>
        <div className="flex flex-col gap-2">
          <p className="text-base font-medium text-white">
            Plate: {vehicle.plate}
          </p>
          <p className="text-base font-medium text-white">
            Capacity: {vehicle.maxPassengers}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
