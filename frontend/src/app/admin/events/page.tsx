"use client";

import { getEvents } from "@/api/event";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDate } from "@/utils/time-helpers";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function AdminEvents() {
  const { data, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: getEvents,
  });
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEvents = data?.filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <>
      <div className="lg:ml-28 lg:mr-14 pt-24">
        <div className="flex flex-col items-center justify-center w-full h-full px-2 lg:px-0">
          <div className="flex flex-col w-full h-10 lg:h-20 rounded-t-2xl bg-gradient-to-r from-primary to-secondary-medium"></div>
          <div className="flex flex-col w-full bg-gray-100 rounded-b-2xl lg:px-5">
            <div className="p-5 flex flex-col">
              <div className="flex justify-between items-center gap-5">
                <div className="text-xl lg:text-3xl text-black font-semibold">
                  Manage Events
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href={"/admin"}>
                      <Button variant={"default"}>
                        <Icon icon={"mdi:arrow-left"} />
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-white text-xs">Back to admin overview</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              {isLoading ? (
                <div className="w-full h-full bg-primary-white rounded-lg p-5 mt-5">
                  <p className="text-lg text-gray-600 flex gap-2 justify-start items-center">
                    <Icon icon={"mdi:loading"} className="animate-spin" />
                    Loading events...
                  </p>
                </div>
              ) : (
                <>
                  {filteredEvents && data && data.length > 0 ? (
                    <div className="w-full h-full bg-primary-white rounded-lg p-5 mt-5 shadow-lg">
                      <div className="flex flex-col gap-2 lg:flex-row lg:justify-between lg:items-center mb-4">
                        <div className="relative w-full lg:w-1/3">
                          <Input
                            type="text"
                            placeholder="Search events..."
                            className="p-2 pl-10 border border-gray-300 rounded-lg w-full"
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                          <Icon
                            icon="mdi:magnify"
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            width={20}
                            height={20}
                          />
                        </div>
                        <div className="text-sm lg:text-base text-gray-600 flex items-center justify-between gap-5">
                          <span>{filteredEvents.length} results</span>
                          {!isLoading && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link href={"/admin/events/create"}>
                                  <Button className="bg-primary-orange hover:bg-primary-orange/80">
                                    <Icon icon={"uil:plus"} />
                                  </Button>
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent className="bg-primary-orange/80">
                                <p className="text-white text-xs">Add event</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </div>
                      <table className="table-fixed w-full">
                        <thead className="border-b-2 rounded-full border-gray-300">
                          <tr>
                            <th className="hidden lg:table-cell lg:w-1/12">
                              Image
                            </th>
                            <th className="w-3/4 lg:w-auto">Title</th>
                            <th className="hidden lg:table-cell lg:w-2/12">
                              Date &amp; Time
                            </th>
                            <th className="hidden lg:table-cell">Address</th>
                            <th className="hidden lg:table-cell w-2/6">
                              Description
                            </th>
                            <th className="w-1/4 lg:w-1/12">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-300 lg:text-center">
                          {filteredEvents.map((event) => (
                            <tr
                              key={event.id}
                              className={` ${
                                event.archived
                                  ? "odd:bg-red-50 even:bg-red-100 hover:bg-red-200"
                                  : "odd:bg-gray-50 even:bg-gray-100 hover:bg-secondary-light/50"
                              }`}
                            >
                              <td className="p-2 hidden lg:table-cell">
                                <Image
                                  src={event.bannerUrl}
                                  width={100}
                                  height={100}
                                  alt={"Event Banner"}
                                />
                              </td>
                              <td className="p-2 truncate">{event.title}</td>
                              <td className="p-2 hidden lg:table-cell">
                                {formatDate(event.startDateTime, true)}
                              </td>
                              <td className="p-2 hidden lg:table-cell truncate">
                                {event.address}
                              </td>
                              <td className="p-2 hidden lg:table-cell truncate">
                                {event.description}
                              </td>
                              <td className="p-2">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Link
                                      href={`/admin/events/create?eventId=${event.id}`}
                                    >
                                      <Button
                                        variant={"default"}
                                        className="bg-secondary hover:bg-primary-orange"
                                      >
                                        <Icon
                                          icon={"mdi:edit"}
                                          width={25}
                                          height={25}
                                          className="text-primary-white"
                                        />
                                      </Button>
                                    </Link>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-primary-orange/80 mb-2">
                                    <p className="text-white text-xs">
                                      Edit event
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-primary-white rounded-lg p-5 mt-5 flex justify-between items-center">
                      <p className="text-lg text-gray-600">No events found</p>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link href={"/admin/events/create"}>
                            <Button className="bg-primary-orange hover:bg-primary-orange/80">
                              <Icon icon={"uil:plus"} />
                            </Button>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent className="bg-primary-orange/80 mb-1">
                          <p className="text-white text-xs">Add event</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
