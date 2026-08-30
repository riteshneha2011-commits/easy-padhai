import { supabase } from "@/integrations/supabase/client";

export const LESSON_BUCKET = "lesson-media";
export const STORAGE_PREFIX = "storage://";

export function isStorageRef(value: string | null | undefined) {
  return !!value && value.startsWith(STORAGE_PREFIX);
}

export function storagePath(value: string) {
  return value.slice(STORAGE_PREFIX.length);
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
  if (!isStorageRef(value)) return value;
  const { data, error } = await supabase.storage
    .from(LESSON_BUCKET)
    .createSignedUrl(storagePath(value), 60 * 60 * 4);
  if (error) return null;
  return data?.signedUrl ?? null;
}
