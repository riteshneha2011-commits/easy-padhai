// Sandboxed In-App IndexedDB Storage for Secure Offline Audio & Notes
// Content saved here cannot be accessed or shared via external file managers or media players.

export interface OfflineLessonData {
  id: string;
  chapter_id: string;
  title: string;
  kind: string;
  summary: string | null;
  duration_minutes: number | null;
  audio_blob?: Blob;
  pdf_blob?: Blob;
  downloaded_at: number;
  size_bytes: number;
}

const DB_NAME = "EasyPadhaiOfflineDB";
const DB_VERSION = 1;
const STORE_NAME = "offline_lessons";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB not supported"));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("chapter_id", "chapter_id", { unique: false });
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
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
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
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
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

/** Download a lesson's audio/notes into the private IndexedDB sandbox */
export async function downloadLessonForOffline(
  lesson: {
    id: string;
    chapter_id: string;
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
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
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
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
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
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
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
