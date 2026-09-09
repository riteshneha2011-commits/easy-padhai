import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { recordStudySeconds } from "@/lib/credits.functions";
import { useAuth } from "@/hooks/use-auth";
import { soundFx } from "@/lib/sound-effects";

export type StudyCelebrationState = {
  open: boolean;
  awarded: number;
  totalMinutes: number;
};

/**
 * Counts study seconds for a lesson and reliably flushes them to the server.
 * Uses `useServerFn` so TanStack Start attaches the Supabase authentication token.
 * `active` is true while the student is listening/watching or reading notes.
 */
export function useStudyHeartbeat(lessonId: string | null, active: boolean, enabled: boolean) {
  const seconds = useRef(0);
  const isFlushing = useRef(false);
  const queryClient = useQueryClient();
  const { refresh, addCreditsAndXp } = useAuth();
  const recordFn = useServerFn(recordStudySeconds);

  const [celebration, setCelebration] = useState<StudyCelebrationState | null>(null);

  const activeRef = useRef(active);
  activeRef.current = active;

  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const lessonIdRef = useRef(lessonId);
  lessonIdRef.current = lessonId;

  const recordFnRef = useRef(recordFn);
  recordFnRef.current = recordFn;

  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;

  const addCreditsAndXpRef = useRef(addCreditsAndXp);
  addCreditsAndXpRef.current = addCreditsAndXp;

  const closeCelebration = useCallback(() => {
    setCelebration(null);
  }, []);

  const flush = useCallback(async () => {
    const currentLesson = lessonIdRef.current;
    if (!currentLesson || !enabledRef.current || isFlushing.current) return;
    const value = seconds.current;
    if (value < 5) return;

    seconds.current = 0;
    isFlushing.current = true;

    try {
      const res = await recordFnRef.current({ data: { lessonId: currentLesson, seconds: value } });
      if (res && res.awarded > 0) {
        soundFx.playCelebration();
        addCreditsAndXpRef.current(res.awarded, 0);

        // Optimistically update React Query wallet cache
        queryClient.setQueriesData({ queryKey: ["wallet"] }, (old: any) => {
          if (!old) return old;
          return {
            ...old,
            credits: (res.newBalance != null ? res.newBalance : (old.credits ?? 0) + res.awarded),
          };
        });

        setCelebration({
          open: true,
          awarded: res.awarded,
          totalMinutes: res.totalMinutesToday || 10,
        });

        toast.success(`शाबाश! 🎉 +${res.awarded} Credits earned for 10 min of study!`);

        void queryClient.invalidateQueries({ queryKey: ["wallet"] });
        void queryClient.invalidateQueries({ queryKey: ["my-profile"] });
        void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        void refreshRef.current();
      }
    } catch (err) {
      console.warn("Heartbeat flush warning (will retry next tick):", err);
      // Put back unflushed seconds so no learner time is ever lost
      seconds.current += value;
    } finally {
      isFlushing.current = false;
    }
  }, [queryClient]);

  // Main study ticker: runs every 5 seconds without fragile teardowns
  useEffect(() => {
    const tick = window.setInterval(() => {
      if (!enabledRef.current || !lessonIdRef.current) return;
      if (!activeRef.current) return;

      seconds.current += 5;

      // Automatically flush every 25 seconds of active study
      if (seconds.current >= 25) {
        void flush();
      }
    }, 5000);

    // Also flush before user navigates away or closes tab
    const handleBeforeUnload = () => {
      void flush();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.clearInterval(tick);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      void flush();
    };
  }, [flush]);

  return {
    celebration,
    closeCelebration,
  };
}
