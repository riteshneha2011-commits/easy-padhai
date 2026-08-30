export type DraftQuestion = {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation?: string | null;
  topic?: string | null;
  difficulty?: string;
};

export type ParseResult = { questions: DraftQuestion[]; errors: string[] };

function validate(q: DraftQuestion, index: number, errors: string[]) {
  const label = `Question ${index + 1}`;
  if (!q.prompt?.trim()) errors.push(`${label}: missing question text`);
  if (!Array.isArray(q.options) || q.options.length < 2)
    errors.push(`${label}: needs at least 2 options`);
  if (
    typeof q.correctIndex !== "number" ||
    q.correctIndex < 0 ||
    q.correctIndex >= (q.options?.length ?? 0)
  )
    errors.push(`${label}: no valid correct answer marked`);
}

export function parseJsonQuestions(input: string): ParseResult {
  const errors: string[] = [];
  let raw: unknown;
  try {
    raw = JSON.parse(input);
  } catch (error) {
    return { questions: [], errors: [`Invalid JSON: ${(error as Error).message}`] };
  }

  const list = Array.isArray(raw) ? raw : (raw as { questions?: unknown })?.questions;
  if (!Array.isArray(list)) {
    return { questions: [], errors: ["Expected an array of questions."] };
  }

  const questions = list.map((item) => {
    const record = item as Record<string, unknown>;
    const options = (record.options as unknown[]) ?? [];
    let correctIndex = Number(record.correctIndex ?? record.correct_index ?? -1);
    if (typeof record.answer === "string") {
      const found = options.findIndex(
        (o) => String(o).trim().toLowerCase() === String(record.answer).trim().toLowerCase(),
      );
      if (found >= 0) correctIndex = found;
    }
    return {
      prompt: String(record.prompt ?? record.question ?? "").trim(),
      options: options.map((o) => String(o).trim()),
      correctIndex,
      explanation: record.explanation ? String(record.explanation) : null,
      topic: record.topic ? String(record.topic) : null,
      difficulty: record.difficulty ? String(record.difficulty) : "medium",
    } satisfies DraftQuestion;
  });

  questions.forEach((q, i) => validate(q, i, errors));
  return { questions, errors };
}

/**
 * Markdown convention:
 *   Q: Which state of matter is compressible?
 *   - Solid
 *   * Gas          <- the asterisk marks the correct option
 *   > Gases have large inter-particle spaces.
 *   ~ States of Matter
 */
export function parseMarkdownQuestions(input: string): ParseResult {
  const errors: string[] = [];
  const questions: DraftQuestion[] = [];
  let current: DraftQuestion | null = null;

  const push = () => {
    if (current) questions.push(current);
    current = null;
  };

  for (const rawLine of input.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;

    if (/^q\s*[:.)]/i.test(line) || /^\d+[.)]\s/.test(line)) {
      push();
      current = {
        prompt: line.replace(/^q\s*[:.)]\s*/i, "").replace(/^\d+[.)]\s*/, ""),
        options: [],
        correctIndex: -1,
        explanation: null,
        topic: null,
        difficulty: "medium",
      };
      continue;
    }

    if (!current) continue;

    if (line.startsWith(">")) {
      current.explanation = line.slice(1).trim();
    } else if (line.startsWith("~")) {
      current.topic = line.slice(1).trim();
    } else if (line.startsWith("*")) {
      current.correctIndex = current.options.length;
      current.options.push(line.slice(1).trim());
    } else if (line.startsWith("-") || line.startsWith("+")) {
      current.options.push(line.slice(1).trim());
    }
  }
  push();

  if (questions.length === 0) errors.push("No questions found. Each question must start with 'Q:'.");
  questions.forEach((q, i) => validate(q, i, errors));
  return { questions, errors };
}

export const JSON_EXAMPLE = `[
  {
    "prompt": "Which state of matter has the highest compressibility?",
    "options": ["Solid", "Liquid", "Gas", "All equal"],
    "correctIndex": 2,
    "explanation": "Gases have the largest inter-particle spaces.",
    "topic": "States of Matter",
    "difficulty": "easy"
  }
]`;

export const MARKDOWN_EXAMPLE = `Q: Which state of matter has the highest compressibility?
- Solid
- Liquid
* Gas
- All equal
> Gases have the largest inter-particle spaces.
~ States of Matter

Q: Dry ice is solid...
- Water
* Carbon dioxide
- Nitrogen
> Dry ice sublimes at room temperature.`;
