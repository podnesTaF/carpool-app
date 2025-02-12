"use client";
import { Location } from "@/api/locationApi";
import { registerForEvent } from "@/api/rides";
import { getUserVehicles } from "@/api/vehicles";
import FormField from "@/components/form/FormField";
import LocationInput from "@/components/form/LocationInput";
import VehicleSelect from "@/components/form/vehicleSelect";
import VehicleCard from "@/components/ride/VehicleCard";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { RegisterForEventDto } from "@/models/dto/registerForEvent.dto";
import { Vehicle } from "@/models/vehicle";
import useAuthStore from "@/store/authStore";
import { EventRegisterSchema } from "@/utils/event-register-schemas";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";

const PassengerRegistration = () => {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const [query, setQuery] = useState<string>("");
  const [location, setLocation] = useState<Location>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationKey: ["create passenger", id],
    mutationFn: (dto: EventRegisterSchema) => {
      const rideId = searchParams.get("rideId");
      const dtoValues: RegisterForEventDto = {
        driver: false,
        canBeDriver: !!dto.canBeDriver,
        pickupLat: dto.pickupLat,
        pickupLong: dto.pickupLong,
        pickupRadius: dto.pickupRadius ? +dto.pickupRadius : null,
        vehicleId: dto.vehicleId ? +dto.vehicleId : null,
      };
      return registerForEvent(+id, dtoValues, rideId);
    },
    onSuccess: (message) => {
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ["event", id] });
      queryClient.invalidateQueries({ queryKey: ["userRides", user?.id] });
      router.push(`/events/${id}`);
    },
    onError: (e: any) => {
      toast.error(e.response?.data);
    },
  });

  const { setValue, watch, handleSubmit } =
    useFormContext<EventRegisterSchema>();

  const canBeDriver = watch("canBeDriver");

  useEffect(() => {
    setValue("pickupLat", location?.lat as number);
    setValue("pickupLong", location?.lng as number);
  }, [location, setValue]);

  useEffect(() => {
    setValue("registrationType", "passenger");
  }, [setValue]);

  const { data: userVehicles, isLoading: vehiclesLoading } = useQuery({
    queryKey: ["vehicles", user?.id],
    queryFn: () => {
      return getUserVehicles(user!.id);
    },
    enabled: !!user?.id,
  });

  const [selectedVehicleData, setSelectedVehicleData] =
    useState<Vehicle | null>(null);

  return (
    <div>
      <div className="flex flex-col w-full gap-6 md:gap-10">
        <FormField
          type="custom"
          label="Preferred pickup address"
          name="pickupLat"
          disclaimer="This address won't be your final pickup  point, our AI algorithms will find the best point which will suit both you and the driver. "
        >
          <LocationInput
            selectedLocation={location}
            onChange={(l) => setLocation(l)}
            query={query}
            setQuery={setQuery}
            placeholder="Choose an address"
          />
        </FormField>
        <FormField
          type="custom"
          name="canBeDriver"
          placeholder="I don't mind become a driver if needed"
          disclaimer="If not enough drivers will be available for amount of passengers, we will make you a driver for this event."
        >
          <div className="flex items-center space-x-2">
            <Switch
              name="canBeDriver"
              checked={!!canBeDriver}
              onCheckedChange={() => setValue("canBeDriver", !canBeDriver)}
            />
            <Label>I don&apos;t mind become a driver if needed</Label>
          </div>
        </FormField>
      </div>
      {canBeDriver && (
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
            {userVehicles && selectedVehicleData ? (
              <VehicleCard vehicle={selectedVehicleData} />
            ) : (
              <Skeleton className="w-full h-32" />
            )}
          </div>
        </div>
      )}
      <div className="fixed bottom-4 flex gap-3 max-w-3xl mx-auto w-full justify-end">
        <Link href={`/events/${id}`}>
          <Button className="bg-primary-orange hover:bg-primary-orange/90 rounded-full px-8 py-6 gap-6">
            Cancel
          </Button>
        </Link>
        <Button
          onClick={handleSubmit((dto) => mutate(dto))}
          className="bg-secondary hover:bg-secondary/90 rounded-full px-12 py-6 gap-6"
        >
          Register
        </Button>
      </div>
    </div>
  );
};

export default PassengerRegistration;
