//#region node_modules/.nitro/vite/services/ssr/assets/gamify-Bb5_Yp3b.js
function levelFromXp(xp) {
	return Math.floor(Math.sqrt(Math.max(xp, 0) / 50)) + 1;
}
function xpForLevel(level) {
	return Math.pow(level - 1, 2) * 50;
}
function levelProgress(xp) {
	const level = levelFromXp(xp);
	const start = xpForLevel(level);
	const next = xpForLevel(level + 1);
	return {
		level,
		start,
		next,
		percent: Math.min(100, Math.round((xp - start) / Math.max(next - start, 1) * 100)),
		toNext: Math.max(next - xp, 0)
	};
}
//#endregion
export { levelProgress as n, levelFromXp as t };
