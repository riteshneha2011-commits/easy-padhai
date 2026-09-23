import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useActiveClass } from "@/hooks/use-active-class";

/**
 * Global Realtime Content & Notification Sync Hook.
 * Automatically synchronizes student client when:
 * 1. An admin uploads, publishes, or updates a lesson or chapter via Supabase Realtime WebSockets.
 * 2. An admin broadcasts an announcement or alert.
 * 3. The learner unlocks their device or returns to the browser tab (visibilitychange / focus).
 */
export function useRealtimeContentSync() {
  const qc = useQueryClient();
  const { activeClass } = useActiveClass();
  const lastSyncRef = useRef<number>(Date.now());

  // 1. Window Focus & Tab Visibility Auto-Revalidation
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        const now = Date.now();
        // Throttle focus revalidation to once every 10 seconds to avoid spamming
        if (now - lastSyncRef.current > 10_000) {
          lastSyncRef.current = now;
          void qc.invalidateQueries({ queryKey: ["catalog"] });
          void qc.invalidateQueries({ queryKey: ["chapter"] });
          void qc.invalidateQueries({ queryKey: ["my-notifications"] });
        }
      }
    };

    window.addEventListener("focus", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);

    return () => {
      window.removeEventListener("focus", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
    };
  }, [qc]);

  // 2. Supabase Realtime WebSocket Subscriptions
  useEffect(() => {
    if (typeof window === "undefined" || !supabase) return;

    // A. Lessons channel: auto-refetch catalog & chapter when lessons are added/updated
    const lessonsChannel = supabase
      .channel("realtime:public:lessons")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "lessons" },
        (payload) => {
          lastSyncRef.current = Date.now();
          void qc.invalidateQueries({ queryKey: ["catalog"] });
          void qc.invalidateQueries({ queryKey: ["admin-catalog"] });
          void qc.invalidateQueries({ queryKey: ["chapter"] });
          void qc.invalidateQueries({ queryKey: ["learn"] });

          if (payload.eventType === "INSERT") {
            const newLesson = payload.new as any;
            if (newLesson && newLesson.published) {
              toast.info(`🎉 New lecture live: ${newLesson.title}`, {
                duration: 5000,
                description: "Curriculum has been updated with the latest content.",
              });
            }
          }
        },
      )
      .subscribe();

    // B. Chapters channel: auto-refetch when chapters are added/updated
    const chaptersChannel = supabase
      .channel("realtime:public:chapters")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chapters" },
        () => {
          lastSyncRef.current = Date.now();
          void qc.invalidateQueries({ queryKey: ["catalog"] });
          void qc.invalidateQueries({ queryKey: ["admin-catalog"] });
          void qc.invalidateQueries({ queryKey: ["chapter"] });
          void qc.invalidateQueries({ queryKey: ["learn"] });
        },
      )
      .subscribe();

    // C. Notifications channel: live alerts and bell badge updates
    const notificationsChannel = supabase
      .channel("realtime:public:notifications")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        (payload) => {
          lastSyncRef.current = Date.now();
          void qc.invalidateQueries({ queryKey: ["my-notifications"] });
          void qc.invalidateQueries({ queryKey: ["admin-notifications"] });

          if (payload.eventType === "INSERT") {
            const notif = payload.new as any;
            if (
              notif &&
              (!notif.target_class || notif.target_class === activeClass)
            ) {
              toast(notif.title || "📢 New Announcement", {
                description: notif.message,
                duration: 6000,
              });
            }
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(lessonsChannel);
      void supabase.removeChannel(chaptersChannel);
      void supabase.removeChannel(notificationsChannel);
    };
  }, [qc, activeClass]);
}
