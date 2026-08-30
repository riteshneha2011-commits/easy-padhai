import { useEffect, useRef } from "react";
import { recordStudySeconds } from "@/lib/credits.functions";

/**
 * Counts study seconds for a lesson and flushes them to the server every 60s.
 * `active` should only be true while the student is actually watching/listening.
 */
export function useStudyHeartbeat(lessonId: string | null, active: boolean, enabled: boolean) {
  const seconds = useRef(0);

  useEffect(() => {
    if (!lessonId || !enabled) return;

    const flush = () => {
      const value = seconds.current;
      if (value < 20) return;
      seconds.current = 0;
      recordStudySeconds({ data: { lessonId, seconds: value } }).catch(() => {
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
  }, [lessonId, active, enabled]);
}
