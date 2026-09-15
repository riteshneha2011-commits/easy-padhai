export interface ChallengeShareInfo {
  code: string;
  title: string;
  chapterTitle: string;
  subjectName?: string;
  classLevel?: number;
  questionCount: number;
  baseUrl?: string;
}

export function getChallengeUrl(code: string, baseUrl = "https://ep.studytube.co.in"): string {
  return `${baseUrl}/c/${code}`;
}

export interface ViralTemplate {
  id: string;
  name: string;
  headline: string;
  text: string;
}

export function generateViralTemplates(info: ChallengeShareInfo): ViralTemplate[] {
  const url = getChallengeUrl(info.code, info.baseUrl);
  const classText = info.classLevel ? `Class ${info.classLevel} ` : "";
  const subText = info.subjectName ? `${info.subjectName} · ` : "";

  return [
    {
      id: "curiosity",
      name: "⚡ Curiosity & Brain Hook (Highest Clicks)",
      headline: `85% students fail Question 3 in ${info.chapterTitle}!`,
      text: `⚡ *2-Minute Brain Challenge: ${classText}${subText}${info.chapterTitle}*

🔥 85% स्टूडेंट्स सवाल नंबर 3 में गलती करते हैं! क्या आप ${info.questionCount}/${info.questionCount} स्कोर कर सकते हैं?

⏱️ सिर्फ 2 मिनट का टेस्ट (5 Quick MCQs)
🎁 टेस्ट पूरा करते ही पाएं 50 फ्री स्टडी क्रेडिट्स!
✅ कोई साइनअप या पासवर्ड की ज़रूरत नहीं — सिर्फ खेलें और स्कोर देखें!

👇 *अपना स्कोर अभी चेक करें (Free):*
${url}`,
    },
    {
      id: "exam_prep",
      name: "🎯 Board Exam Special (High Intent)",
      headline: `Top Repeated Questions from ${info.chapterTitle}`,
      text: `🎯 *${classText}${subText}Board Exam Quick Check!*

क्या आपकी *${info.chapterTitle}* की तैयारी पक्की है? 
बोर्ड एग्ज़ाम में बार-बार पूछे जाने वाले टॉप ${info.questionCount} कॉन्सेप्ट्स पर खुद को टेस्ट करें:

📊 इंस्टेंट स्कोर + गलत सवालों का आसान एक्सप्लेनेशन
🚀 अपनी रैंक और पर्सेंटाइल जानें

👉 *क्लिक करें और 2 मिनट में टेस्ट दें:*
${url}`,
    },
    {
      id: "friend_challenge",
      name: "🏆 Peer Challenge (Friends & Study Groups)",
      headline: `Can you beat the class in ${info.chapterTitle}?`,
      text: `🏆 *Open Challenge: Who is the Master of ${info.chapterTitle}?*

मैंने ${classText}${info.chapterTitle} का 2-Minute स्पीड टेस्ट दिया!
दम है तो पूरा स्कोर करके दिखाओ! 🔥

🎮 *Test your speed now:*
${url}`,
    },
  ];
}

export function generateStudentShareText(opts: {
  studentName: string;
  score: number;
  total: number;
  chapterTitle: string;
  code: string;
  baseUrl?: string;
}): string {
  const url = getChallengeUrl(opts.code, opts.baseUrl);
  const percent = Math.round((opts.score / Math.max(opts.total, 1)) * 100);
  const emoji = percent >= 80 ? "🔥" : percent >= 60 ? "⚡" : "🎯";

  return `${emoji} *मैंने Easy Padhai पर '${opts.chapterTitle}' के 2-Minute Challenge में ${opts.score}/${opts.total} (${percent}%) स्कोर किया!*

क्या आप मेरे स्कोर को बीट कर सकते हैं? 😉
सिर्फ 2 मिनट में 5 सवालों का टेस्ट दें और देखें आप कितने पानी में हैं!

👇 *चैलेंज एक्सेप्ट करें (Free):*
${url}`;
}
