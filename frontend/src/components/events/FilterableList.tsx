import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import { ChangeEvent, ReactNode, useEffect, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

type FilterableListProps<T> = {
  data: T[];
  renderItem: (item: T, index: number) => ReactNode;
  searchPlaceholder?: string;
  tabs?: { value: string; label: string; filter: (item: T) => boolean }[];
  openTrigger?: ReactNode;
  className?: string;
  emptyListPlaceholder?: React.ReactNode;
};

export default function FilterableList<T>({
  data,
  renderItem,
  searchPlaceholder = "Search...",
  tabs = [{ value: "all", label: "All", filter: () => true }],
  openTrigger,
  className,
  emptyListPlaceholder,
}: FilterableListProps<T>) {
  const [filteredData, setFilteredData] = useState(data);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState(tabs[0].value);
  const componentRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const activeTabFilter = tabs.find((tab) => tab.value === activeTab)?.filter;
    const query = searchQuery.toLowerCase();

    const extractValues = (obj: any): string[] => {
      if (typeof obj === "string") {
        return [obj];
      }
      if (typeof obj === "object" && obj !== null) {
        return Object.values(obj).flatMap(extractValues);
      }
      return [];
    };

    const filtered = data.filter((item) => {
      const searchableText = extractValues(item).join(" ").toLowerCase();

      return (
        (!query || searchableText.includes(query)) &&
        (activeTabFilter ? activeTabFilter(item) : true)
      );
    });

    setFilteredData(filtered);
  }, [data, searchQuery, activeTab, tabs]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!open || componentRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  return (
    <div className={cn("fixed inset-x-0 bottom-4 z-20 mx-2", className)}>
      {open && (
        <div
          className="fixed inset-0 bg-black/20"
          onClick={() => setOpen(false)}
        />
      )}
      <div
        ref={componentRef}
        className={`relative w-full max-w-3xl lg:w-2/5 bg-white mx-auto transition-spacing ease-in-out shadow-lg ${
          open ? "px-4 py-4 rounded-xl" : "rounded-full"
        }`}
      >
        <div
          className={`relative transition-spacing ${
            open ? "mb-[60vh]" : "mb-0"
          }`}
        >
          {/* Custom or Default Open Trigger */}
          {openTrigger && !open ? (
            <div onClick={() => setOpen(true)}>{openTrigger}</div>
          ) : (
            <div
              className="relative w-full h-12 flex items-center px-4 cursor-pointer"
              onClick={() => setOpen(true)}
            >
              {open && (
                <div
                  className="absolute left-8 cursor-pointer text-gray-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(false);
                  }}
                >
                  <Icon icon="mdi:arrow-left" className="text-2xl" />
                </div>
              )}
              <Input
                ref={inputRef}
                className={`w-full h-full ${
                  open ? "pl-12" : "pl-10"
                } text-lg text-gray-700 rounded-full bg-transparent outline-none ${
                  !open && "border-none"
                }`}
                placeholder={searchPlaceholder}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setSearchQuery(e.target.value)
                }
                readOnly={!open}
              />
              {!open && (
                <div className="absolute left-4 text-gray-400">
                  <Icon icon="mdi:magnify" className="text-2xl text-primary" />
                </div>
              )}
            </div>
          )}

          {/* Modal Content */}
          <div
            className={`absolute outline-none top-14 left-0 right-0 transition-all duration-300 ${
              open
                ? "opacity-100 visible"
                : "opacity-0 invisible pointer-events-none"
            }`}
          >
            <div
              className={`p-4 transition-all duration-0 ${
                open
                  ? "opacity-100 visible"
                  : "opacity-0 invisible pointer-events-none"
              }`}
            >
              <Tabs
                defaultValue={tabs[0].value}
                className="w-full"
                onValueChange={(value) => setActiveTab(value)}
              >
                <TabsList className="w-full mb-4">
                  {tabs.map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value}>
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent
                  value={activeTab}
                  className={`max-h-[50vh] overflow-y-auto transition-all duration-0 w-full [&::-webkit-scrollbar]:w-2
  [&::-webkit-scrollbar-track]:rounded-full
  [&::-webkit-scrollbar-track]:bg-gray-100
  [&::-webkit-scrollbar-thumb]:rounded-full
  [&::-webkit-scrollbar-thumb]:bg-gray-300
  dark:[&::-webkit-scrollbar-track]:bg-neutral-700
  dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 ${
    open ? "opacity-100 visible" : "opacity-0 invisible"
  }`}
                >
                  {filteredData.length > 0 ? (
                    <div className="flex flex-col gap-y-4">
                      {filteredData.map((item, index) =>
                        renderItem(item, index)
                      )}
                    </div>
                  ) : (
                    emptyListPlaceholder
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
