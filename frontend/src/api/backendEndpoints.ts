import { Event } from "@/models/event";
import { Genre } from "@/models/genre";
import { Notification } from "@/models/notification";
import { Ride } from "@/models/ride";
import { User } from "@/models/user";
import { Vehicle } from "@/models/vehicle";
import { ProfileUpdateSchema } from "@/utils/user-schemas";
import api from "./apiInstance";

export const getUsers = async (): Promise<{
  _embedded: { users: Event[] };
}> => {
  const { data } = await api.get<{ _embedded: { users: Event[] } }>("/users");
  return data;
};

export const getUser = async ({
  queryKey,
}: {
  queryKey: [string, { id: string }];
}): Promise<User> => {
  const [, { id }] = queryKey;
  const { data } = await api.get<User>(`/users/${id}`);
  return data;
};

export const updateUser = async (
  userId: string,
  updatedUser: Omit<User, "preferredGenres"> | ProfileUpdateSchema
): Promise<User> => {
  const { data } = await api.put<User>(`/user/${userId}`, updatedUser);
  return data;
};

export const getRides = async (): Promise<{
  _embedded: { rides: Ride[] };
}> => {
  const { data } = await api.get<{ _embedded: { rides: Ride[] } }>("/rides");
  return data;
};

export const getRide = async ({
  queryKey,
}: {
  queryKey: [string, { id: string }];
}): Promise<Ride> => {
  const [, { id }] = queryKey;
  const { data } = await api.get<Ride>(`/rides/${id}`);
  return data;
};

export const getVehicles = async (): Promise<{
  _embedded: { vehicles: Vehicle[] };
}> => {
  const { data } = await api.get<{ _embedded: { vehicles: Vehicle[] } }>(
    "/vehicles"
  );
  return data;
};

export const getVehicle = async ({
  queryKey,
}: {
  queryKey: [string, { id: string }];
}): Promise<Vehicle> => {
  const [, { id }] = queryKey;
  const { data } = await api.get<Vehicle>(`/vehicles/${id}`);
  return data;
};

export const getGenres = async (): Promise<{
  _embedded: { genres: Genre[] };
}> => {
  const { data } = await api.get<{ _embedded: { genres: Genre[] } }>("/genres");
  return data;
};

export const getGenre = async ({
  queryKey,
}: {
  queryKey: [string, { id: string }];
}): Promise<Genre> => {
  const [, { id }] = queryKey;
  const { data } = await api.get<Genre>(`/genres/${id}`);
  return data;
};

export const getNotifications = async (): Promise<{
  _embedded: { notifications: Notification[] };
}> => {
  const { data } = await api.get<{
    _embedded: { notifications: Notification[] };
  }>("/notifications", {
    params: {
      sort: "sendDate,desc",
    },
  });
  return data;
};

export const isUserAdmin = async (auth0Sub: string): Promise<boolean> => {
  const { data } = await api.get<boolean>(`/auth/admin`, {
    params: { auth0Sub },
  });
  return data;
};

export const getNotification = async ({
  queryKey,
}: {
  queryKey: [string, { id: string }];
}): Promise<Notification> => {
  const [, { id }] = queryKey;
  const { data } = await api.get<Notification>(`/notifications/${id}`);
  return data;
};

export const getUserByAuth0Sub = async (auth0Sub: string): Promise<User> => {
  const { data } = await api.get<User>(`/users/search/findByAuth0Sub`, {
    params: { auth0Sub },
  });
  return data;
};
