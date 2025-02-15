import { Notification } from "@/models/notification";
import EmptyListPlaceholder from "../other/EmptyListPlaceholder";
import NotificationItem from "./notificationItem";
import { UseMutateFunction } from "@tanstack/react-query";

export default function NotificationList({
  notifications,
  handleMarkAsRead,
}: {
  notifications: Notification[];
  handleMarkAsRead: UseMutateFunction<
    Notification,
    Error,
    { notification: Notification },
    unknown
  >;
}) {
  return (
    <div>
      {notifications && notifications.length > 0 ? (
        <div className="flex flex-col gap-y-2">
          {notifications.map((notification: Notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              handleMarkAsRead={handleMarkAsRead}
            />
          ))}
        </div>
      ) : (
        <EmptyListPlaceholder
          title="No notifications yet"
          subtitle="We'll let you know when we've got something new for you."
        />
      )}
    </div>
  );
}
