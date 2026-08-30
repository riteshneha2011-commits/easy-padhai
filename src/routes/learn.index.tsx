import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { ArrowRight, FileText, Headphones, PlayCircle, BookOpen, Sparkles } from "lucide-react";
import { getCatalog } from "@/lib/content.functions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { classLabel } from "@/lib/classes";

const catalogQuery = queryOptions({ queryKey: ["catalog"], queryFn: () => getCatalog() });

export const Route = createFileRoute("/learn/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQuery),
  head: () => ({
    meta: [
      { title: "All chapters — Easy Padhai Class 9–12" },
      {
        name: "description",
        content: "Browse every Class 9 to 12 chapter on Easy Padhai: audio, video, summaries, notes and tests. Class 9 is live now.",
      },
      { property: "og:title", content: "All chapters — Easy Padhai Class 9–12" },
      {
        property: "og:description",
        content: "Browse every Class 9 to 12 chapter: audio, video, summaries, notes and tests.",
      },
    ],
  }),
  component: LearnIndex,
});

function LearnIndex() {
  const { data: subjects } = useSuspenseQuery(catalogQuery);
  const navigate = useNavigate();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <h1 className="text-4xl font-bold">Chapters</h1>
      <p className="mt-2 text-muted-foreground">
        Pick a chapter and move through listen → watch → revise → test.
      </p>

      {subjects.map((subject) => (
        <section key={subject.id} className="mt-10">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-2xl font-bold">{subject.name}</h2>
            <Badge variant="secondary" className="rounded-full">
              {classLabel(subject.class_level)}
            </Badge>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subject.chapters.map((chapter, index) => (
              <Card
                key={chapter.id}
                onClick={() => navigate({ to: "/learn/$slug", params: { slug: chapter.slug } })}
                className="card-hover shadow-card cursor-pointer gap-2.5 rounded-3xl border-border/70 p-5 transition-all hover:border-primary/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="font-display text-xs font-bold uppercase tracking-wider text-primary">
                      Chapter {index + 1}
                    </span>
                    <h3 className="font-display text-lg font-bold leading-snug text-foreground line-clamp-2">
                      {chapter.title}
                    </h3>
                  </div>
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <ArrowRight className="size-4" />
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/40 pt-3 text-[11px] font-medium text-muted-foreground">
                  <span className="rounded-full bg-muted/60 px-2 py-0.5 font-semibold text-foreground">
                    {chapter.lessonCount} {chapter.lessonCount === 1 ? "Lesson" : "Lessons"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Headphones className="size-3 text-primary" /> Audio
                  </span>
                  <span className="flex items-center gap-1">
                    <PlayCircle className="size-3 text-blue-500" /> Video
                  </span>
                  {chapter.testId && (
                    <span className="flex items-center gap-1">
                      <Sparkles className="size-3 text-emerald-500" /> Quiz
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>


          {subject.chapters.length === 0 && (
            <p className="mt-4 text-sm text-muted-foreground">
              No chapters published yet.{" "}
              <Link to="/teach" className="font-semibold text-primary">
                Add one in Studio
              </Link>
              .
            </p>
          )}
        </section>
      ))}
    </div>
  );
}
