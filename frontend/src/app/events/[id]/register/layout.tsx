"use client";

import { getEvent } from "@/api/event";
import EventHeader from "@/components/events/EventHeader";
import Navbar from "@/components/nav/navbar";
import {
  eventRegisterSchema,
  EventRegisterSchema,
} from "@/utils/event-register-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { id } = useParams<{ id: string }>();
  const { data: event } = useQuery({
    queryKey: ["event", id],
    queryFn: () => getEvent(id),
    enabled: !!id,
  });

  const methods = useForm<EventRegisterSchema>({
    resolver: zodResolver(eventRegisterSchema),
    mode: "onChange",
  });

  return (
    <div>
      <Navbar />
      <div className="lg:ml-28 lg:mr-14">
        <div className="flex flex-col pt-24 items-center justify-center">
          <div className="flex flex-col gap-6 w-full px-4 mb-40">
            <EventHeader event={event} />
            <div className="max-w-3xl w-full mx-auto">
              <h4 className="font-bold mb-3">Location info</h4>
              <FormProvider {...methods}>{children}</FormProvider>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
