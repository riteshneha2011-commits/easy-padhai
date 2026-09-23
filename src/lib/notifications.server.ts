import { supabaseAdmin } from "@/integrations/supabase/client.server";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  action_url?: string | null;
  target_class?: number | null;
  target_subject_id?: string | null;
  type: "broadcast" | "lecture" | "chapter" | "challenge";
  created_by?: string | null;
  created_at: string;
  is_read?: boolean;
}

export interface CreateNotificationInput {
  title: string;
  message: string;
  action_url?: string | null;
  target_class?: number | null;
  target_subject_id?: string | null;
  type?: "broadcast" | "lecture" | "chapter" | "challenge";
  created_by?: string | null;
}

/**
 * Fetch notifications applicable to a user (filtered by target class or global)
 * Safely falls back if the table doesn't exist yet in Supabase.
 */
export async function getNotificationsForUser(
  userId?: string | null,
  classLevel?: number | null,
): Promise<AppNotification[]> {
  try {
    let query = supabaseAdmin
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30);

    if (classLevel) {
      // Global notifications (target_class is null) or specific to this class
      query = query.or(`target_class.is.null,target_class.eq.${classLevel}`);
    }

    const { data: notifications, error } = await query;
    if (error) {
      // If table doesn't exist yet or permission error, gracefully return empty
      console.warn("[Notifications] fetch warning (table may need migration):", error.message);
      return [];
    }

    if (!notifications || notifications.length === 0) {
      return [];
    }

    // If user is logged in, find which notifications they've read
    let readIds = new Set<string>();
    if (userId) {
      try {
        const notifIds = notifications.map((n) => n.id);
        const { data: reads } = await supabaseAdmin
          .from("notification_reads")
          .select("notification_id")
          .eq("user_id", userId)
          .in("notification_id", notifIds);

        if (reads) {
          reads.forEach((r) => readIds.add(r.notification_id));
        }
      } catch (err) {
        // Silently tolerate if notification_reads is empty
      }
    }

    return notifications.map((n) => ({
      ...n,
      is_read: userId ? readIds.has(n.id) : false,
    }));
  } catch (err: any) {
    console.warn("[Notifications] Unexpected error in getNotificationsForUser:", err?.message);
    return [];
  }
}

/**
 * Admin: Fetch all recent notifications regardless of class
 */
export async function getAllAdminNotifications(): Promise<AppNotification[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.warn("[Notifications] Admin fetch warning:", error.message);
      return [];
    }
    return data || [];
  } catch (err: any) {
    console.warn("[Notifications] Unexpected error in getAllAdminNotifications:", err?.message);
    return [];
  }
}

/**
 * Create a new notification (broadcast or automated on publish)
 */
export async function createNotification(
  input: CreateNotificationInput,
): Promise<AppNotification | null> {
  try {
    const record = {
      title: input.title.trim(),
      message: input.message.trim(),
      action_url: input.action_url?.trim() || null,
      target_class: input.target_class ?? null,
      target_subject_id: input.target_subject_id || null,
      type: input.type || "broadcast",
      created_by: input.created_by || null,
    };

    const { data, error } = await supabaseAdmin
      .from("notifications")
      .insert(record)
      .select("*")
      .single();

    if (error) {
      console.error("[Notifications] Create error:", error.message);
      throw new Error(`Failed to create notification: ${error.message}`);
    }

    return data;
  } catch (err: any) {
    console.error("[Notifications] Unexpected error in createNotification:", err?.message);
    return null;
  }
}

/**
 * Mark a single notification as read for a user
 */
export async function markNotificationAsRead(
  notificationId: string,
  userId: string,
): Promise<boolean> {
  if (!userId || !notificationId) return false;
  try {
    const { error } = await supabaseAdmin.from("notification_reads").upsert(
      {
        notification_id: notificationId,
        user_id: userId,
        read_at: new Date().toISOString(),
      },
      { onConflict: "notification_id,user_id" },
    );

    if (error) {
      console.warn("[Notifications] Mark read warning:", error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn("[Notifications] Error in markNotificationAsRead:", err?.message);
    return false;
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(
  userId: string,
  classLevel?: number | null,
): Promise<boolean> {
  if (!userId) return false;
  try {
    const notifications = await getNotificationsForUser(userId, classLevel);
    const unread = notifications.filter((n) => !n.is_read);

    if (unread.length === 0) return true;

    const rows = unread.map((n) => ({
      notification_id: n.id,
      user_id: userId,
      read_at: new Date().toISOString(),
    }));

    const { error } = await supabaseAdmin
      .from("notification_reads")
      .upsert(rows, { onConflict: "notification_id,user_id" });

    if (error) {
      console.warn("[Notifications] Mark all read warning:", error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn("[Notifications] Error in markAllNotificationsAsRead:", err?.message);
    return false;
  }
}

/**
 * Delete a notification by ID (Admin only)
 */
export async function deleteNotification(notificationId: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from("notifications")
      .delete()
      .eq("id", notificationId);

    if (error) {
      console.error("[Notifications] Delete error:", error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.error("[Notifications] Error in deleteNotification:", err?.message);
    return false;
  }
}
