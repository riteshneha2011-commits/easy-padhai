import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Headphones, FileText, BookOpen, Trash2, ArrowLeft, WifiOff, HardDrive, Play, Sparkles } from "lucide-react";
import { listAllOfflineLessons, removeOfflineLesson, getOfflineStorageUsage, type OfflineLessonData } from "@/lib/offline-storage";
import { MediaPlayer } from "@/components/media-player";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { soundFx } from "@/lib/sound-effects";
import { toast } from "sonner";

export const Route = createFileRoute("/offline")({
  head: () => ({
    meta: [
      { title: "Offline Downloads — Easy Padhai" },
      { name: "description", content: "Listen to your downloaded audio lectures and notes with zero internet connection." },
    ],
  }),
  component: OfflinePage,
});

function OfflinePage() {
  const [lessons, setLessons] = useState<OfflineLessonData[]>([]);
  const [activeLesson, setActiveLesson] = useState<OfflineLessonData | null>(null);
  const [usage, setUsage] = useState<{ formatted: string; count: number }>({ formatted: "0 MB", count: 0 });
  const [loading, setLoading] = useState(true);

  const loadOfflineData = async () => {
    try {
      const items = await listAllOfflineLessons();
      const storage = await getOfflineStorageUsage();
      setLessons(items);
      setUsage(storage);
      if (items.length > 0 && !activeLesson) {
        setActiveLesson(items[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOfflineData();
  }, []);

  const handleDelete = async (lessonId: string, title: string) => {
    soundFx.playClick();
    await removeOfflineLesson(lessonId);
    toast.info(`Removed "${title}" from offline downloads`);
    if (activeLesson?.id === lessonId) {
      setActiveLesson(null);
    }
    void loadOfflineData();
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:py-10 space-y-6">
      {/* Offline Status Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-primary/40 bg-gradient-to-r from-primary/15 via-orange-500/10 to-amber-500/15 p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-md">
            <WifiOff className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                My Offline Downloads
              </h1>
              <Badge variant="secondary" className="rounded-full text-xs font-bold text-primary">
                100% Offline
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Listen to audio lectures and revise notes without using mobile data.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground bg-background/80 px-3.5 py-2 rounded-2xl border border-border/70">
          <HardDrive className="size-4 text-primary" />
          <span>{usage.formatted} used ({usage.count} {usage.count === 1 ? "lecture" : "lectures"})</span>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm text-muted-foreground">
          Loading offline downloads…
        </div>
      ) : lessons.length === 0 ? (
        <Card className="rounded-3xl border-dashed p-10 text-center space-y-4">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-secondary text-muted-foreground">
            <Headphones className="size-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h2 className="font-display text-lg font-bold">No downloaded lectures yet</h2>
            <p className="text-sm text-muted-foreground">
              When connected to Wi-Fi or mobile data, tap <strong>"Download Offline"</strong> on any lesson. They will appear here for 100% zero-data playback!
            </p>
          </div>
          <Button asChild className="rounded-full shadow-md">
            <Link to="/learn">Explore Chapters & Download</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          {/* Downloaded Lectures List */}
          <div className="space-y-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
              Downloaded Lectures ({lessons.length})
            </h2>
            <div className="space-y-2">
              {lessons.map((l) => {
                const isActive = activeLesson?.id === l.id;
                return (
                  <div
                    key={l.id}
                    className={`flex items-center justify-between gap-2 rounded-2xl border p-3.5 transition-all text-left ${
                      isActive
                        ? "border-primary bg-primary/10 ring-2 ring-primary/40 shadow-sm"
                        : "border-border/70 bg-card hover:border-primary/40"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setActiveLesson(l);
                      }}
                      className="flex items-center gap-3 min-w-0 flex-1 text-left"
                    >
                      <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-secondary text-foreground">
                        {l.kind === "pdf" ? <FileText className="size-4" /> : <Headphones className="size-4" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm truncate text-foreground">{l.title}</p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {l.chapter_title || "Offline Lecture"} · ~{l.duration_minutes ?? 10}m
                        </p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(l.id, l.title)}
                      className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      title="Delete offline copy"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Offline Player & Notes Block */}
          {activeLesson && (
            <Card className="rounded-3xl border-border/80 p-5 sm:p-6 space-y-5 shadow-sm">
              <div className="space-y-1">
                <Badge variant="outline" className="rounded-full text-[11px] font-bold uppercase text-primary">
                  {activeLesson.kind} · Offline Mode
                </Badge>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                  {activeLesson.title}
                </h2>
                {activeLesson.chapter_title && (
                  <p className="text-xs text-muted-foreground">
                    Chapter: {activeLesson.chapter_title}
                  </p>
                )}
              </div>

              {/* Offline Media Player */}
              <div className="rounded-2xl bg-secondary/40 p-4 border border-border/60">
                <MediaPlayer
                  value=""
                  title={activeLesson.title}
                  kind={activeLesson.kind === "pdf" ? "pdf" : "audio"}
                  lessonId={activeLesson.id}
                />
              </div>

              {/* Summary / Notes */}
              {activeLesson.summary && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <BookOpen className="size-4 text-primary" />
                    <span>Summary & Notes</span>
                  </div>
                  <div className="whitespace-pre-wrap rounded-2xl bg-secondary/50 p-4 text-sm leading-relaxed text-foreground/90 border border-border/50">
                    {activeLesson.summary}
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
