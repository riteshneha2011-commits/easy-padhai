import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { awardXp, grantBadge, touchStreak } from "./gamify.server";
import { awardCredits } from "./credits.server";
import { syncMistakesFor } from "./revision.server";
import { CREDIT_REWARDS, TEST_PASS_RATIO } from "./credits";

export async function getTestForAttempt(testId: string) {
  const { data: test } = await supabaseAdmin
    .from("tests")
    .select("id, title, description, duration_minutes, chapter_id, published")
    .eq("id", testId)
    .maybeSingle();

  if (!test || !test.published) return null;

  const { data: chapter } = await supabaseAdmin
    .from("chapters")
    .select("slug, title")
    .eq("id", test.chapter_id)
    .maybeSingle();

  const { data: questions } = await supabaseAdmin
    .from("questions")
    .select("id, prompt, options, order_index")
    .eq("test_id", testId)
    .order("order_index");

  return {
    test: { ...test, chapterSlug: chapter?.slug ?? null, chapterTitle: chapter?.title ?? null },
    // correct_index and explanation are intentionally never sent before grading
    questions: (questions ?? []).map((q) => ({
      id: q.id,
      prompt: q.prompt,
      options: (q.options ?? []) as string[],
    })),
  };
}

export async function submitAttemptFor(
  userId: string,
  testId: string,
  answers: Record<string, number>,
) {
  const { data: questions } = await supabaseAdmin
    .from("questions")
    .select("id, prompt, options, correct_index, explanation, topic, order_index")
    .eq("test_id", testId)
    .order("order_index");

  const list = questions ?? [];
  if (list.length === 0) throw new Error("This test has no questions yet");

  const details = list.map((q) => {
    const selected = answers[q.id];
    return {
      id: q.id,
      prompt: q.prompt,
      options: (q.options ?? []) as string[],
      selected: typeof selected === "number" ? selected : null,
      correctIndex: q.correct_index,
      correct: selected === q.correct_index,
      explanation: q.explanation,
      topic: q.topic,
    };
  });

  const score = details.filter((d) => d.correct).length;
  const total = list.length;

  const { data: attempt } = await supabaseAdmin
    .from("test_attempts")
    .insert({ user_id: userId, test_id: testId, score, total, details })
    .select("id")
    .single();

  const xp = score * 5 + (score === total ? 20 : 0);
  await awardXp(userId, xp, "Test completed");
  await touchStreak(userId, 10);
  if (score === total) await grantBadge(userId, "perfect_test");
  await syncMistakesFor(
    userId,
    details.map((d) => ({ id: d.id, correct: d.correct, selected: d.selected })),
  );

  const passed = total > 0 && score / total >= TEST_PASS_RATIO;
  const credits = CREDIT_REWARDS.testSubmitted + (passed ? CREDIT_REWARDS.testPassedBonus : 0);
  await awardCredits(userId, credits, passed ? "Test passed" : "Test attempted", attempt?.id ?? null);

  return { attemptId: attempt?.id ?? null, score, total, xp, credits, details };
}
