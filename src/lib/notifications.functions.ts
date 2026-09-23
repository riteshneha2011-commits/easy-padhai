import { createServerFn } from "@tanstack/react-start";
import {
  getNotificationsForUser,
  getAllAdminNotifications,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  type CreateNotificationInput,
} from "./notifications.server";

export const getMyNotifications = createServerFn({ method: "GET" })
  .validator((d: { userId?: string | null; classLevel?: number | null } | undefined) => d || {})
  .handler(async ({ data }) => {
    return getNotificationsForUser(data.userId, data.classLevel);
  });

export const getAdminNotifications = createServerFn({ method: "GET" }).handler(async () => {
  return getAllAdminNotifications();
});

export const createNotificationFn = createServerFn({ method: "POST" })
  .validator((d: CreateNotificationInput) => d)
  .handler(async ({ data }) => {
    return createNotification(data);
  });

export const markReadFn = createServerFn({ method: "POST" })
  .validator((d: { notificationId: string; userId: string }) => d)
  .handler(async ({ data }) => {
    return markNotificationAsRead(data.notificationId, data.userId);
  });

export const markAllReadFn = createServerFn({ method: "POST" })
  .validator((d: { userId: string; classLevel?: number | null }) => d)
  .handler(async ({ data }) => {
    return markAllNotificationsAsRead(data.userId, data.classLevel);
  });

export const deleteNotificationFn = createServerFn({ method: "POST" })
  .validator((d: { notificationId: string }) => d)
  .handler(async ({ data }) => {
    return deleteNotification(data.notificationId);
  });
