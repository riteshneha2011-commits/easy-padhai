import { supabase } from "@/integrations/supabase/client";

export const LESSON_BUCKET = "lesson-media";
export const STORAGE_PREFIX = "storage://";
export const R2_PREFIX = "r2://";

const R2_PUBLIC_BASE = (
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_R2_PUBLIC_URL) ||
  "https://pub-5b335ec07c414198abab2b3fd75d60cd.r2.dev"
).replace(/\/+$/, "");

export function isStorageRef(value: string | null | undefined) {
  return !!value && value.startsWith(STORAGE_PREFIX);
}

export function isR2Ref(value: string | null | undefined) {
  return !!value && value.startsWith(R2_PREFIX);
}

export function storagePath(value: string) {
  return value.slice(STORAGE_PREFIX.length);
}

export function resolveR2UrlClient(value: string) {
  if (value.startsWith(R2_PREFIX)) {
    return `${R2_PUBLIC_BASE}/${value.slice(R2_PREFIX.length)}`;
  }
  return value;
}

/** Uploads a file into the private lesson-media bucket and returns a storage:// reference. */
export async function uploadLessonFile(file: File, folder: string) {
  const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
  const safe = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from(LESSON_BUCKET).upload(safe, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw error;
  return `${STORAGE_PREFIX}${safe}`;
}

/** Turns a stored value into a playable URL. External links pass through unchanged. */
export async function resolveMediaUrl(value: string | null | undefined) {
  if (!value) return null;
  if (isR2Ref(value)) {
    return resolveR2UrlClient(value);
  }
  if (!isStorageRef(value)) return value;
  const { data, error } = await supabase.storage
    .from(LESSON_BUCKET)
    .createSignedUrl(storagePath(value), 60 * 60 * 4);
  if (error) return null;
  return data?.signedUrl ?? null;
}
