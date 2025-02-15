"use client";
import { getLocation, Location } from "@/api/locationApi";
import { useDebounce } from "@/hooks/useDebounce"; // Adjust the import path as necessary
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "../ui/button";
import { Command, CommandInput } from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Skeleton } from "../ui/skeleton";
import { cn } from "@/lib/utils";

interface LocationInputProps {
  placeholder: string;
  selectedLocation?: Location;
  onChange: (location?: Location) => void;
  query: string;
  setQuery: (text: string) => void;
}

const LocationInput = ({
  placeholder,
  selectedLocation,
  onChange,
  query,
  setQuery,
}: LocationInputProps) => {
  const [open, setOpen] = useState(false);

  const debouncedQuery = useDebounce(query, 600);

  const {
    data: locations,
    isLoading,
    isFetching,
    isError,
  } = useQuery({
    queryKey: ["locations", debouncedQuery],
    queryFn: () => getLocation(debouncedQuery),
    enabled: debouncedQuery.length > 0,
    retry: 1,
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full max-w-[100%] justify-between truncate"
        >
          <span className="leading-10 h-10 overflow-hidden truncate">
            {selectedLocation
              ? locations?.find((l) => l.id === selectedLocation?.id)
                  ?.address || selectedLocation.address
              : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full md:w-[450px] max-w-[80vw] py-0 px-4">
        <Command className="w-full">
          <CommandInput
            placeholder={placeholder || "pick an address"}
            onValueChange={(search) => setQuery(search)}
            className="w-full"
          />
          <div className="w-full">
            <div>
              {debouncedQuery.length === 0 ? (
                <div className="flex p-4 py-2 justify-center items-center">
                  <p className="text-base font-semibold text-secondary-medium">
                    Please enter your address.
                  </p>
                </div>
              ) : isError ? (
                <div className="flex p-4 py-2 justify-center items-center">
                  <p className="text-base font-semibold text-red-500">
                    No address found. Please enter another.
                  </p>
                </div>
              ) : isLoading || isFetching ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 mb-2 w-full" />
                ))
              ) : (
                locations?.map((location) => (
                  <div
                    className="flex items-center justify-center"
                    key={location.id}
                  >
                    <div
                      className="hover:bg-gray-50 cursor-pointer px-4 py-2 w-full overflow-hidden flex items-center"
                      onClick={() => {
                        onChange(
                          location.id === selectedLocation?.id
                            ? undefined
                            : locations.find((l) => l.id === location.id)
                        );
                        setOpen(false);
                      }}
                    >
                      <span className="leading-10 h-10 flex-1 overflow-hidden truncate">
                        {location.address}
                      </span>
                      <Check
                        className={cn(
                          "ml-2", // Add some margin to the left for spacing
                          selectedLocation?.id === location.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default LocationInput;
