import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { generateViralTemplates, ChallengeShareInfo } from "./viral-copy";

export interface ChallengeMeta {
  challenge: boolean;
  code: string;
  class_level?: number;
  subject_name?: string;
  chapter_title?: string;
  chapter_slug?: string;
  question_count?: number;
  created_at?: string;
}

function parseChallengeMeta(description: string | null, title: string): { code: string; meta: Partial<ChallengeMeta> } {
  let meta: Partial<ChallengeMeta> = {};
  if (description) {
    try {
      meta = JSON.parse(description);
    } catch {
      // not json, ignore
    }
  }

  let code = meta.code;
  if (!code) {
    const match = title.match(/\[CHALLENGE:([a-zA-Z0-9_-]+)\]/i);
    if (match) code = match[1];
  }
  return { code: (code || "").toLowerCase(), meta };
}

function generateShortCode(prefix = "quiz"): string {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  let rand = "";
  for (let i = 0; i < 4; i++) {
    rand += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${prefix}-${rand}`;
}

export async function listAdminChallenges() {
  const { data: tests, error } = await supabaseAdmin
    .from("tests")
    .select(`
      id,
      title,
      description,
      chapter_id,
      duration_minutes,
      created_at,
      chapters (
        id,
        title,
        slug,
        subject_id,
        subjects (
          id,
          name,
          class_level
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const challenges = (tests || []).filter((t) => {
    return t.title.includes("[CHALLENGE:") || t.description?.includes('"challenge":true') || t.description?.includes('"challenge": true');
  });

  // Fetch attempt counts and stats for each challenge
  const challengeIds = challenges.map((c) => c.id);
  let attemptCounts: Record<string, { count: number; avgScore: number }> = {};

  if (challengeIds.length > 0) {
    const { data: attempts } = await supabaseAdmin
      .from("test_attempts")
      .select("test_id, score, total")
      .in("test_id", challengeIds);

    if (attempts) {
      for (const a of attempts) {
        if (!attemptCounts[a.test_id]) {
          attemptCounts[a.test_id] = { count: 0, avgScore: 0 };
        }
        attemptCounts[a.test_id].count++;
        attemptCounts[a.test_id].avgScore += a.score;
      }
      for (const id of Object.keys(attemptCounts)) {
        if (attemptCounts[id].count > 0) {
          attemptCounts[id].avgScore = Math.round((attemptCounts[id].avgScore / attemptCounts[id].count) * 10) / 10;
        }
      }
    }
  }

  return challenges.map((c) => {
    const { code, meta } = parseChallengeMeta(c.description, c.title);
    const ch = Array.isArray(c.chapters) ? c.chapters[0] : c.chapters;
    const sub = ch && Array.isArray(ch.subjects) ? ch.subjects[0] : ch?.subjects;
    const stats = attemptCounts[c.id] || { count: 0, avgScore: 0 };

    const cleanTitle = c.title.replace(/\[CHALLENGE:[^\]]+\]\s*/i, "");

    const shareInfo: ChallengeShareInfo = {
      code,
      title: cleanTitle,
      chapterTitle: ch?.title || meta.chapter_title || "Chapter",
      subjectName: sub?.name || meta.subject_name,
      classLevel: sub?.class_level || meta.class_level,
      questionCount: meta.question_count || 5,
    };

    return {
      id: c.id,
      code,
      title: cleanTitle,
      fullTitle: c.title,
      chapterId: c.chapter_id,
      chapterTitle: ch?.title || meta.chapter_title || "Chapter",
      chapterSlug: ch?.slug || meta.chapter_slug || "",
      subjectName: sub?.name || meta.subject_name || "",
      classLevel: sub?.class_level || meta.class_level || 10,
      createdAt: c.created_at,
      playsCount: stats.count,
      avgScore: stats.avgScore,
      shareInfo,
      templates: generateViralTemplates(shareInfo),
    };
  });
}

export async function createChallenge(input: {
  chapterId: string;
  title?: string;
  code?: string;
  questionCount?: number;
}) {
  const { chapterId, questionCount = 5 } = input;

  // 1. Fetch Chapter and Subject details
  const { data: chapter, error: chErr } = await supabaseAdmin
    .from("chapters")
    .select(`
      id,
      title,
      slug,
      subject_id,
      subjects (
        id,
        name,
        class_level
      )
    `)
    .eq("id", chapterId)
    .single();

  if (chErr || !chapter) {
    throw new Error("Chapter not found for challenge creation");
  }

  const sub = Array.isArray(chapter.subjects) ? chapter.subjects[0] : chapter.subjects;

  // 2. Fetch questions from all tests in this chapter
  const { data: chapterTests } = await supabaseAdmin
    .from("tests")
    .select("id")
    .eq("chapter_id", chapterId)
    .not("title", "like", "[CHALLENGE:%");

  const testIds = (chapterTests || []).map((t) => t.id);

  let candidateQuestions: any[] = [];
  if (testIds.length > 0) {
    const { data: questions } = await supabaseAdmin
      .from("questions")
      .select("id, prompt, options, correct_index, explanation, topic, difficulty")
      .in("test_id", testIds);

    candidateQuestions = questions || [];
  }

  // Fallback if chapter has fewer questions: look across subject tests
  if (candidateQuestions.length < questionCount && sub?.id) {
    const { data: subChapters } = await supabaseAdmin
      .from("chapters")
      .select("id")
      .eq("subject_id", sub.id);
    const subChapterIds = (subChapters || []).map((c) => c.id);
    if (subChapterIds.length > 0) {
      const { data: moreTests } = await supabaseAdmin
        .from("tests")
        .select("id")
        .in("chapter_id", subChapterIds)
        .not("title", "like", "[CHALLENGE:%");
      const moreTestIds = (moreTests || []).map((t) => t.id);
      if (moreTestIds.length > 0) {
        const { data: fallbackQuestions } = await supabaseAdmin
          .from("questions")
          .select("id, prompt, options, correct_index, explanation, topic, difficulty")
          .in("test_id", moreTestIds);
        candidateQuestions = [...candidateQuestions, ...(fallbackQuestions || [])];
      }
    }
  }

  if (candidateQuestions.length === 0) {
    throw new Error(`No quiz questions available in ${chapter.title} to create a challenge.`);
  }

  // Shuffle and pick desired count
  const shuffled = [...candidateQuestions].sort(() => 0.5 - Math.random());
  const selectedQuestions = shuffled.slice(0, Math.min(questionCount, candidateQuestions.length));

  // Determine short code
  const prefix = chapter.slug
    ? chapter.slug.split("-").slice(0, 2).join("").slice(0, 5)
    : "quiz";
  const cleanCode = (input.code || generateShortCode(prefix))
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "");

  const displayTitle = input.title || `${chapter.title} 2-Minute Brain Challenge`;
  const fullTitle = `[CHALLENGE:${cleanCode}] ${displayTitle}`;

  const metaData: ChallengeMeta = {
    challenge: true,
    code: cleanCode,
    class_level: sub?.class_level || 10,
    subject_name: sub?.name || "",
    chapter_title: chapter.title,
    chapter_slug: chapter.slug,
    question_count: selectedQuestions.length,
    created_at: new Date().toISOString(),
  };

  // 3. Create the test entry
  const { data: newTest, error: testErr } = await supabaseAdmin
    .from("tests")
    .insert({
      chapter_id: chapterId,
      title: fullTitle,
      description: JSON.stringify(metaData),
      duration_minutes: 2,
      published: true,
    })
    .select("id, title, description, chapter_id, duration_minutes, created_at")
    .single();

  if (testErr || !newTest) {
    throw new Error(`Failed to create challenge test: ${testErr?.message}`);
  }

  // 4. Clone the selected questions into this test
  const questionInserts = selectedQuestions.map((q, idx) => ({
    test_id: newTest.id,
    prompt: q.prompt,
    options: q.options,
    correct_index: q.correct_index,
    explanation: q.explanation || "Correct concept explanation from Easy Padhai.",
    topic: q.topic || chapter.title,
    difficulty: q.difficulty || "medium",
    order_index: idx + 1,
  }));

  const { error: qInsertErr } = await supabaseAdmin
    .from("questions")
    .insert(questionInserts);

  if (qInsertErr) {
    throw new Error(`Failed to attach questions to challenge: ${qInsertErr.message}`);
  }

  const shareInfo: ChallengeShareInfo = {
    code: cleanCode,
    title: displayTitle,
    chapterTitle: chapter.title,
    subjectName: sub?.name,
    classLevel: sub?.class_level,
    questionCount: selectedQuestions.length,
  };

  return {
    id: newTest.id,
    code: cleanCode,
    title: displayTitle,
    chapterSlug: chapter.slug,
    questionCount: selectedQuestions.length,
    shareInfo,
    templates: generateViralTemplates(shareInfo),
  };
}

export async function autoGenerateDailyChallenge() {
  // Find all chapters that have tests with at least 5 questions
  const { data: chapters, error } = await supabaseAdmin
    .from("chapters")
    .select(`
      id,
      title,
      slug,
      subject_id,
      subjects (
        id,
        name,
        class_level
      )
    `)
    .eq("published", true);

  if (error || !chapters || chapters.length === 0) {
    throw new Error("No published chapters found");
  }

  // Pick a random chapter from Class 10 or Class 9
  const prioritized = chapters.filter((c) => {
    const sub = Array.isArray(c.subjects) ? c.subjects[0] : c.subjects;
    return sub?.class_level === 10 || sub?.class_level === 9;
  });

  const pool = prioritized.length > 0 ? prioritized : chapters;
  const pickedChapter = pool[Math.floor(Math.random() * pool.length)];

  return createChallenge({
    chapterId: pickedChapter.id,
    questionCount: 5,
  });
}

export async function getPublicChallenge(code: string) {
  const cleanCode = code.toLowerCase().trim();

  // Search by code in title or description
  const { data: tests, error } = await supabaseAdmin
    .from("tests")
    .select(`
      id,
      title,
      description,
      chapter_id,
      duration_minutes,
      chapters (
        id,
        title,
        slug,
        subject_id,
        subjects (
          id,
          name,
          class_level
        )
      )
    `)
    .ilike("title", `%[CHALLENGE:${cleanCode}]%`)
    .limit(1);

  if (error || !tests || tests.length === 0) {
    // Fallback: search description JSON
    const { data: descTests } = await supabaseAdmin
      .from("tests")
      .select(`
        id,
        title,
        description,
        chapter_id,
        duration_minutes,
        chapters (
          id,
          title,
          slug,
          subject_id,
          subjects (
            id,
            name,
            class_level
          )
        )
      `)
      .ilike("description", `%"code":"${cleanCode}"%`)
      .limit(1);

    if (!descTests || descTests.length === 0) {
      throw new Error(`Challenge quiz '${cleanCode}' not found or expired.`);
    }
    return formatPublicChallenge(descTests[0], cleanCode);
  }

  return formatPublicChallenge(tests[0], cleanCode);
}

async function formatPublicChallenge(test: any, code: string) {
  const ch = Array.isArray(test.chapters) ? test.chapters[0] : test.chapters;
  const sub = ch && Array.isArray(ch.subjects) ? ch.subjects[0] : ch?.subjects;
  const { meta } = parseChallengeMeta(test.description, test.title);

  // Fetch questions WITHOUT correct_index or explanation to prevent cheating
  const { data: questions, error } = await supabaseAdmin
    .from("questions")
    .select("id, prompt, options, topic, order_index")
    .eq("test_id", test.id)
    .order("order_index", { ascending: true });

  if (error || !questions || questions.length === 0) {
    throw new Error("Challenge has no questions configured.");
  }

  const cleanTitle = test.title.replace(/\[CHALLENGE:[^\]]+\]\s*/i, "");

  return {
    id: test.id,
    code,
    title: cleanTitle,
    chapterTitle: ch?.title || meta.chapter_title || "Chapter",
    chapterSlug: ch?.slug || meta.chapter_slug || "",
    subjectName: sub?.name || meta.subject_name || "",
    classLevel: sub?.class_level || meta.class_level || 10,
    durationSeconds: (test.duration_minutes || 2) * 60,
    totalQuestions: questions.length,
    questions: questions.map((q) => ({
      id: q.id,
      prompt: q.prompt,
      options: (Array.isArray(q.options) ? q.options : []) as string[],
      topic: q.topic,
    })),
  };
}

export async function submitPublicAttempt(input: {
  code: string;
  studentName: string;
  phone: string;
  answers: Record<string, number>;
  timeTakenSeconds?: number;
}) {
  const { code, answers, timeTakenSeconds = 0 } = input;
  const cleanPhone = input.phone.replace(/[^0-9]/g, "").slice(-10);
  const cleanName = (input.studentName || "Student").trim();

  if (cleanPhone.length < 10) {
    throw new Error("Please enter a valid 10-digit WhatsApp number.");
  }

  // 1. Fetch Challenge & Questions with actual answers
  const challenge = await getPublicChallenge(code);
  const { data: fullQuestions, error: qErr } = await supabaseAdmin
    .from("questions")
    .select("id, prompt, options, correct_index, explanation, topic, order_index")
    .eq("test_id", challenge.id)
    .order("order_index", { ascending: true });

  if (qErr || !fullQuestions || fullQuestions.length === 0) {
    throw new Error("Could not load challenge questions for scoring.");
  }

  // 2. Score attempt
  let score = 0;
  const total = fullQuestions.length;
  const review = fullQuestions.map((q) => {
    const selected = answers[q.id] !== undefined ? answers[q.id] : -1;
    const isCorrect = selected === q.correct_index;
    if (isCorrect) score++;

    return {
      id: q.id,
      prompt: q.prompt,
      options: (Array.isArray(q.options) ? q.options : []) as string[],
      selectedIndex: selected,
      correctIndex: q.correct_index,
      isCorrect,
      explanation: q.explanation || "Concept from Easy Padhai syllabus.",
      topic: q.topic,
    };
  });

  // 3. Find or provision learner profile (Lead Capture)
  let profileId: string | null = null;
  let isRegisteredUser = false;

  // Check if profile exists with this phone
  const { data: existingProfile } = await supabaseAdmin
    .from("profiles")
    .select("id, credits, total_xp, onboarding_completed")
    .eq("phone", cleanPhone)
    .maybeSingle();

  if (existingProfile) {
    profileId = existingProfile.id;
    isRegisteredUser = Boolean(existingProfile.onboarding_completed);
  } else {
    // Create guest auth user and profile
    const dummyEmail = `student_${cleanPhone}@easypadhai.guest`;
    const { data: authUser } = await supabaseAdmin.auth.admin.createUser({
      email: dummyEmail,
      phone: `+91${cleanPhone}`,
      phone_confirm: true,
      email_confirm: true,
      user_metadata: {
        full_name: cleanName,
        phone: cleanPhone,
        guest_lead: true,
        source_challenge: code,
      },
    });

    if (authUser?.user) {
      profileId = authUser.user.id;
      // Ensure initial guest profile with 0 base credits (bonus will be added based on score)
      await supabaseAdmin.from("profiles").upsert({
        id: profileId,
        full_name: cleanName,
        phone: cleanPhone,
        class_level: challenge.classLevel || 10,
        credits: 0,
        total_xp: 0,
        onboarding_completed: false,
      });
    }
  }

  // 4. Anti-Farming: Check if this user/phone has already claimed rewards for this challenge
  let alreadyClaimed = false;
  if (profileId) {
    const { data: priorAttempts } = await supabaseAdmin
      .from("test_attempts")
      .select("id")
      .eq("test_id", challenge.id)
      .eq("user_id", profileId)
      .limit(1);

    if (priorAttempts && priorAttempts.length > 0) {
      alreadyClaimed = true;
    }
  }

  // 5. Performance-Based Reward Calculation
  const percent = Math.round((score / Math.max(total, 1)) * 100);
  let potentialCredits = 0;
  let potentialXp = 5; // minimum participation XP

  if (percent >= 80) {
    potentialCredits = 10; // 1 full lecture unlock reward
    potentialXp = 30;
  } else if (percent >= 50) {
    potentialCredits = 5;
    potentialXp = 15;
  } else {
    potentialCredits = 0;
    potentialXp = 5;
  }

  let actualCreditsAwarded = 0;
  let actualXpAwarded = 0;

  if (!alreadyClaimed && profileId) {
    actualCreditsAwarded = potentialCredits;
    actualXpAwarded = potentialXp;

    // Fetch fresh profile state to update
    const { data: prof } = await supabaseAdmin
      .from("profiles")
      .select("credits, total_xp, onboarding_completed")
      .eq("id", profileId)
      .single();

    if (prof) {
      let nextCredits = (prof.credits || 0) + actualCreditsAwarded;
      // Unregistered guest cap: Maximum 20 bonus credits until full registration/verification
      if (!prof.onboarding_completed && nextCredits > 20) {
        nextCredits = 20;
      }

      await supabaseAdmin
        .from("profiles")
        .update({
          credits: nextCredits,
          total_xp: (prof.total_xp || 0) + actualXpAwarded,
        })
        .eq("id", profileId);
    }
  }

  // 6. Save attempt in test_attempts
  if (profileId) {
    await supabaseAdmin.from("test_attempts").insert({
      test_id: challenge.id,
      user_id: profileId,
      score,
      total,
      details: {
        is_challenge: true,
        challenge_code: code,
        student_name: cleanName,
        phone: cleanPhone,
        time_taken_seconds: timeTakenSeconds,
        already_claimed: alreadyClaimed,
        credits_awarded: actualCreditsAwarded,
        xp_awarded: actualXpAwarded,
        answers,
      },
    });
  }

  // 7. Compute percentile
  const percentile = percent >= 80 ? 92 : percent >= 60 ? 78 : percent >= 40 ? 54 : 35;

  return {
    score,
    total,
    percent,
    percentile,
    studentName: cleanName,
    chapterTitle: challenge.chapterTitle,
    chapterSlug: challenge.chapterSlug,
    code,
    bonusCreditsAwarded: actualCreditsAwarded,
    bonusXpAwarded: actualXpAwarded,
    alreadyClaimed,
    isRegisteredUser,
    urgencyHours: 48,
    review,
  };
}

export async function getChallengeLeads(challengeId?: string) {
  let query = supabaseAdmin
    .from("test_attempts")
    .select(`
      id,
      test_id,
      user_id,
      score,
      total,
      details,
      created_at,
      tests (
        id,
        title
      )
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  if (challengeId) {
    query = query.eq("test_id", challengeId);
  }

  const { data: attempts, error } = await query;
  if (error) throw new Error(error.message);

  // Filter attempts that have is_challenge or where test has [CHALLENGE:
  const leads = (attempts || []).filter((a) => {
    const details = (a.details || {}) as any;
    const testTitle = (a.tests as any)?.title || "";
    return details.is_challenge === true || testTitle.includes("[CHALLENGE:");
  });

  return leads.map((l) => {
    const details = (l.details || {}) as any;
    const testTitle = (l.tests as any)?.title || "";
    const cleanTitle = testTitle.replace(/\[CHALLENGE:[^\]]+\]\s*/i, "");

    return {
      id: l.id,
      testId: l.test_id,
      challengeTitle: cleanTitle || "Daily Challenge",
      studentName: details.student_name || "Learner",
      phone: details.phone || "",
      score: l.score,
      total: l.total,
      timeTakenSeconds: details.time_taken_seconds || 0,
      createdAt: l.created_at,
    };
  });
}
