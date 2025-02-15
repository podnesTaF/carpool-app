"use client";

import NotificationBlock from "@/components/notifications/notifications";

const Notifications = () => {
  return (
    <div className="lg:ml-28 lg:mr-14">
      <div className="flex flex-col pt-24 items-center justify-center">
        <div className="flex flex-col items-center justify-center w-full h-full px-2 lg:px-0 bg-gray-100 rounded-2xl">
          <div className="flex flex-col justify-center items-center w-full h-10 lg:h-20 rounded-t-2xl bg-gradient-to-r from-primary to-secondary-medium"></div>
          <NotificationBlock />
        </div>
      </div>
    </div>
  );
};

export default Notifications;
