import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { autofillChapterMeta, autofillLessonMeta } from "@/lib/admin.functions";
import { slugify } from "@/lib/slug";

function setField(form: HTMLFormElement, name: string, value: string) {
  const el = form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | null;
  if (!el || !value) return;
  el.value = value;
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

/**
 * Small "Auto-generate" helper for the Studio forms.
 * Reads the title (and context) from the surrounding form and fills
 * slug + description (chapter) or summary (lesson) with AI output.
 */
export function AiAutofill({ mode, label }: { mode: "chapter" | "lesson"; label?: string }) {
  const chapterMeta = useServerFn(autofillChapterMeta);
  const lessonMeta = useServerFn(autofillLessonMeta);
  const [loading, setLoading] = useState(false);

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      disabled={loading}
      className="rounded-full"
      onClick={async (e) => {
        const form = (e.currentTarget as HTMLButtonElement).form;
        if (!form) return;
        const value = (name: string) =>
          String((form.elements.namedItem(name) as HTMLInputElement | null)?.value ?? "").trim();

        const title = value("title");
        if (!title) return toast.error("Enter a title first");

        setLoading(true);
        try {
          if (mode === "chapter") {
            setField(form, "slug", slugify(title));
            const res = await chapterMeta({ data: { title, subjectId: value("subject_id") } });
            setField(form, "slug", res.slug);
            setField(form, "description", res.description);
            toast.success("Slug and description generated — review before saving");
          } else {
            const res = await lessonMeta({
              data: { title, chapterId: value("chapter_id"), kind: value("kind") },
            });
            setField(form, "summary", res.summary);
            toast.success("Summary generated — review before saving");
          }
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Could not generate");
        } finally {
          setLoading(false);
        }
      }}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
      {label ?? (mode === "chapter" ? "Auto-generate slug & description" : "Auto-generate summary")}
    </Button>
  );
}
