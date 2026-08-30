//#region node_modules/.nitro/vite/services/ssr/assets/credits-CWoRelbL.js
/** Single place to retune the whole credit economy. */
var CREDIT_COSTS = {
	audio: 5,
	video: 10,
	pdf: 5,
	summary: 0
};
var CREDIT_REWARDS = {
	welcome: 100,
	dailyLogin: 10,
	studyBlock: 5,
	lessonComplete: 10,
	testSubmitted: 10,
	testPassedBonus: 5,
	referral: 50
};
var STREAK_LADDER = [
	{
		day: 3,
		credits: 20
	},
	{
		day: 7,
		credits: 50
	},
	{
		day: 14,
		credits: 100
	},
	{
		day: 30,
		credits: 250
	}
];
/** Credits needed to open a whole lesson (all of its resources). */
function lessonCost(lesson) {
	const audio = lesson.hasAudio ?? Boolean(lesson.audio_url);
	const video = lesson.hasVideo ?? Boolean(lesson.video_url);
	const pdf = lesson.hasPdf ?? Boolean(lesson.pdf_url);
	return (audio ? CREDIT_COSTS.audio : 0) + (video ? CREDIT_COSTS.video : 0) + (pdf ? CREDIT_COSTS.pdf : 0);
}
function nextStreakMilestone(current) {
	return STREAK_LADDER.find((s) => s.day > current) ?? null;
}
function referralLink(origin, code) {
	return `${origin}/auth?ref=${encodeURIComponent(code)}`;
}
function whatsappShare(link) {
	const text = `I'm learning on Easy Padhai (Class 9–12) — audio + video lectures, notes and instant tests, all free. Join with my link and we both get 50 bonus credits: ${link}`;
	return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
var REF_STORAGE_KEY = "easy-padhai-ref";
//#endregion
export { lessonCost as a, whatsappShare as c, STREAK_LADDER as i, CREDIT_REWARDS as n, nextStreakMilestone as o, REF_STORAGE_KEY as r, referralLink as s, CREDIT_COSTS as t };
