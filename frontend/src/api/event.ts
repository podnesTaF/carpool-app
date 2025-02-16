import { Event } from "@/models/event";
import { Ride } from "@/models/ride";
import { EventCreationSchema } from "@/utils/event-register-schemas";
import api from "./apiInstance";

export const getEvents = async () => {
  const { data } = await api.get<Event[]>("/event/new");

  return data;
};

export const getEvent = async (id?: number | string): Promise<Event> => {
  if (!id) {
    throw new Error("Invalid ID");
  }
  const { data } = await api.get<Event>(`/event/${id}`);

  return data;
};

export const postEvent = async (event: EventCreationSchema) => {
  const { data } = await api.post<Event>("/events", event);

  return data;
};

export const deleteEvent = async (eventId: number) => {
  const { data } = await api.delete<Event>(`/events/${eventId}`);

  return data;
};

export const updateEvent = async (
  eventId: number,
  event: {
    title?: string;
    description?: string;
    startDateTime?: string | undefined;
    endDateTime?: string | undefined;
    address?: string;
    registerDeadline?: string | undefined;
    longitude?: number;
    latitude?: number;
    bannerUrl?: string;
    rides?: Ride[];
    archived?: boolean;
    id?: any;
  }
) => {
  const { data } = await api.put<Event>(`/events/${eventId}`, event);

  return data;
};
