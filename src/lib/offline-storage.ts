// Sandboxed In-App IndexedDB Storage for Secure Offline Audio & Notes
// Content saved here cannot be accessed or shared via external file managers or media players.

export interface OfflineLessonData {
  id: string;
  chapter_id: string;
  chapter_title?: string;
  subject_name?: string;
  chapter_slug?: string;
  title: string;
  kind: string;
  summary: string | null;
  duration_minutes: number | null;
  audio_blob?: Blob;
  pdf_blob?: Blob;
  downloaded_at: number;
  size_bytes: number;
}

export interface CachedChapterMeta {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  subject_id: string;
  subject_name: string;
  class_level: number;
  lessons: Array<{
    id: string;
    chapter_id: string;
    title: string;
    kind: string;
    summary: string | null;
    duration_minutes: number | null;
    order_index: number;
    isFree: boolean;
  }>;
}

const DB_NAME = "EasyPadhaiOfflineDB";
const DB_VERSION = 2;
const STORE_LESSONS = "offline_lessons";
const STORE_CHAPTERS = "cached_chapters";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB not supported"));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_LESSONS)) {
        const store = db.createObjectStore(STORE_LESSONS, { keyPath: "id" });
        store.createIndex("chapter_id", "chapter_id", { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_CHAPTERS)) {
        const chapStore = db.createObjectStore(STORE_CHAPTERS, { keyPath: "slug" });
        chapStore.createIndex("id", "id", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/** Check if a lesson is stored offline in the private IndexedDB sandbox */
export async function isLessonOffline(lessonId: string): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_LESSONS, "readonly");
      const store = tx.objectStore(STORE_LESSONS);
      const req = store.get(lessonId);
      req.onsuccess = () => resolve(Boolean(req.result));
      req.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

/** Get a single offline lesson record from IndexedDB */
export async function getOfflineLesson(lessonId: string): Promise<OfflineLessonData | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_LESSONS, "readonly");
      const store = tx.objectStore(STORE_LESSONS);
      const req = store.get(lessonId);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

/** Get an in-memory playback URL for offline audio / PDF */
export async function getOfflineMediaUrl(
  lessonId: string,
  type: "audio" | "pdf" = "audio",
): Promise<string | null> {
  try {
    const data = await getOfflineLesson(lessonId);
    if (!data) return null;
    const blob = type === "audio" ? data.audio_blob : data.pdf_blob;
    if (!blob) return null;
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}

/** Cache chapter metadata so chapters can be viewed offline */
export async function cacheChapterMeta(chapterData: CachedChapterMeta): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_CHAPTERS, "readwrite");
      const store = tx.objectStore(STORE_CHAPTERS);
      const req = store.put(chapterData);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("Could not cache chapter meta:", err);
  }
}

/** Retrieve cached chapter metadata when offline */
export async function getCachedChapterMeta(slug: string): Promise<CachedChapterMeta | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_CHAPTERS, "readonly");
      const store = tx.objectStore(STORE_CHAPTERS);
      const req = store.get(slug);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

/** Download a lesson's audio/notes into the private IndexedDB sandbox */
export async function downloadLessonForOffline(
  lesson: {
    id: string;
    chapter_id: string;
    chapter_title?: string;
    subject_name?: string;
    chapter_slug?: string;
    title: string;
    kind: string;
    summary: string | null;
    duration_minutes: number | null;
  },
  audioUrl?: string | null,
  pdfUrl?: string | null,
  onProgress?: (percent: number) => void,
): Promise<void> {
  let audioBlob: Blob | undefined;
  let pdfBlob: Blob | undefined;
  let totalBytes = 0;

  if (onProgress) onProgress(10);

  if (audioUrl) {
    try {
      const res = await fetch(audioUrl);
      if (!res.ok) throw new Error("Audio download failed");
      audioBlob = await res.blob();
      totalBytes += audioBlob.size;
    } catch (err) {
      console.warn("Could not download audio stream:", err);
    }
  }

  if (onProgress) onProgress(70);

  if (pdfUrl) {
    try {
      const res = await fetch(pdfUrl);
      if (res.ok) {
        pdfBlob = await res.blob();
        totalBytes += pdfBlob.size;
      }
    } catch {}
  }

  if (onProgress) onProgress(90);

  const record: OfflineLessonData = {
    id: lesson.id,
    chapter_id: lesson.chapter_id,
    chapter_title: lesson.chapter_title,
    subject_name: lesson.subject_name,
    chapter_slug: lesson.chapter_slug,
    title: lesson.title,
    kind: lesson.kind,
    summary: lesson.summary,
    duration_minutes: lesson.duration_minutes,
    audio_blob: audioBlob,
    pdf_blob: pdfBlob,
    downloaded_at: Date.now(),
    size_bytes: totalBytes,
  };

  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_LESSONS, "readwrite");
    const store = tx.objectStore(STORE_LESSONS);
    const req = store.put(record);
    req.onsuccess = () => {
      if (onProgress) onProgress(100);
      resolve();
    };
    req.onerror = () => reject(req.error);
  });
}

/** Delete a downloaded lesson from the device to free storage */
export async function removeOfflineLesson(lessonId: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_LESSONS, "readwrite");
      const store = tx.objectStore(STORE_LESSONS);
      const req = store.delete(lessonId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error("Failed to delete offline lesson:", err);
  }
}

/** List all offline saved lessons */
export async function listAllOfflineLessons(): Promise<OfflineLessonData[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_LESSONS, "readonly");
      const store = tx.objectStore(STORE_LESSONS);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

/** Calculate total storage used in MB */
export async function getOfflineStorageUsage(): Promise<{
  totalBytes: number;
  formatted: string;
  count: number;
}> {
  const lessons = await listAllOfflineLessons();
  const totalBytes = lessons.reduce((acc, curr) => acc + (curr.size_bytes || 0), 0);
  const mb = (totalBytes / (1024 * 1024)).toFixed(1);
  return {
    totalBytes,
    formatted: `${mb} MB`,
    count: lessons.length,
  };
}
