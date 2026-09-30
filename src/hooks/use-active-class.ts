import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./use-auth";
import { updateMyClassLevel } from "@/lib/profile.functions";
import {
  DEFAULT_CLASS_LEVEL,
  normalizeClassLevel,
  classOrdinalLabel,
  getAllActiveClasses,
  saveCustomClass,
} from "@/lib/classes";
import { toast } from "sonner";

const STORAGE_KEY = "easy-padhai-active-class";

export function useActiveClass() {
  const { user, profile, refresh } = useAuth();

  const [classesList, setClassesList] = useState<number[]>(() => getAllActiveClasses());

  const [activeClass, setActiveClass] = useState<number>(() => {
    if (typeof window === "undefined") return DEFAULT_CLASS_LEVEL;
    try {
      if (profile?.class_level) return normalizeClassLevel(profile.class_level);
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return normalizeClassLevel(saved);
      return DEFAULT_CLASS_LEVEL;
    } catch {
      return DEFAULT_CLASS_LEVEL;
    }
  });

  // Track whether we synced the logged-in user's profile class
  const syncedUserIdRef = useRef<string | null>(null);

  // Sync when user logs in or profile loads:
  // For a logged-in student, their account class_level ALWAYS sets their active view on login!
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (user && profile?.class_level) {
      if (syncedUserIdRef.current !== user.id) {
        syncedUserIdRef.current = user.id;
        const norm = normalizeClassLevel(profile.class_level);
        setActiveClass(norm);
        try {
          localStorage.setItem(STORAGE_KEY, String(norm));
        } catch {
          // ignore
        }
      }
    } else if (!user) {
      syncedUserIdRef.current = null;
    }
  }, [user, profile?.class_level]);

  // Sync across components and browser tabs
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleCustomChange = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setActiveClass(normalizeClassLevel(saved));
      } catch {
        // ignore
      }
    };

    const handleClassesChange = () => {
      setClassesList(getAllActiveClasses());
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        setActiveClass(normalizeClassLevel(e.newValue));
      }
      if (e.key === "easypadhai_custom_classes") {
        setClassesList(getAllActiveClasses());
      }
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("easy-padhai-class-changed", handleCustomChange);
    window.addEventListener("easypadhai-classes-updated", handleClassesChange);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("easy-padhai-class-changed", handleCustomChange);
      window.removeEventListener("easypadhai-classes-updated", handleClassesChange);
    };
  }, []);

  const switchClass = useCallback(
    async (newLevel: number) => {
      const norm = normalizeClassLevel(newLevel);
      setActiveClass(norm);
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
          await updateMyClassLevel({ data: { class_level: norm } });
          void refresh();
        } catch (err) {
          console.error("profile class update error", err);
        }
      }

      toast.success(`Switched to ${classOrdinalLabel(norm)}`);
    },
    [user, refresh],
  );

  const addClass = useCallback((newLevel: number) => {
    const updated = saveCustomClass(newLevel);
    setClassesList(getAllActiveClasses());
    toast.success(`Added ${classOrdinalLabel(newLevel)} to platform classes!`);
    return updated;
  }, []);

  return {
    activeClass,
    switchClass,
    addClass,
    allClasses: classesList,
    classLabel: classOrdinalLabel,
  };
}

