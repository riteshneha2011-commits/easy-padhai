import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./use-auth";
import { saveMyProfile } from "@/lib/profile.functions";
import { DEFAULT_CLASS_LEVEL, normalizeClassLevel, ALL_CLASS_LEVELS, classOrdinalLabel } from "@/lib/classes";
import { toast } from "sonner";

const STORAGE_KEY = "easy-padhai-active-class";

export function useActiveClass() {
  const { user, profile, refresh } = useAuth();

  const [localClass, setLocalClass] = useState<number>(() => {
    if (typeof window === "undefined") return DEFAULT_CLASS_LEVEL;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? normalizeClassLevel(saved) : DEFAULT_CLASS_LEVEL;
    } catch {
      return DEFAULT_CLASS_LEVEL;
    }
  });

  // If user is logged in and has a profile class_level, prioritize profile
  const activeClass = profile?.class_level ? normalizeClassLevel(profile.class_level) : localClass;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleCustomChange = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setLocalClass(normalizeClassLevel(saved));
      } catch {
        // ignore
      }
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        setLocalClass(normalizeClassLevel(e.newValue));
      }
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("easy-padhai-class-changed", handleCustomChange);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("easy-padhai-class-changed", handleCustomChange);
    };
  }, []);

  const switchClass = useCallback(
    async (newLevel: number) => {
      const norm = normalizeClassLevel(newLevel);
      setLocalClass(norm);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_KEY, String(norm));
          window.dispatchEvent(new Event("easy-padhai-class-changed"));
        } catch {
          // ignore
        }
      }

      if (user) {
        try {
          await saveMyProfile({ data: { class_level: norm } });
          void refresh();
        } catch (err) {
          console.error("profile class update error", err);
        }
      }

      toast.success(`Switched to ${classOrdinalLabel(norm)}`);
    },
    [user, refresh],
  );

  return {
    activeClass,
    switchClass,
    allClasses: ALL_CLASS_LEVELS,
    classLabel: classOrdinalLabel,
  };
}
