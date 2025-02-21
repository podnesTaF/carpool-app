"use client";

import { Location } from "@/api/locationApi";
import { registerForEvent } from "@/api/rides";
import { getUserVehicles } from "@/api/vehicles";
import FormField from "@/components/form/FormField";
import LocationInput from "@/components/form/LocationInput";
import VehicleSelect from "@/components/form/vehicleSelect";
import VehicleCard from "@/components/ride/VehicleCard";
import { Button } from "@/components/ui/button";
import { RegisterForEventDto } from "@/models/dto/registerForEvent.dto";
import { Vehicle } from "@/models/vehicle";
import useAuthStore from "@/store/authStore";
import { EventRegisterSchema } from "@/utils/event-register-schemas";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";

const DriverRegister = () => {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [query, setQuery] = useState<string>("");
  const [location, setLocation] = useState<Location>();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false); // State to manage button loading

  const { mutate } = useMutation({
    mutationKey: ["create driver", id],
    mutationFn: (dto: EventRegisterSchema) => {
      const dtoValues: RegisterForEventDto = {
        driver: true,
        canBeDriver: false,
        pickupLat: dto.pickupLat,
        pickupLong: dto.pickupLong,
        pickupRadius: dto.pickupRadius ? +dto.pickupRadius : null,
        vehicleId: selectedVehicleData?.id ?? null,
      };
      return registerForEvent(+id, dtoValues);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", id] });
      queryClient.invalidateQueries({ queryKey: ["userRides", user?.id] });
      router.push(`/events/${id}`);
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.error || "An error occurred");
    },
    onMutate: () => {
      setIsLoading(true); // Set loading state when mutation is triggered
    },
    onSettled: () => {
      setIsLoading(false); // Reset loading state after mutation is settled
    },
  });

  const { setValue, handleSubmit } = useFormContext<EventRegisterSchema>();

  const { data: userVehicles, isLoading: vehiclesLoading } = useQuery({
    queryKey: ["vehicles", user?.id],
    queryFn: () => {
      return getUserVehicles(user!.id);
    },
    enabled: !!user?.id,
  });

  const [selectedVehicleData, setSelectedVehicleData] =
    useState<Vehicle | null>(null);

  useEffect(() => {
    setValue("pickupLat", location?.lat as number);
    setValue("pickupLong", location?.lng as number);
  }, [location, setValue]);

  useEffect(() => {
    setValue("registrationType", "driver");
  }, [setValue]);

  return (
    <div>
      <div className="flex flex-col w-full gap-6 md:gap-10">
        <FormField
          type="custom"
          label="Trip Start Address"
          name="pickupLat"
          disclaimer="The system will assign some passengers to you a day before the event, which are the most suits the location entered here. You can manage your ride anytime in “carpools” page"
        >
          <LocationInput
            selectedLocation={location}
            onChange={(l) => setLocation(l)}
            query={query}
            setQuery={setQuery}
            placeholder="Choose an address"
          />
        </FormField>
      </div>
      <div className="flex flex-col w-full gap-4 mt-6">
        <h4 className="font-bold">Driver info</h4>
        <FormField
          type="input"
          label="Pickup Radius (km)"
          name="pickupRadius"
          inputType="number"
          disclaimer="This will be used for passenger division. Here You specify the most far radius you want to go off the normal course to pick somebody up"
          placeholder="Enter the radius within which you can pick up passengers"
        />
        <div className="grid gird-cols-1 gap-5">
          <FormField
            type="custom"
            label="Vehicle"
            name="vehicleId"
            value={vehiclesLoading ? "Loading..." : undefined}
            placeholder="Enter your vehicle ID"
          >
            <VehicleSelect
              vehicles={userVehicles}
              setSelectedVehicleData={(data) => {
                setValue("vehicleId", data?.id);
                setSelectedVehicleData(data);
              }}
              selectedVehicleData={selectedVehicleData}
            />
          </FormField>
          {userVehicles && selectedVehicleData && (
            <VehicleCard vehicle={selectedVehicleData} />
          )}
        </div>
      </div>
      <div className="flex fixed bottom-4 left-4 right-4 md:left-auto md:right-auto max-w-3xl md:w-full gap-4">
  <div className="flex flex-col items-center w-full">
    <Link href={`/events/${id}`} className="w-full">
      <Button className="bg-primary-orange hover:bg-primary-orange/90 rounded-full px-8 py-6 gap-6 w-full">
        Cancel
      </Button>
    </Link>
  </div>
  <div className="flex flex-col items-center w-full">
    <Button
      onClick={handleSubmit((dto) => mutate(dto))}
      className="bg-secondary hover:bg-secondary/90 rounded-full px-12 py-6 gap-6 w-full"
      disabled={isLoading} // Disable button when loading
    >
      {isLoading ? "Registering..." : "Register"}
    </Button>
  </div>
</div>

    </div>
  );
};

export default DriverRegister;
