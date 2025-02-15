import {
  Notification,
  NotificationActionType,
  NotificationType,
} from "@/models/notification";
import { formatDate } from "@/utils/time-helpers";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Button } from "../ui/button";
import Image from "next/image";
import Link from "next/link";
import { UseMutateFunction } from "@tanstack/react-query";

export default function NotificationItem({
  notification,
  handleMarkAsRead,
}: {
  notification: Notification;
  handleMarkAsRead?: UseMutateFunction<
    Notification,
    Error,
    { notification: Notification },
    unknown
  >;
}) {
  return (
    <div
      className={`flex gap-x-4 my-2 justify items-center p-2 rounded-lg transition-colors duration-200 
        ${
          notification.read
            ? "bg-gray-100 opacity-70"
            : "bg-white hover:bg-gray-50 cursor-pointer"
        }`}
      onClick={() => handleMarkAsRead && handleMarkAsRead({ notification })}
    >
      {notification.type === NotificationType.SYSTEM && (
        <Icon
          icon="ion:flash"
          width={60}
          height={60}
          color="gray"
          className="rounded-full p-1 bg-gray-200 flex-shrink-0"
        />
      )}
      {notification.user?.avatarUrl !== undefined &&
        notification.user?.avatarUrl !== null && (
          <Image
            src={`/${notification.user?.avatarUrl}`}
            alt="User Avatar"
            width={60}
            height={60}
          />
        )}
      <div className="flex flex-col w-full">
        <h2 className="text-lg">{notification.title}</h2>
        <p className="text-sm p-2">{notification.description}</p>
        <p className="text-xs text-gray-400">
          {formatDate(notification.sendDate.toString(), true)}
        </p>
        {notification.actions?.map((action) => (
          <Link
            key={`key_${action.object_id}_${action.type}`}
            href={
              action.type === NotificationActionType.VIEW_EVENT
                ? `/events/${action.object_id}`
                : action.type === NotificationActionType.VIEW_RIDE
                ? `/carpools/${action.object_id}`
                : "#"
            }
          >
            <Button
              className="my-4 bg-transparent text-black shadow-none border-2 border-secondary-medium w-full"
              variant={"outline"}
            >
              <div>
                {(() => {
                  switch (action.type) {
                    case NotificationActionType.VIEW_EVENT:
                      return "View Event";
                    case NotificationActionType.VIEW_RIDE:
                      return "View Carpool";
                    default:
                      return action.type;
                  }
                })()}
              </div>
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}
