import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Bookmark, BookmarkX, CheckCircle2, ListChecks, Trash2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { listRevision, removeBookmark, removeQuestionSave } from "@/lib/revision.functions";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MathText } from "@/components/markdown-renderer";
import { cn } from "@/lib/utils";

type TabKey = "again" | "bank" | "mistakes";

export const Route = createFileRoute("/revision")({
  validateSearch: (search: Record<string, unknown>): { tab?: TabKey } => {
    const tab = search.tab as TabKey;
    return {
      tab: ["again", "bank", "mistakes"].includes(tab) ? tab : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "My revision — Easy Padhai" },
      {
        name: "description",
        content:
          "Your personal revision hub: lessons to visit again, a revision bank of saved questions and a mistake box of every question you got wrong.",
      },
      { property: "og:title", content: "My revision — Easy Padhai" },
      {
        property: "og:description",
        content: "Visit again list, revision bank and mistake box — revise exactly what you need.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RevisionPage,
});

const RESOURCE_LABEL: Record<string, string> = {
  lesson: "Whole lesson",
  audio: "Audio",
  video: "Video",
  summary: "Summary",
  pdf: "PDF notes",
};

function RevisionPage() {
  const { user, loading } = useAuth();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const fetchRevision = useServerFn(listRevision);
  const dropBookmark = useServerFn(removeBookmark);
  const dropQuestion = useServerFn(removeQuestionSave);
  const [tab, setTab] = useState<TabKey>(search.tab ?? "mistakes");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", replace: true });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (search.tab && ["again", "bank", "mistakes"].includes(search.tab)) {
      setTab(search.tab);
    }
  }, [search.tab]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["revision", user?.id],
    queryFn: () => fetchRevision(),
    enabled: Boolean(user),
  });

  // Auto-switch tab if default has 0 items but another tab has items
  useEffect(() => {
    if (data && !search.tab) {
      if (data.mistakes.length > 0) {
        setTab("mistakes");
      } else if (data.bank.length > 0) {
        setTab("bank");
      } else if (data.bookmarks.length > 0) {
        setTab("again");
      }
    }
  }, [data, search.tab]);

  if (!user || isLoading || !data) {
    return <div className="mx-auto max-w-4xl px-4 py-16 text-muted-foreground">Loading your revision…</div>;
  }

  const tabs: Array<{ key: TabKey; label: string; count: number; icon: string }> = [
    { key: "mistakes", label: "Mistake box", count: data.mistakes.length, icon: "⚠️" },
    { key: "bank", label: "Revision bank", count: data.bank.length, icon: "💡" },
    { key: "again", label: "Visit again", count: data.bookmarks.length, icon: "📌" },
  ];

  const totalPending =
    data.bookmarks.length + data.bank.length + data.mistakes.filter((m) => !m.resolvedAt).length;

  async function handleRemoveBookmark(id: string) {
    await dropBookmark({ data: { id } });
    toast.success("Removed from Visit again");
    void refetch();
  }

  async function handleRemoveQuestion(id: string, from: string) {
    await dropQuestion({ data: { id } });
    toast.success(`Removed from ${from}`);
    void refetch();
  }

  function handleTabChange(newTab: TabKey) {
    setTab(newTab);
    void navigate({ search: { tab: newTab }, replace: true });
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold tracking-tight">My revision</h1>
      <p className="mt-1 text-muted-foreground">
        {totalPending > 0
          ? `${totalPending} item${totalPending === 1 ? "" : "s"} waiting for you. Clear them one by one.`
          : "Nothing pending — mark lessons or questions for revision as you study."}
      </p>

      <div className="mt-6 flex flex-wrap gap-2 rounded-2xl bg-secondary/60 p-1.5">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => handleTabChange(t.key)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all",
              tab === t.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
            <span className={cn(
              "rounded-full px-2 py-0.5 text-xs font-bold",
              tab === t.key ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
            )}>{t.count}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {tab === "again" && (
          <>
            {data.bookmarks.length === 0 && (
              <Empty
                icon={<Bookmark className="size-6" />}
                text="No lessons saved yet. Tap “Visit again” on any lesson that felt confusing."
              />
            )}
            {data.bookmarks.map((b) => (
              <Card key={b.id} className="rounded-3xl">
                <CardContent className="flex flex-wrap items-start justify-between gap-3 py-5">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {b.chapterTitle ?? "Chapter"} · {RESOURCE_LABEL[b.resource] ?? b.resource}
                    </p>
                    <p className="font-display text-lg font-bold">{b.lessonTitle}</p>
                    {b.note && <p className="mt-1 text-sm text-muted-foreground">“{b.note}”</p>}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {b.chapterSlug && (
                      <Button asChild size="sm" className="rounded-full">
                        <Link to="/learn/$slug" params={{ slug: b.chapterSlug }}>
                          Open lesson
                        </Link>
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => handleRemoveBookmark(b.id)}
                    >
                      <BookmarkX className="size-4" /> Clear
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}

        {tab === "bank" && (
          <>
            {data.bank.length === 0 && (
              <Empty
                icon={<ListChecks className="size-6" />}
                text="Your revision bank is empty. After a test, tap “Save to revision bank” on questions you want to revisit."
              />
            )}
            {data.bank.map((q) => (
              <QuestionCard
                key={q.id}
                item={q}
                actionLabel="I'm confident — remove"
                onRemove={() => handleRemoveQuestion(q.id, "revision bank")}
              />
            ))}
          </>
        )}

        {tab === "mistakes" && (
          <>
            {data.mistakes.length === 0 && (
              <Empty
                icon={<CheckCircle2 className="size-6" />}
                text="No mistakes recorded. Every question you get wrong in a test lands here automatically."
              />
            )}
            {data.mistakes.map((q) => (
              <QuestionCard
                key={q.id}
                item={q}
                actionLabel="Mastered — remove"
                onRemove={() => handleRemoveQuestion(q.id, "mistake box")}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

type QuestionItem = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string | null;
  topic: string | null;
  selectedIndex: number | null;
  resolvedAt: string | null;
  testId: string;
  chapterTitle: string | null;
};

function QuestionCard({
  item,
  actionLabel,
  onRemove,
}: {
  item: QuestionItem;
  actionLabel: string;
  onRemove: () => void;
}) {
  return (
    <Card className="rounded-3xl">
      <CardContent className="space-y-3 py-5">
        <div className="flex flex-wrap items-center gap-2">
          {item.chapterTitle && (
            <Badge variant="secondary" className="rounded-full text-xs">
              {item.chapterTitle}
            </Badge>
          )}
          {item.topic && (
            <Badge variant="outline" className="rounded-full text-xs">
              {item.topic}
            </Badge>
          )}
          {item.resolvedAt ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent">
              <CheckCircle2 className="size-3.5" /> Fixed since
            </span>
          ) : (
            item.selectedIndex !== null && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-destructive">
                <XCircle className="size-3.5" /> You picked the wrong option
              </span>
            )
          )}
        </div>

        <div className="font-semibold text-foreground">
          <MathText content={item.prompt} />
        </div>

        <div className="space-y-1.5 text-sm">
          {item.options.map((opt, oi) => (
            <div
              key={oi}
              className={cn(
                "rounded-xl px-3 py-2",
                oi === item.correctIndex && "bg-accent/15 font-medium text-accent",
                oi === item.selectedIndex && oi !== item.correctIndex && "bg-destructive/10 text-destructive",
              )}
            >
              <MathText content={opt} />
            </div>
          ))}
        </div>

        {item.explanation && (
          <div className="text-sm text-muted-foreground flex items-start gap-1">
            <span className="font-semibold text-foreground shrink-0">Why: </span>
            <MathText content={item.explanation} />
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          {item.testId ? (
            <Button asChild size="sm" variant="outline" className="rounded-full">
              <Link to="/test/$testId" params={{ testId: item.testId }}>
                Retake test
              </Link>
            </Button>
          ) : (
            <Button asChild size="sm" variant="outline" className="rounded-full">
              <Link to="/learn">Browse chapters</Link>
            </Button>
          )}
          <Button size="sm" variant="ghost" className="rounded-full" onClick={onRemove}>
            <Trash2 className="size-4" /> {actionLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Empty({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <Card className="rounded-3xl border-dashed">
      <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
        <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">{icon}</span>
        <p className="max-w-sm text-sm text-muted-foreground">{text}</p>
      </CardContent>
    </Card>
  );
}
