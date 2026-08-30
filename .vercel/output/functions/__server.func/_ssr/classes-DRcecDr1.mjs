//#region node_modules/.nitro/vite/services/ssr/assets/classes-DRcecDr1.js
/**
* Single source of truth for class levels.
*
* The product is positioned for Class 9 to 12, but content rolls out class by
* class. To open a new class later, just move it from `UPCOMING` into
* `ACTIVE_CLASS_LEVELS` — every label, filter and AI prompt follows this file.
*/
var ALL_CLASS_LEVELS = [
	9,
	10,
	11,
	12
];
/** Classes that currently have published content and can be selected. */
var ACTIVE_CLASS_LEVELS = [9];
/** Classes announced but not live yet. */
var UPCOMING_CLASS_LEVELS = ALL_CLASS_LEVELS.filter((c) => !ACTIVE_CLASS_LEVELS.includes(c));
var DEFAULT_CLASS_LEVEL = ACTIVE_CLASS_LEVELS[0] ?? 9;
/** Brand-level range, e.g. "Class 9-12" — used in marketing copy and SEO. */
var CLASS_RANGE_LABEL = `Class ${ALL_CLASS_LEVELS[0]}–${ALL_CLASS_LEVELS[ALL_CLASS_LEVELS.length - 1]}`;
/** What is live right now, e.g. "Class 9" or "Class 9 & 10". */
var ACTIVE_CLASS_LABEL = ACTIVE_CLASS_LEVELS.length === 1 ? `Class ${ACTIVE_CLASS_LEVELS[0]}` : `Class ${ACTIVE_CLASS_LEVELS.slice(0, -1).join(", ")} & ${ACTIVE_CLASS_LEVELS[ACTIVE_CLASS_LEVELS.length - 1]}`;
var UPCOMING_CLASS_LABEL = UPCOMING_CLASS_LEVELS.length ? `Class ${UPCOMING_CLASS_LEVELS.join(", ")}` : "";
function isClassActive(level) {
	return level != null && ACTIVE_CLASS_LEVELS.includes(level);
}
function classLabel(level) {
	return level == null ? "—" : `Class ${level}`;
}
function normalizeClassLevel(value) {
	const n = Number(value);
	return ALL_CLASS_LEVELS.includes(n) ? n : DEFAULT_CLASS_LEVEL;
}
//#endregion
export { DEFAULT_CLASS_LEVEL as a, isClassActive as c, CLASS_RANGE_LABEL as i, normalizeClassLevel as l, ACTIVE_CLASS_LEVELS as n, UPCOMING_CLASS_LABEL as o, ALL_CLASS_LEVELS as r, classLabel as s, ACTIVE_CLASS_LABEL as t };
