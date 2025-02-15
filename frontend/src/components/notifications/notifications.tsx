"use client";

import { getNotifications } from "@/api/backendEndpoints";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import NotificationList from "@/components/notifications/notificationList";
import { useQuery, useMutation } from "@tanstack/react-query";
import { updateNotification } from "@/api/notification";
import { Notification } from "@/models/notification";
import useStore from "@/store/store";
import { useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import TooltipButton from "@/components/other/TooltipButton";
import { toast } from "sonner";

const NotificationBlock = () => {
  const { data, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
  });

  const { refetchNotifications, setRefetchNotifications } = useStore();

  const { mutate: handleUpdateNotification } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Notification }) =>
      updateNotification(id, data),
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      console.log(`Error updating notification: ${error}`);
    },
  });

  const { mutate: handleMarkAsRead } = useMutation({
    mutationFn: ({ notification }: { notification: Notification }) =>
      updateNotification(notification.id, {
        ...notification,
        read: true,
      }),
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      console.log(`Error updating notification: ${error}`);
    },
  });

  useEffect(() => {
    const fetchNotifications = async () => {
      refetch();
      setRefetchNotifications(false);
    };

    if (refetchNotifications) {
      fetchNotifications();
    }
  }, [refetch, refetchNotifications, setRefetchNotifications]);

  function handleMarkAllAsRead() {
    const updated_notifications = data?._embedded.notifications
      .filter((notification) => notification.read === false)
      .map((notification) => {
        return {
          ...notification,
          read: true,
        };
      });

    updated_notifications?.forEach((notification) =>
      handleUpdateNotification({ id: notification.id, data: notification })
    );

    toast.success("All notifications marked as read");
  }

  return (
    <div className="w-full mx-auto px-2 py-8 flex flex-col justify-center items-center">
      <h2 className="text-2xl lg:text-3xl text-center font-semibold lg:my-4">
        Notifications
      </h2>
      <div>
        <Tabs defaultValue="all" className="w-full max-w-96">
          <div className="flex gap-x-4 justify-center">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="read">Read</TabsTrigger>
            </TabsList>
            <TooltipButton
              tooltip="Mark all notifications as read"
              tooltipClass="bg-red-800/80"
              buttonProps={{
                className: "bg-destructive hover:bg-destructive/80",
                type: "button",
                onClick: () => {
                  handleMarkAllAsRead();
                },
              }}
              icon={<Icon icon={"mdi:eye"} />}
            />
          </div>

          <TabsContent
            value="all"
            className="md:overflow-y-auto overflow-visible max-h-fit md:max-h-[55vh] [&::-webkit-scrollbar]:w-2
  [&::-webkit-scrollbar-track]:rounded-full
  [&::-webkit-scrollbar-track]:bg-gray-100
  [&::-webkit-scrollbar-thumb]:rounded-full
  [&::-webkit-scrollbar-thumb]:bg-gray-300
  dark:[&::-webkit-scrollbar-track]:bg-neutral-700
  dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
          >
            {data?._embedded.notifications ? (
              <NotificationList
                notifications={data?._embedded.notifications}
                handleMarkAsRead={handleMarkAsRead}
              ></NotificationList>
            ) : null}
          </TabsContent>
          <TabsContent
            value="unread"
            className="overflow-y-auto max-h-[55vh]   [&::-webkit-scrollbar]:w-2
  [&::-webkit-scrollbar-track]:rounded-full
  [&::-webkit-scrollbar-track]:bg-gray-100
  [&::-webkit-scrollbar-thumb]:rounded-full
  [&::-webkit-scrollbar-thumb]:bg-gray-300
  dark:[&::-webkit-scrollbar-track]:bg-neutral-700
  dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
          >
            {data?._embedded.notifications ? (
              <NotificationList
                handleMarkAsRead={handleMarkAsRead}
                notifications={data?._embedded.notifications.filter(
                  (notification) => notification.read === false
                )}
              ></NotificationList>
            ) : null}
          </TabsContent>
          <TabsContent
            value="read"
            className="overflow-y-auto max-h-[55vh]   [&::-webkit-scrollbar]:w-2
  [&::-webkit-scrollbar-track]:rounded-full
  [&::-webkit-scrollbar-track]:bg-gray-100
  [&::-webkit-scrollbar-thumb]:rounded-full
  [&::-webkit-scrollbar-thumb]:bg-gray-300
  dark:[&::-webkit-scrollbar-track]:bg-neutral-700
  dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
          >
            {data?._embedded.notifications.length ? (
              <NotificationList
                handleMarkAsRead={handleMarkAsRead}
                notifications={data?._embedded.notifications.filter(
                  (notification) => notification.read === true
                )}
              ></NotificationList>
            ) : null}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NotificationBlock;
