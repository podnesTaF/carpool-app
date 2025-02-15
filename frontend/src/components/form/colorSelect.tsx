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
import { VehicleCreateSchema } from "@/utils/car-schemas";
import { useFormContext } from "react-hook-form";

export const colors = [
  {
    value: "white",
    label: "White",
    hex: "#ffffff",
  },
  {
    value: "black",
    label: "Black",
    hex: "#000000",
  },
  {
    value: "gray",
    label: "Gray",
    hex: "#808080",
  },
  {
    value: "silver",
    label: "Silver",
    hex: "#c0c0c0",
  },
  {
    value: "blue",
    label: "Blue",
    hex: "#0000ff",
  },
  {
    value: "red",
    label: "Red",
    hex: "#ff0000",
  },
  {
    value: "brown",
    label: "Brown",
    hex: "#a52a2a",
  },
  {
    value: "green",
    label: "Green",
    hex: "#008000",
  },
  {
    value: "orange",
    label: "Orange",
    hex: "#ffa500",
  },
  {
    value: "beige",
    label: "Beige",
    hex: "#f5f5dc",
  },
  {
    value: "purple",
    label: "Purple",
    hex: "#800080",
  },
  {
    value: "gold",
    label: "Gold",
    hex: "#ffd700",
  },
  {
    value: "yellow",
    label: "Yellow",
    hex: "#ffff00",
  },
  {
    value: "pink",
    label: "Pink",
    hex: "#ffc0cb",
  },
  {
    value: "turquoise",
    label: "Turquoise",
    hex: "#40e0d0",
  },
  {
    value: "other",
    label: "Other",
    hex: "#000000",
  },
];

export default function ColorSelect({ gotValue }: { gotValue?: string }) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const { setValue: setFormValue } = useFormContext<VehicleCreateSchema>();

  React.useEffect(() => {
    if (gotValue) {
      setFormValue("color", gotValue);
      setValue(gotValue);
    }
  }, [gotValue, setFormValue]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <input type="hidden" name="color" value={value} />
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`!w-full lg:w-auto truncate justify-between ${
            value ? "text-black" : "text-gray-400"
          }`}
        >
          {value ? (
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full mr-2 border"
                style={{
                  backgroundColor: colors.find((color) => color.value === value)
                    ?.hex,
                }}
              ></div>
              {colors.find((color) => color.value === value)?.label}
            </div>
          ) : (
            "Select color..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Command>
          <CommandInput placeholder="Search color..." />
          <CommandList>
            <CommandEmpty>No color found.</CommandEmpty>
            <CommandGroup>
              {colors.map((color) => (
                <CommandItem
                  key={color.value}
                  value={color.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setFormValue(
                      "color",
                      currentValue === value ? "" : currentValue
                    );
                    setOpen(false);
                  }}
                >
                  <div className="w-full flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full mr-2 border"
                        style={{ backgroundColor: color.hex }}
                      ></div>
                      {color.label}
                    </div>
                    <Check
                      className={cn(
                        "h-4 w-4",
                        value === color.value ? "opacity-100" : "opacity-0"
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
