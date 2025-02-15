"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Vehicle } from "@/models/vehicle";
import Link from "next/link";
import { useFormContext } from "react-hook-form";

export default function VehicleSelect({
  vehicles = [],
  setSelectedVehicleData,
  selectedVehicleData,
}: {
  vehicles?: any[];
  setSelectedVehicleData: (data: any | null) => void;
  selectedVehicleData?: Vehicle | null;
}) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const { setValue: setFormValue } = useFormContext();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <input type="hidden" name="vehicle" value={value} />
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`!w-full lg:w-auto truncate justify-between ${
            value ? "text-black" : "text-gray-400"
          }`}
        >
          {selectedVehicleData
            ? selectedVehicleData.brand +
              " " +
              selectedVehicleData.model +
              " - " +
              selectedVehicleData.plate
            : "Select vehicle..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Command>
          <CommandInput placeholder="Search vehicle..." />
          <CommandList>
            <CommandEmpty className="p-3">
              <div className="flex flex-col gap-3 items-center">
                <p>No vehicle found</p>
                <div>
                  <Link className="text-sm text-primary-orange" href={"/cars"}>
                    Add a vehicle here
                  </Link>
                </div>
              </div>
            </CommandEmpty>
            <CommandGroup>
              {vehicles?.map((vehicle) => (
                <CommandItem
                  key={vehicle.id}
                  value={vehicle.id}
                  onSelect={() => {
                    setValue(vehicle.id === value ? "" : vehicle.id);
                    setSelectedVehicleData(
                      vehicle.id === value ? null : vehicle
                    );
                    setFormValue(
                      "vehicle",
                      vehicle.id === value ? "" : vehicle.id
                    );
                    setOpen(false);
                  }}
                >
                  <div className="w-full flex justify-between items-center">
                    {vehicle.brand +
                      " " +
                      vehicle.model +
                      " - " +
                      vehicle.plate}
                    <Check
                      className={cn(
                        "h-4 w-4",
                        value === vehicle.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
