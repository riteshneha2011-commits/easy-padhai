import { t as supabase } from "./client-Bt-p7qWF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/storage-CweImSLh.js
var LESSON_BUCKET = "lesson-media";
var STORAGE_PREFIX = "storage://";
function isStorageRef(value) {
	return !!value && value.startsWith("storage://");
}
function storagePath(value) {
	return value.slice(10);
}
/** Uploads a file into the private lesson-media bucket and returns a storage:// reference. */
async function uploadLessonFile(file, folder) {
	const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
	const safe = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
	const { error } = await supabase.storage.from(LESSON_BUCKET).upload(safe, file, {
		cacheControl: "3600",
		upsert: false,
		contentType: file.type || void 0
	});
	if (error) throw error;
	return `${STORAGE_PREFIX}${safe}`;
}
/** Turns a stored value into a playable URL. External links pass through unchanged. */
async function resolveMediaUrl(value) {
	if (!value) return null;
	if (!isStorageRef(value)) return value;
	const { data, error } = await supabase.storage.from(LESSON_BUCKET).createSignedUrl(storagePath(value), 3600 * 4);
	if (error) return null;
	return data?.signedUrl ?? null;
}
//#endregion
export { uploadLessonFile as i, resolveMediaUrl as n, storagePath as r, isStorageRef as t };
