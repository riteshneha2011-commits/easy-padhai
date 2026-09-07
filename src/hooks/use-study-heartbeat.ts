import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { recordStudySeconds } from "@/lib/credits.functions";
import { useAuth } from "@/hooks/use-auth";
import { soundFx } from "@/lib/sound-effects";

/**
 * Counts study seconds for a lesson and flushes them to the server.
 * `active` should only be true while the student is actually watching/listening.
 */
export function useStudyHeartbeat(lessonId: string | null, active: boolean, enabled: boolean) {
  const seconds = useRef(0);
  const queryClient = useQueryClient();
  const { refresh } = useAuth();

  useEffect(() => {
    if (!lessonId || !enabled) return;

    const flush = () => {
      const value = seconds.current;
      if (value < 5) return;
      seconds.current = 0;
      recordStudySeconds({ data: { lessonId, seconds: value } })
        .then((res) => {
          if (res && res.awarded > 0) {
            soundFx.playSuccess();
            toast.success(`🎉 +${res.awarded} Credits earned for 10 min of study! Keep it up!`);
            void queryClient.invalidateQueries({ queryKey: ["wallet"] });
            void queryClient.invalidateQueries({ queryKey: ["my-profile"] });
            void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
            void refresh();
          }
        })
        .catch(() => {
          /* non-critical */
        });
    };

    const tick = window.setInterval(() => {
      if (!active) return;
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
      seconds.current += 5;
      if (seconds.current >= 60) flush();
    }, 5000);

    return () => {
      window.clearInterval(tick);
      flush();
    };
  }, [lessonId, active, enabled, queryClient, refresh]);
}
