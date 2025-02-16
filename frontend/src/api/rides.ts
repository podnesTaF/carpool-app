import { RegisterForEventDto } from "@/models/dto/registerForEvent.dto";
import { PageResponse } from "@/models/pagination";
import { Ride } from "@/models/ride";
import api from "./apiInstance";

export const registerForEvent = async (
  eventId: number,
  ride: RegisterForEventDto,
  rideId?: string | null
) => {
  const { data } = await api.post<string>(
    `/event/${eventId}/register${rideId ? "?rideId=" + rideId : ""}`,
    ride
  );

  return data;
};

export const getAllRides = async (
  includeArchive?: boolean,
  driversOnly?: boolean,
  isActive?: boolean,
  page?: number,
  size?: number
) => {
  const params = new URLSearchParams();

  params.append("includeArchive", includeArchive ? "true" : "false");
  params.append("driversOnly", driversOnly ? "true" : "false");
  params.append("isActive", isActive ? "true" : "false");
  params.append("page", String(page ?? 0));
  params.append("size", String(size ?? 10));

  const { data } = await api.get<PageResponse<Ride>>(
    `/rides/all?${params.toString()}`
  );
  return data;
};

export const assignUsers = async (eventId: number) => {
  const { data } = await api.put<Ride[]>(`/rides/${eventId}/assign-users`);
  return data;
};

export const getEventRides = async (eventId: number) => {
  const { data } = await api.get<Ride[]>(`/rides/event/${eventId}`);
  return data;
};

export const getRideById = async (rideId?: number) => {
  const { data } = await api.get<Ride>(`/rides/${rideId}`);
  return data;
};

export const getUsersRides = async (type?: "driver" | "passenger") => {
  const { data } = await api.get<Ride[]>(`/rides/user?type=${type || ""}`);
  return data;
};

export const cancelRide = async (rideId?: number) => {
  const { data } = await api.delete<string>(`/rides/${rideId}`);

  return data;
};
