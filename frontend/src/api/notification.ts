import { Notification, NotificationType } from "@/models/notification";
import api from "./apiInstance";
import { User } from "@/models/user";

export const getNotification = async (
  id?: number | string
): Promise<Notification> => {
  if (!id) {
    throw new Error("Invalid ID");
  }
  const { data } = await api.get<Notification>(`/notifications/${id}`);

  return data;
};

export const postNotification = async (notification: {
  title: string;
  description: string;
  type: NotificationType;
  read: boolean;
  actions: string[] | null;
  user: User | null;
  sendDate: Date;
}) => {
  const { data } = await api.post<Notification>("/notifications", notification);

  return data;
};

export const deleteNotification = async (notificationId: number) => {
  const { data } = await api.delete<Notification>(
    `/notifications/${notificationId}`
  );

  return data;
};

export const updateNotification = async (
  notificationId: number,
  notification: Notification
) => {
  const { data } = await api.put<Notification>(
    `/notifications/${notificationId}`,
    notification
  );

  return data;
};

export const notifyEveryoneNewEvent = async (eventId: number) => {
  const res = await api.get(`notify/new-event/${eventId}`);

  return res;
};
