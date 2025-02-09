import NotificationItem from "@/components/notifications/notificationItem";
import { Notification } from "@/models/notification";
import useAuthStore from "@/store/authStore";
import useStore from "@/store/store";
import { Client } from "@stomp/stompjs";
import React, { createContext, useContext, useEffect, useRef } from "react";
import { toast } from "sonner";

export type WebSocketContextType = Client | null;
const WebSocketContext = createContext<WebSocketContextType>(null);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const clientRef = useRef<Client | null>(null);
  const { user } = useAuthStore();
  const { setRefetchNotifications } = useStore();
  const userSubscriptionRef = useRef<any>(null);

  // Initialize STOMP client
  useEffect(() => {
    const client = new Client({
      brokerURL: process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8080/ws",
      connectHeaders: {
        // Add any authentication headers here if needed
      },
      onConnect: () => {
        console.log("STOMP connected");
        // Subscribe to general notifications
        client.subscribe("/topic/notifications", (message) => {
          const notification: Notification = JSON.parse(message.body);
          setRefetchNotifications(true);
          toast(<NotificationItem notification={notification} />);
        });
      },
      onDisconnect: () => {
        console.log("STOMP disconnected");
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame);
      },
    });

    clientRef.current = client;
    client.activate();

    return () => {
      if (userSubscriptionRef.current) {
        userSubscriptionRef.current.unsubscribe();
      }
      client.deactivate();
    };
  }, [setRefetchNotifications]);

  // Handle user-specific subscription
  useEffect(() => {
    const client = clientRef.current;
    if (!client || !client.connected) return;

    // Unsubscribe from previous user subscription if exists
    if (userSubscriptionRef.current) {
      userSubscriptionRef.current.unsubscribe();
      userSubscriptionRef.current = null;
    }

    // Subscribe to user-specific queue if user exists
    if (user?.id) {
      userSubscriptionRef.current = client.subscribe(
        `/user/queue/specific-user-user/${user.id}`,
        (message) => {
          const notification: Notification = JSON.parse(message.body);
          setRefetchNotifications(true);
          toast(<NotificationItem notification={notification} />);
        }
      );
    }

    return () => {
      if (userSubscriptionRef.current) {
        userSubscriptionRef.current.unsubscribe();
        userSubscriptionRef.current = null;
      }
    };
  }, [user?.id, setRefetchNotifications]); // Re-run when user ID changes

  return (
    <WebSocketContext.Provider value={clientRef.current}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  return useContext(WebSocketContext);
};
