import { EventEmitter } from "events";
import type { InAppAlertDTO } from "@/features/notifications/schemas";
import type { RoleName } from "@prisma/client";

export interface RealtimeNotificationPayload {
  alert: InAppAlertDTO;
  title?: string;
  targetUserIds?: string[];
  targetRoles?: RoleName[];
}

class NotificationEventEmitter extends EventEmitter {
  constructor() {
    super();
    // Allow generous concurrent connected browser sessions without warning
    this.setMaxListeners(1000);
  }

  broadcast(payload: RealtimeNotificationPayload) {
    this.emit("notification", payload);
  }
}

const globalForNotifications = globalThis as unknown as {
  notificationBus?: NotificationEventEmitter;
};

export const notificationBus =
  globalForNotifications.notificationBus || new NotificationEventEmitter();

globalForNotifications.notificationBus = notificationBus;
