import { User } from "./user";

export enum NotificationType {
  SYSTEM = "SYSTEM",
}

export enum NotificationActionType {
  VIEW_EVENT = "VIEW_EVENT",
  VIEW_RIDE = "VIEW_RIDE",
}

export interface NotificationAction {
  type: NotificationActionType;
  object_id: number | null;
}

export interface Notification {
  id: number;
  title: string;
  description: string;
  type: NotificationType;
  read: boolean;
  actions: NotificationAction[] | null;
  user: User | null;
  sendDate: string;
  _links?: Record<string, { href: string }>;
}
