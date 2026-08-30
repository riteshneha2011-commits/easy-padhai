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
    <div className="mx-auto w-full max-w-4xl px-3.5 sm:px-6 py-6 sm:py-10 space-y-6 min-w-0 overflow-x-hidden">
      {/* Offline Status Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 rounded-3xl border border-primary/40 bg-gradient-to-r from-primary/15 via-orange-500/10 to-amber-500/15 p-4 sm:p-5 shadow-sm min-w-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="grid size-11 sm:size-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-md">
            <WifiOff className="size-5 sm:size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-lg sm:text-2xl font-bold text-foreground truncate">
                My Offline Downloads
              </h1>
              <Badge variant="secondary" className="rounded-full text-[11px] font-bold text-primary shrink-0">
                100% Offline
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 break-words line-clamp-2">
              Listen to audio lectures and revise notes without using mobile data.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground bg-background/80 px-3 py-1.5 rounded-2xl border border-border/70 shrink-0 self-start sm:self-center">
          <HardDrive className="size-3.5 text-primary shrink-0" />
          <span>{usage.formatted} used ({usage.count} {usage.count === 1 ? "lecture" : "lectures"})</span>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm text-muted-foreground">
          Loading offline downloads…
        </div>
      ) : lessons.length === 0 ? (
        <Card className="rounded-3xl border border-dashed border-border/80 p-6 sm:p-10 text-center space-y-6 min-w-0 bg-card/60 shadow-sm">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-primary/10 text-primary ring-8 ring-primary/5">
            <Headphones className="size-8" />
          </div>
          
          <div className="max-w-md mx-auto space-y-2">
            <h2 className="font-display text-lg sm:text-xl font-bold text-foreground">
              Zero-Data Offline Learning
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Download audio lectures and summary notes while connected to Wi-Fi or mobile data. Listen anytime on your commute or during travel without using internet!
            </p>
          </div>

          {/* 3 Step Explainer */}
          <div className="grid gap-3 sm:grid-cols-3 max-w-xl mx-auto text-left pt-2">
            <div className="rounded-2xl border border-border/60 bg-secondary/30 p-3 space-y-1">
              <span className="text-xs font-bold text-primary">1. Choose Lesson</span>
              <p className="text-[11px] text-muted-foreground">Pick any lecture from Science or Maths chapters.</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-secondary/30 p-3 space-y-1">
              <span className="text-xs font-bold text-primary">2. Tap Download</span>
              <p className="text-[11px] text-muted-foreground">Saves securely in your private offline app vault.</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-secondary/30 p-3 space-y-1">
              <span className="text-xs font-bold text-primary">3. 100% Offline</span>
              <p className="text-[11px] text-muted-foreground">Play anytime, anywhere with zero mobile data.</p>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="rounded-full shadow-glow font-bold text-xs sm:text-sm px-6 h-11">
              <Link to="/learn">Explore Free Chapters &amp; Download</Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] min-w-0">
          {/* Downloaded Lectures List */}
          <div className="space-y-2.5 min-w-0">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
              Downloaded Lectures ({lessons.length})
            </h2>
            <div className="space-y-2 min-w-0">
              {lessons.map((l) => {
                const isActive = activeLesson?.id === l.id;
                return (
                  <div
                    key={l.id}
                    className={`flex items-center justify-between gap-2 rounded-2xl border p-3 sm:p-3.5 transition-all text-left min-w-0 ${
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
                      className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 text-left"
                    >
                      <div className="grid size-8 sm:size-9 shrink-0 place-items-center rounded-xl bg-secondary text-foreground">
                        {l.kind === "pdf" ? <FileText className="size-4" /> : <Headphones className="size-4" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-xs sm:text-sm truncate text-foreground">{l.title}</p>
                        <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate">
                          {l.chapter_title || "Offline Lecture"} · ~{l.duration_minutes ?? 10}m
                        </p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(l.id, l.title)}
                      className="grid size-7 sm:size-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      title="Delete offline copy"
                    >
                      <Trash2 className="size-3.5 sm:size-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Offline Player & Notes Block */}
          {activeLesson && (
            <Card className="rounded-3xl border-border/80 p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-sm min-w-0 overflow-hidden">
              <div className="space-y-1 min-w-0">
                <Badge variant="outline" className="rounded-full text-[10px] sm:text-[11px] font-bold uppercase text-primary">
                  {activeLesson.kind} · Offline Mode
                </Badge>
                <h2 className="font-display text-lg sm:text-2xl font-bold text-foreground break-words leading-tight">
                  {activeLesson.title}
                </h2>
                {activeLesson.chapter_title && (
                  <p className="text-xs text-muted-foreground break-words">
                    Chapter: {activeLesson.chapter_title}
                  </p>
                )}
              </div>

              {/* Offline Media Player */}
              <div className="rounded-2xl bg-secondary/40 p-3 sm:p-4 border border-border/60 min-w-0 overflow-hidden">
                <MediaPlayer
                  value=""
                  title={activeLesson.title}
                  kind={activeLesson.kind === "pdf" ? "pdf" : "audio"}
                  lessonId={activeLesson.id}
                />
              </div>

              {/* Summary / Notes */}
              {activeLesson.summary && (
                <div className="space-y-2 min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <BookOpen className="size-3.5 sm:size-4 text-primary" />
                    <span>Summary & Notes</span>
                  </div>
                  <div className="whitespace-pre-wrap rounded-2xl bg-secondary/50 p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed text-foreground/90 border border-border/50 break-words max-h-96 overflow-y-auto">
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
