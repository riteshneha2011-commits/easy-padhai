import { useState, useMemo, useEffect } from "react";
import {
  Layers,
  Sparkles,
  BookOpen,
  Headphones,
  Video,
  FileText,
  Plus,
  Trash2,
  Edit3,
  Eye,
  Clock,
  Calendar,
  BellRing,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  X,
  CheckCircle2,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { MediaInput } from "@/components/media-input";
import { MultiVideoInput } from "@/components/multi-video-input";
import { parseLessonVideos } from "@/lib/media";
import { AiAutofill } from "@/components/ai-autofill";
import { MediaPlayer } from "@/components/media-player";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { slugify } from "@/lib/slug";
import { soundFx } from "@/lib/sound-effects";
import { cn } from "@/lib/utils";
import {
  formatScheduleDate,
  isScheduleInFuture,
  localDateTimeToIso,
  toLocalDateTimeInputString,
  getDefaultNextDayScheduleInput,
} from "@/lib/schedule";

export interface TeachCurriculumTabProps {
  data: any;
  availableClassLevels: number[];
  classOrdinalLabel: (level: number) => string;
  classLabel: (level: number) => string;
  onOpenAddClass: () => void;
  upsertSubject: (args: any) => Promise<any>;
  upsertChapter: (args: any) => Promise<any>;
  upsertLesson: (args: any) => Promise<any>;
  removeRow: (args: any) => Promise<any>;
  sendNotification: (args: any) => Promise<any>;
  refresh: () => Promise<void>;
  run: (fn: () => Promise<unknown>, message: string) => Promise<void>;
  busy?: boolean;
}

export function TeachCurriculumTab({
  data,
  availableClassLevels,
  classOrdinalLabel,
  classLabel,
  onOpenAddClass,
  upsertSubject,
  upsertChapter,
  upsertLesson,
  removeRow,
  sendNotification,
  refresh,
  run,
  busy = false,
}: TeachCurriculumTabProps) {
  const [editChapter, setEditChapter] = useState<string | null>(null);
  const [editLesson, setEditLesson] = useState<string | null>(null);
  const [editSubject, setEditSubject] = useState<string | null>(null);

  const [notifyImmediate, setNotifyImmediate] = useState(true);
  const [notifyScheduleNow, setNotifyScheduleNow] = useState(false);
  const [notifyWhenLive, setNotifyWhenLive] = useState(true);

  const [pubClassFilter, setPubClassFilter] = useState<number | "all">("all");
  const [pubSubjectFilter, setPubSubjectFilter] = useState<string>("");
  const [pubChapterFilter, setPubChapterFilter] = useState<string>("");
  const [pubSearch, setPubSearch] = useState<string>("");
  const [collapsedChapters, setCollapsedChapters] = useState<Record<string, boolean>>({});
  const [allChaptersCollapsed, setAllChaptersCollapsed] = useState<boolean>(false);

  const [activeCreatePanel, setActiveCreatePanel] = useState<"subject" | "chapter" | "lesson" | null>(null);
  const [previewLessonData, setPreviewLessonData] = useState<{ lesson: any; chapter: any; subject: any } | null>(null);

  const toggleAllChapters = () => {
    const nextState = !allChaptersCollapsed;
    setAllChaptersCollapsed(nextState);
    const map: Record<string, boolean> = {};
    (data?.chapters ?? []).forEach((c: any) => {
      map[c.id] = nextState;
    });
    setCollapsedChapters(map);
  };

  const [newLessonClass, setNewLessonClass] = useState<number>(9);
  const [newLessonSubjectId, setNewLessonSubjectId] = useState("");
  const [newLessonChapterId, setNewLessonChapterId] = useState("");
  const [newLessonOrder, setNewLessonOrder] = useState<number>(1);
  const [newLessonKey, setNewLessonKey] = useState(0);
  const [newLessonPublishMode, setNewLessonPublishMode] = useState<"immediate" | "schedule" | "draft">("immediate");
  const [newLessonScheduledAt, setNewLessonScheduledAt] = useState<string>("");

  const [newChapterClass, setNewChapterClass] = useState<number>(9);
  const [newChapterSubjectId, setNewChapterSubjectId] = useState("");
  const [newChapterOrder, setNewChapterOrder] = useState<number>(1);
  const [newChapterKey, setNewChapterKey] = useState(0);

  const subjectsForNewChapter = useMemo(() => {
    return data?.subjects?.filter((s: any) => s.class_level === newChapterClass) || [];
  }, [data?.subjects, newChapterClass]);
  const effectiveSubjectId = newChapterSubjectId && subjectsForNewChapter.some((s: any) => s.id === newChapterSubjectId)
    ? newChapterSubjectId
    : (subjectsForNewChapter[0]?.id || data?.subjects?.[0]?.id || "");

  const subjectsForNewLesson = useMemo(() => {
    return data?.subjects?.filter((s: any) => s.class_level === newLessonClass) || [];
  }, [data?.subjects, newLessonClass]);
  const effectiveLessonSubjectId = newLessonSubjectId && subjectsForNewLesson.some((s: any) => s.id === newLessonSubjectId)
    ? newLessonSubjectId
    : (subjectsForNewLesson[0]?.id || data?.subjects?.[0]?.id || "");
  const availableChaptersForNewLesson = data?.chapters?.filter((c: any) => c.subject_id === effectiveLessonSubjectId) || [];
  const effectiveChapterId = newLessonChapterId && availableChaptersForNewLesson.some((c: any) => c.id === newLessonChapterId)
    ? newLessonChapterId
    : (availableChaptersForNewLesson[0]?.id || "");

  useEffect(() => {
    if (data?.lessons && effectiveChapterId) {
      const chapLessons = data.lessons.filter((l: any) => l.chapter_id === effectiveChapterId);
      const nextOrder = chapLessons.length > 0
        ? Math.max(...chapLessons.map((l: any) => l.order_index ?? 0)) + 1
        : 1;
      setNewLessonOrder(nextOrder);
    }
  }, [data?.lessons, effectiveChapterId]);

  useEffect(() => {
    if (data?.chapters && effectiveSubjectId) {
      const subChapters = data.chapters.filter((c: any) => c.subject_id === effectiveSubjectId);
      const nextOrder = subChapters.length > 0
        ? Math.max(...subChapters.map((c: any) => c.order_index ?? 0)) + 1
        : 1;
      setNewChapterOrder(nextOrder);
    }
  }, [data?.chapters, effectiveSubjectId]);

  return (
    <div className="space-y-6">
      {/* Quick Creation Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-3xl border border-border/80 bg-gradient-to-r from-primary/10 via-secondary/40 to-background shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-base font-bold text-foreground">Content Management</h2>
            <Badge variant="secondary" className="text-[10px] font-semibold text-primary">
              {data?.subjects?.length ?? 0} Subjects · {data?.chapters?.length ?? 0} Chapters · {data?.lessons?.length ?? 0} Lectures
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Organize curriculum easily or click below to quickly publish a new lecture, chapter, or subject.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant={activeCreatePanel === "lesson" ? "default" : "outline"}
            onClick={() => {
              soundFx.playClick();
              setActiveCreatePanel(activeCreatePanel === "lesson" ? null : "lesson");
            }}
            className={cn(
              "rounded-full text-xs font-semibold gap-1.5 h-8.5 transition-all shadow-xs",
              activeCreatePanel === "lesson"
                ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30"
                : "bg-card hover:border-primary/50"
            )}
          >
            <Headphones className="size-3.5" />
            <span>{activeCreatePanel === "lesson" ? "Close Lesson Form ✕" : "+ New Audio Lesson"}</span>
          </Button>

          <Button
            size="sm"
            variant={activeCreatePanel === "chapter" ? "default" : "outline"}
            onClick={() => {
              soundFx.playClick();
              setActiveCreatePanel(activeCreatePanel === "chapter" ? null : "chapter");
            }}
            className={cn(
              "rounded-full text-xs font-semibold gap-1.5 h-8.5 transition-all shadow-xs",
              activeCreatePanel === "chapter"
                ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30"
                : "bg-card hover:border-primary/50"
            )}
          >
            <BookOpen className="size-3.5" />
            <span>{activeCreatePanel === "chapter" ? "Close Chapter Form ✕" : "+ New Chapter"}</span>
          </Button>

          <Button
            size="sm"
            variant={activeCreatePanel === "subject" ? "default" : "outline"}
            onClick={() => {
              soundFx.playClick();
              setActiveCreatePanel(activeCreatePanel === "subject" ? null : "subject");
            }}
            className={cn(
              "rounded-full text-xs font-semibold gap-1.5 h-8.5 transition-all shadow-xs",
              activeCreatePanel === "subject"
                ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30"
                : "bg-card hover:border-primary/50"
            )}
          >
            <Layers className="size-3.5" />
            <span>{activeCreatePanel === "subject" ? "Close Subject Form ✕" : "+ New Subject"}</span>
          </Button>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              soundFx.playClick();
              onOpenAddClass();
            }}
            className="rounded-full text-xs font-semibold gap-1.5 h-8.5 bg-card hover:border-primary/50 shadow-xs text-primary"
          >
            <GraduationCap className="size-3.5" />
            <span>+ Add Class</span>
          </Button>
        </div>
      </div>

      {/* Collapsible Panel 1: Subjects */}
      {activeCreatePanel === "subject" && (
        <Card className="rounded-3xl border-primary/40 shadow-md animate-in fade-in-50 duration-200">
          <CardHeader className="pb-2 flex flex-row items-center justify-between border-b border-border/40">
            <div>
              <CardTitle className="font-display text-base sm:text-lg flex items-center gap-2">
                <Layers className="size-4 text-primary" /> Manage Subjects
              </CardTitle>
              <CardDescription className="text-xs">Add a new academic subject or edit existing subjects.</CardDescription>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setActiveCreatePanel(null)}
              className="rounded-full h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="size-4 mr-1" /> Close
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            {/* Platform Classes Quick Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-secondary/40 border border-border/60 mb-4">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold text-foreground mr-1">Platform Classes:</span>
                {availableClassLevels.map((lvl) => (
                  <Badge key={lvl} variant="secondary" className="rounded-full px-2.5 py-0.5 text-xs font-semibold">
                    {classOrdinalLabel(lvl)}
                  </Badge>
                ))}
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="rounded-full text-xs font-bold h-7 gap-1"
                onClick={onOpenAddClass}
              >
                <Plus className="size-3.5" /> Add New Class
              </Button>
            </div>

            <form
              className="grid gap-3 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget as HTMLFormElement;
                const f = new FormData(form);
                void run(
                  () =>
                    upsertSubject({
                      data: {
                        name: String(f.get("name") ?? ""),
                        slug: slugify(String(f.get("name") ?? "")),
                        class_level: Number(f.get("class_level") ?? 9),
                        description: String(f.get("description") ?? "") || null,
                        order_index: Number(f.get("order_index") ?? 1),
                        published: true,
                      },
                    }),
                  "Subject saved",
                );
                form.reset();
              }}
            >
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input name="name" required placeholder="e.g. Science" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label>Class</Label>
                  <button
                    type="button"
                    onClick={onOpenAddClass}
                    className="text-[11px] font-bold text-primary hover:underline"
                  >
                    + Add new class
                  </button>
                </div>
                <select
                  name="class_level"
                  defaultValue={availableClassLevels[0] ?? 9}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-semibold"
                >
                  {availableClassLevels.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {classOrdinalLabel(lvl)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Description</Label>
                <Input name="description" placeholder="Short description" />
              </div>
              <div className="space-y-1.5">
                <Label>Order</Label>
                <Input name="order_index" type="number" defaultValue={(data?.subjects?.length ?? 0) + 1} />
              </div>
              <Button type="submit" disabled={busy} className="rounded-full sm:col-span-2">
                Add subject
              </Button>
            </form>

            <div className="mt-4 divide-y">
              {(data?.subjects ?? []).map((s: any) => (
                <div key={s.id} className="py-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{s.name}</span>{" "}
                      <Badge variant="secondary">{classOrdinalLabel(s.class_level)}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditSubject(editSubject === s.id ? null : s.id)}
                      >
                        {editSubject === s.id ? "Cancel" : "Edit"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => run(() => removeRow({ data: { table: "subjects", id: s.id } }), "Subject deleted")}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  {editSubject === s.id && (
                    <form
                      className="mt-3 grid gap-3 sm:grid-cols-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const f = new FormData(e.currentTarget);
                        void run(
                          () =>
                            upsertSubject({
                              data: {
                                id: s.id,
                                name: String(f.get("name") ?? s.name),
                                slug: slugify(String(f.get("name") ?? s.name)),
                                class_level: Number(f.get("class_level") ?? s.class_level),
                                description: String(f.get("description") ?? s.description ?? "") || null,
                                order_index: Number(f.get("order_index") ?? s.order_index ?? 1),
                                published: (f.get("published") as string) === "on",
                              },
                            }),
                          "Subject updated",
                        );
                        setEditSubject(null);
                      }}
                    >
                      <div className="space-y-1.5">
                        <Label>Name</Label>
                        <Input name="name" defaultValue={s.name} required />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Class</Label>
                        <select
                          name="class_level"
                          defaultValue={s.class_level}
                          className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-semibold"
                        >
                          {availableClassLevels.map((lvl) => (
                            <option key={lvl} value={lvl}>
                              {classOrdinalLabel(lvl)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label>Description</Label>
                        <Input name="description" defaultValue={s.description ?? ""} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Order</Label>
                        <Input name="order_index" type="number" defaultValue={s.order_index ?? 1} />
                      </div>
                      <label className="flex items-center gap-2 text-sm sm:col-span-2">
                        <input type="checkbox" name="published" defaultChecked={s.published} />
                        Published
                      </label>
                      <Button type="submit" disabled={busy} className="rounded-full sm:col-span-2">
                        Save Subject Changes
                      </Button>
                    </form>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Collapsible Panel 2: Chapter */}
      {activeCreatePanel === "chapter" && (
        <Card className="rounded-3xl border-primary/40 shadow-md animate-in fade-in-50 duration-200">
          <CardHeader className="pb-2 flex flex-row items-center justify-between border-b border-border/40">
            <div>
              <CardTitle className="font-display text-base sm:text-lg flex items-center gap-2">
                <BookOpen className="size-4 text-primary" /> New Chapter
              </CardTitle>
              <CardDescription className="text-xs">Publish a chapter under a class and subject.</CardDescription>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setActiveCreatePanel(null)}
              className="rounded-full h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="size-4 mr-1" /> Close
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            <form
              key={`new-chap-${newChapterKey}`}
              className="grid gap-3 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget as HTMLFormElement;
                const f = new FormData(form);
                const title = String(f.get("title") ?? "");
                const slug = String(f.get("slug") ?? "").trim() || slugify(title);
                const targetSubjectId = effectiveSubjectId;
                const targetClass = newChapterClass;
                void run(
                  () =>
                    upsertChapter({
                      data: {
                        subject_id: targetSubjectId,
                        title,
                        slug,
                        description: String(f.get("description") ?? "") || null,
                        order_index: newChapterOrder,
                        published: true,
                      },
                    }),
                  "Chapter created",
                ).then(() => {
                  setPubClassFilter(targetClass);
                  setPubSubjectFilter(targetSubjectId);
                  setPubChapterFilter("");
                });
                form.reset();
                setNewChapterKey((k) => k + 1);
              }}
            >
              <div className="space-y-1.5">
                <Label>Class</Label>
                <select
                  value={newChapterClass}
                  onChange={(e) => {
                    const cls = Number(e.target.value);
                    setNewChapterClass(cls);
                    setNewChapterSubjectId("");
                  }}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-semibold"
                >
                  {availableClassLevels.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {classOrdinalLabel(lvl)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Subject</Label>
                <select
                  name="subject_id"
                  value={effectiveSubjectId}
                  onChange={(e) => setNewChapterSubjectId(e.target.value)}
                  required
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-semibold"
                >
                  {subjectsForNewChapter.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({classLabel(s.class_level)})
                    </option>
                  ))}
                  {subjectsForNewChapter.length === 0 && (
                    <option value="">No subjects in {classLabel(newChapterClass)}</option>
                  )}
                </select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Order</Label>
                <Input
                  name="order_index"
                  type="number"
                  value={newChapterOrder}
                  onChange={(e) => setNewChapterOrder(Number(e.target.value))}
                  required
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <Label>Title</Label>
                  <AiAutofill mode="chapter" />
                </div>
                <Input name="title" required placeholder="e.g. Motion" />
              </div>
              <div className="space-y-1.5">
                <Label>Slug (URL key)</Label>
                <Input name="slug" placeholder="e.g. motion (auto-generated if blank)" />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Input name="description" placeholder="Short description or overview" />
              </div>
              <Button type="submit" disabled={busy} className="rounded-full sm:col-span-2">
                Publish chapter
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Collapsible Panel 3: Lesson */}
      {activeCreatePanel === "lesson" && (
        <Card className="rounded-3xl border-primary/40 shadow-md animate-in fade-in-50 duration-200">
          <CardHeader className="pb-2 flex flex-row items-center justify-between border-b border-border/40">
            <div>
              <CardTitle className="font-display text-base sm:text-lg flex items-center gap-2">
                <Headphones className="size-4 text-primary" /> New Lesson / Audio Lecture
              </CardTitle>
              <CardDescription className="text-xs">Upload audio, notes, summary, and set publish mode.</CardDescription>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setActiveCreatePanel(null)}
              className="rounded-full h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="size-4 mr-1" /> Close
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            <form
              key={`new-lesson-${newLessonKey}`}
              className="grid gap-3 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget as HTMLFormElement;
                const f = new FormData(form);
                const targetClass = newLessonClass;
                const targetSubjectId = effectiveLessonSubjectId;
                const targetChapterId = effectiveChapterId;
                const isDraft = newLessonPublishMode === "draft";
                const rawSched = String(f.get("scheduled_at") ?? newLessonScheduledAt ?? "").trim();
                const scheduledAt =
                  newLessonPublishMode === "schedule" && rawSched ? localDateTimeToIso(rawSched) : null;
                const successMsg = scheduledAt
                  ? `Lesson scheduled for ${formatScheduleDate(scheduledAt)}`
                  : isDraft
                  ? "Lesson saved as draft"
                  : "Lesson published";
                const lessonTitle = String(f.get("title") ?? "").trim();
                const targetChap = data?.chapters?.find((c: any) => c.id === targetChapterId);
                const chapTitle = targetChap?.title || "";
                const chapSlug = targetChap?.slug || "";

                void run(
                  () =>
                    upsertLesson({
                      data: {
                        chapter_id: targetChapterId,
                        title: lessonTitle,
                        kind: String(f.get("kind") ?? "audio"),
                        audio_url: String(f.get("audio_url") ?? "") || null,
                        video_url: String(f.get("video_url") ?? "") || null,
                        pdf_url: String(f.get("pdf_url") ?? "") || null,
                        summary: String(f.get("summary") ?? "") || null,
                        duration_minutes: Number(f.get("duration_minutes") ?? 10),
                        order_index: newLessonOrder,
                        published: !isDraft,
                        scheduled_at: scheduledAt,
                        notify_students: !isDraft && (newLessonPublishMode === "schedule" ? notifyWhenLive : notifyImmediate),
                      },
                    }),
                  successMsg,
                ).then(() => {
                  // 1. Immediate Publish Notification
                  if (!isDraft && newLessonPublishMode === "immediate" && notifyImmediate) {
                    void sendNotification({
                      data: {
                        title: `New Lecture: ${lessonTitle}`,
                        message: `${chapTitle ? chapTitle + " · " : ""}${lessonTitle} is now live! Tap to start learning.`,
                        action_url: chapSlug ? `/learn/${chapSlug}` : "/learn",
                        target_class: targetClass,
                        target_subject_id: targetSubjectId,
                        type: "lecture",
                      },
                    });
                  }

                  // 2. Scheduled Release Notifications (Dual Options)
                  if (!isDraft && newLessonPublishMode === "schedule" && scheduledAt) {
                    if (notifyScheduleNow) {
                      void sendNotification({
                        data: {
                          title: `📢 Upcoming: ${lessonTitle}`,
                          message: `Scheduled to premiere on ${formatScheduleDate(scheduledAt)} in ${chapTitle}. Mark your calendar!`,
                          action_url: chapSlug ? `/learn/${chapSlug}` : "/learn",
                          target_class: targetClass,
                          target_subject_id: targetSubjectId,
                          type: "lecture",
                        },
                      });
                    }

                    if (notifyWhenLive) {
                      void sendNotification({
                        data: {
                          title: `🔴 Now Live: ${lessonTitle}`,
                          message: `${chapTitle ? chapTitle + " · " : ""}${lessonTitle} is now live! Tap to start learning.`,
                          action_url: chapSlug ? `/learn/${chapSlug}` : "/learn",
                          target_class: targetClass,
                          target_subject_id: targetSubjectId,
                          type: "lecture",
                          publish_at: scheduledAt,
                        },
                      });
                    }
                  }
                  setPubClassFilter(targetClass);
                  setPubSubjectFilter(targetSubjectId);
                  setPubChapterFilter(targetChapterId);
                  setCollapsedChapters((prev) => ({ ...prev, [targetChapterId]: false }));
                  setNewLessonPublishMode("immediate");
                  setNewLessonScheduledAt("");
                });
                form.reset();
                setNewLessonKey((k) => k + 1);
              }}
            >
              <div className="space-y-1.5">
                <Label>Class</Label>
                <select
                  value={newLessonClass}
                  onChange={(e) => {
                    const cls = Number(e.target.value);
                    setNewLessonClass(cls);
                    setNewLessonSubjectId("");
                    setNewLessonChapterId("");
                  }}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-semibold"
                >
                  {availableClassLevels.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {classOrdinalLabel(lvl)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label>Subject</Label>
                <select
                  value={effectiveLessonSubjectId}
                  onChange={(e) => {
                    setNewLessonSubjectId(e.target.value);
                    setNewLessonChapterId("");
                  }}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-semibold"
                >
                  {subjectsForNewLesson.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({classLabel(s.class_level)})
                    </option>
                  ))}
                  {subjectsForNewLesson.length === 0 && (
                    <option value="">No subjects in {classLabel(newLessonClass)}</option>
                  )}
                </select>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label>Chapter</Label>
                <select
                  name="chapter_id"
                  value={effectiveChapterId}
                  onChange={(e) => setNewLessonChapterId(e.target.value)}
                  required
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-semibold"
                >
                  {availableChaptersForNewLesson.length === 0 && (
                    <option value="">No chapters created yet in this subject</option>
                  )}
                  {availableChaptersForNewLesson.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      #{c.order_index} {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label>Lesson title</Label>
                <Input name="title" required placeholder="e.g. Speed vs Velocity" />
              </div>
              <div className="space-y-1.5">
                <Label>Kind</Label>
                <select
                  name="kind"
                  defaultValue="audio"
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                >
                  <option value="audio">Audio lecture</option>
                  <option value="video">Video lecture</option>
                  <option value="summary">Summary</option>
                  <option value="pdf">PDF notes</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Duration (min)</Label>
                  <Input name="duration_minutes" type="number" defaultValue={10} />
                </div>
                <div className="space-y-1.5">
                  <Label>Order</Label>
                  <Input
                    name="order_index"
                    type="number"
                    value={newLessonOrder}
                    onChange={(e) => setNewLessonOrder(Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <MediaInput name="audio_url" label="Audio File" type="audio" />
              </div>
              <div className="sm:col-span-2">
                <MultiVideoInput name="video_url" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <MediaInput name="pdf_url" label="PDF Document" type="pdf" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <Label>Summary notes / formulas</Label>
                  <AiAutofill mode="lesson" />
                </div>
                <Textarea
                  name="summary"
                  placeholder="Bullet summary or key formula (Markdown supported, or use Auto-generate)"
                  rows={3}
                  className="rounded-xl text-sm"
                />
              </div>

              <div className="space-y-2 sm:col-span-2 rounded-2xl border border-border/60 bg-muted/20 p-3.5">
                <div className="flex items-center justify-between">
                  <Label className="font-semibold text-xs flex items-center gap-1.5">
                    <Clock className="size-3.5 text-primary" /> Release Schedule & Visibility
                  </Label>
                  <span className="text-[11px] text-muted-foreground">Control when learners can access this lecture</span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setNewLessonPublishMode("immediate")}
                    className={cn(
                      "flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-medium transition-all cursor-pointer",
                      newLessonPublishMode === "immediate"
                        ? "border-primary bg-primary/10 text-primary font-semibold shadow-xs ring-1 ring-primary/30"
                        : "border-border/60 bg-background/50 text-muted-foreground hover:bg-muted/40",
                    )}
                  >
                    <span className="text-base mb-0.5">🟢</span>
                    <span>Publish Now</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewLessonPublishMode("schedule");
                      if (!newLessonScheduledAt) {
                        setNewLessonScheduledAt(getDefaultNextDayScheduleInput());
                      }
                    }}
                    className={cn(
                      "flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-medium transition-all cursor-pointer",
                      newLessonPublishMode === "schedule"
                        ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold shadow-xs ring-1 ring-amber-500/30"
                        : "border-border/60 bg-background/50 text-muted-foreground hover:bg-muted/40",
                    )}
                  >
                    <span className="text-base mb-0.5">⏳</span>
                    <span>Schedule Later</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewLessonPublishMode("draft")}
                    className={cn(
                      "flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-medium transition-all cursor-pointer",
                      newLessonPublishMode === "draft"
                        ? "border-zinc-500 bg-zinc-500/10 text-foreground font-semibold shadow-xs ring-1 ring-zinc-500/30"
                        : "border-border/60 bg-background/50 text-muted-foreground hover:bg-muted/40",
                    )}
                  >
                    <span className="text-base mb-0.5">📝</span>
                    <span>Save as Draft</span>
                  </button>
                </div>

                {newLessonPublishMode === "schedule" && (
                  <div className="mt-2.5 pt-2 border-t border-border/50 space-y-1.5 animate-in fade-in duration-200">
                    <Label className="text-xs font-medium flex items-center gap-1 text-amber-600 dark:text-amber-400">
                      <Calendar className="size-3.5" /> Select Release Date & Time (IST)
                    </Label>
                    <Input
                      type="datetime-local"
                      name="scheduled_at"
                      value={newLessonScheduledAt}
                      onChange={(e) => setNewLessonScheduledAt(e.target.value)}
                      required={newLessonPublishMode === "schedule"}
                      className="rounded-xl bg-background"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Students will see an "Upcoming Lecture" countdown card until this time, after which the video/audio unlocks automatically.
                    </p>
                  </div>
                )}
              </div>

              {/* Immediate Publish Notification Checkbox */}
              {newLessonPublishMode === "immediate" && (
                <div className="sm:col-span-2 rounded-2xl border border-border/70 bg-card p-3.5 flex items-start gap-3 shadow-2xs">
                  <input
                    type="checkbox"
                    id="notify_immediate_toggle"
                    checked={notifyImmediate}
                    onChange={(e) => setNotifyImmediate(e.target.checked)}
                    className="mt-0.5 size-4 rounded accent-primary text-primary cursor-pointer shrink-0"
                  />
                  <label htmlFor="notify_immediate_toggle" className="flex flex-col cursor-pointer select-none">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <BellRing className="size-3.5 text-primary" /> Notify students immediately
                    </span>
                    <span className="text-[11px] text-muted-foreground mt-0.5">
                      Sends an in-app notification to students of this class that this lecture is now live. Uncheck if you are uploading multiple lectures in bulk.
                    </span>
                  </label>
                </div>
              )}

              {/* Scheduled Release Notification Preferences */}
              {newLessonPublishMode === "schedule" && (
                <div className="sm:col-span-2 space-y-2.5 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BellRing className="size-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                        Schedule Notification Preferences
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-semibold border-amber-500/30 text-amber-700 dark:text-amber-400">
                      2 Flexible Options
                    </Badge>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/80 p-3 hover:border-border transition-colors">
                    <input
                      type="checkbox"
                      id="notify_schedule_now_toggle"
                      checked={notifyScheduleNow}
                      onChange={(e) => setNotifyScheduleNow(e.target.checked)}
                      className="mt-0.5 size-4 rounded accent-primary text-primary cursor-pointer shrink-0"
                    />
                    <label htmlFor="notify_schedule_now_toggle" className="flex flex-col cursor-pointer select-none">
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <span>📢</span> Notify now (Advance Announcement)
                      </span>
                      <span className="text-[11px] text-muted-foreground mt-0.5">
                        Sends an immediate broadcast right now: <em>"Upcoming lecture scheduled for {newLessonScheduledAt ? formatScheduleDate(newLessonScheduledAt) : "selected date"}."</em> Great for letting students plan ahead.
                      </span>
                    </label>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-3 hover:border-emerald-500/60 transition-colors">
                    <input
                      type="checkbox"
                      id="notify_when_live_toggle"
                      checked={notifyWhenLive}
                      onChange={(e) => setNotifyWhenLive(e.target.checked)}
                      className="mt-0.5 size-4 rounded accent-emerald-600 text-emerald-600 cursor-pointer shrink-0"
                    />
                    <label htmlFor="notify_when_live_toggle" className="flex flex-col cursor-pointer select-none">
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                        <span>🔴</span> Notify automatically when lecture goes LIVE (Recommended)
                      </span>
                      <span className="text-[11px] text-muted-foreground mt-0.5">
                        The system holds this alert until {newLessonScheduledAt ? formatScheduleDate(newLessonScheduledAt) : "the scheduled release time"}, and instantly delivers: <em>"Now Live: [Lecture Title] is ready to learn!"</em> at the exact minute it unlocks.
                      </span>
                    </label>
                  </div>
                </div>
              )}

              <Button type="submit" disabled={busy} className="rounded-full sm:col-span-2">
                {newLessonPublishMode === "schedule" ? (
                  <>
                    <Clock className="size-4 mr-1.5" /> Schedule Lecture
                  </>
                ) : newLessonPublishMode === "draft" ? (
                  "Save as Draft"
                ) : (
                  "Publish Lesson"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Published Content Hierarchy & Filter Cards */}
      <Card className="rounded-3xl border-border/80 shadow-sm">
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <CardTitle className="font-display text-lg">Published content</CardTitle>
              <CardDescription>
                Filter by subject & chapter or collapse rows to navigate lectures effortlessly.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 text-xs font-semibold rounded-full"
                onClick={toggleAllChapters}
              >
                {allChaptersCollapsed ? (
                  <>
                    <ChevronDown className="size-3.5 mr-1 text-primary" /> Expand All Chapters
                  </>
                ) : (
                  <>
                    <ChevronUp className="size-3.5 mr-1" /> Collapse All Chapters
                  </>
                )}
              </Button>
              {(pubClassFilter !== "all" || pubSubjectFilter || pubChapterFilter || pubSearch) && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-8 text-xs text-muted-foreground hover:text-foreground rounded-full"
                  onClick={() => {
                    setPubClassFilter("all");
                    setPubSubjectFilter("");
                    setPubChapterFilter("");
                    setPubSearch("");
                  }}
                >
                  Reset Filter
                </Button>
              )}
            </div>
          </div>

          {/* Class Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2">
            <button
              type="button"
              onClick={() => {
                setPubClassFilter("all");
                setPubSubjectFilter("");
                setPubChapterFilter("");
              }}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-bold transition-all",
                pubClassFilter === "all"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-secondary text-muted-foreground hover:text-foreground",
              )}
            >
              All Classes
            </button>
            {availableClassLevels.map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => {
                  setPubClassFilter(lvl);
                  setPubSubjectFilter("");
                  setPubChapterFilter("");
                }}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-bold transition-all",
                  pubClassFilter === lvl
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-secondary text-muted-foreground hover:text-foreground",
                )}
              >
                {classOrdinalLabel(lvl)}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                onOpenAddClass();
              }}
              className="rounded-full px-3 py-1 text-xs font-bold transition-all border border-dashed border-primary/50 text-primary hover:bg-primary/10 flex items-center gap-1 cursor-pointer"
              title="Add another class level (e.g. Class 5th, 6th, 7th, 8th)"
            >
              <Plus className="size-3" /> Add Class
            </button>
          </div>

          {/* Subject & Chapter Filter Dropdowns */}
          <div className="mt-3 grid gap-2.5 sm:grid-cols-3 pt-2">
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                <Filter className="size-3" /> Filter by Subject
              </Label>
              <select
                value={pubSubjectFilter}
                onChange={(e) => {
                  setPubSubjectFilter(e.target.value);
                  setPubChapterFilter("");
                }}
                className="h-9 w-full rounded-xl border border-input bg-background px-2.5 text-xs font-medium focus:ring-2 focus:ring-primary/20"
              >
                <option value="">
                  All Subjects (
                  {
                    (pubClassFilter === "all"
                      ? (data?.subjects ?? [])
                      : (data?.subjects ?? []).filter((s: any) => s.class_level === pubClassFilter)
                    ).length
                  }
                  )
                </option>
                {(pubClassFilter === "all"
                  ? (data?.subjects ?? [])
                  : (data?.subjects ?? []).filter((s: any) => s.class_level === pubClassFilter)
                ).map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({classLabel(s.class_level)})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                <BookOpen className="size-3" /> Filter by Chapter
              </Label>
              <select
                value={pubChapterFilter}
                onChange={(e) => setPubChapterFilter(e.target.value)}
                className="h-9 w-full rounded-xl border border-input bg-background px-2.5 text-xs font-medium focus:ring-2 focus:ring-primary/20"
              >
                <option value="">
                  {pubSubjectFilter ? "All Chapters in this Subject" : "All Chapters"} (
                  {
                    (pubSubjectFilter
                      ? (data?.chapters ?? []).filter((c: any) => c.subject_id === pubSubjectFilter)
                      : pubClassFilter !== "all"
                      ? (data?.chapters ?? []).filter((c: any) => {
                          const s = (data?.subjects ?? []).find((sub: any) => sub.id === c.subject_id);
                          return s?.class_level === pubClassFilter;
                        })
                      : (data?.chapters ?? [])
                    ).length
                  }
                  )
                </option>
                {(pubSubjectFilter
                  ? (data?.chapters ?? []).filter((c: any) => c.subject_id === pubSubjectFilter)
                  : pubClassFilter !== "all"
                  ? (data?.chapters ?? []).filter((c: any) => {
                      const s = (data?.subjects ?? []).find((sub: any) => sub.id === c.subject_id);
                      return s?.class_level === pubClassFilter;
                    })
                  : (data?.chapters ?? [])
                ).map((c: any) => (
                  <option key={c.id} value={c.id}>
                    #{c.order_index} {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                <Search className="size-3" /> Quick Search
              </Label>
              <div className="relative">
                <Input
                  value={pubSearch}
                  onChange={(e) => setPubSearch(e.target.value)}
                  placeholder="Search chapter, lesson, or topic..."
                  className="h-9 rounded-xl text-xs pr-7"
                />
                {pubSearch && (
                  <button
                    type="button"
                    onClick={() => setPubSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-4">
          {(data?.subjects ?? [])
            .filter((sub: any) => {
              if (pubClassFilter !== "all" && sub.class_level !== pubClassFilter) return false;
              if (pubSubjectFilter && sub.id !== pubSubjectFilter) return false;
              return true;
            })
            .map((sub: any) => {
              const subChapters = (data?.chapters ?? [])
                .filter((c: any) => c.subject_id === sub.id)
                .filter((c: any) => {
                  if (pubChapterFilter && c.id !== pubChapterFilter) return false;
                  if (pubSearch.trim()) {
                    const q = pubSearch.toLowerCase().trim();
                    const matchChap =
                      c.title.toLowerCase().includes(q) ||
                      (c.slug && c.slug.toLowerCase().includes(q)) ||
                      (c.description && c.description.toLowerCase().includes(q));
                    const matchLesson = (data?.lessons ?? []).some(
                      (l: any) => l.chapter_id === c.id && l.title.toLowerCase().includes(q),
                    );
                    return matchChap || matchLesson;
                  }
                  return true;
                });

              if (subChapters.length === 0 && (pubSubjectFilter || pubChapterFilter || pubSearch)) {
                return null;
              }

              return (
                <div key={sub.id} className="rounded-2xl border border-border/70 bg-card p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs font-semibold uppercase tracking-wider">
                        {classLabel(sub.class_level)}
                      </Badge>
                      <h3 className="font-display text-base font-bold text-foreground">
                        {sub.name}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        ({subChapters.length} {subChapters.length === 1 ? "Chapter" : "Chapters"})
                      </span>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs text-primary"
                      onClick={() => {
                        setNewChapterClass(sub.class_level);
                        setNewChapterSubjectId(sub.id);
                        setActiveCreatePanel("chapter");
                        window.scrollTo({ top: 180, behavior: "smooth" });
                      }}
                    >
                      <Plus className="size-3 mr-1" /> Add Chapter
                    </Button>
                  </div>

                  {subChapters.length === 0 ? (
                    <p className="text-xs italic text-muted-foreground py-2">
                      No chapters in this subject match your filter.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {subChapters.map((c: any) => {
                        const chapLessons = (data?.lessons ?? []).filter((l: any) => l.chapter_id === c.id);
                        const isCollapsed = Boolean(collapsedChapters[c.id]) && pubChapterFilter !== c.id;
                        const audioCount = chapLessons.filter((l: any) => Boolean(l.audio_url)).length;
                        const videoCount = chapLessons.reduce((acc: number, l: any) => acc + (l.video_url ? parseLessonVideos(l.video_url).length : 0), 0);
                        const pdfCount = chapLessons.filter((l: any) => Boolean(l.pdf_url)).length;
                        const summaryCount = chapLessons.filter((l: any) => Boolean(l.summary)).length;

                        return (
                          <div
                            key={c.id}
                            className="rounded-xl border border-border/60 bg-secondary/30 transition-all hover:border-border"
                          >
                            {/* Chapter Header / Toggle Row */}
                            <div className="flex flex-wrap items-center justify-between gap-2 p-3">
                              <button
                                type="button"
                                onClick={() =>
                                  setCollapsedChapters((prev) => ({
                                    ...prev,
                                    [c.id]: !isCollapsed,
                                  }))
                                }
                                className="flex flex-1 min-w-[200px] items-center gap-2 text-left cursor-pointer group"
                              >
                                <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                                  #{c.order_index}
                                </span>
                                <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                  {c.title}
                                </span>
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
                                  {chapLessons.length} {chapLessons.length === 1 ? "lesson" : "lessons"}
                                </Badge>

                                {/* Media summary badges */}
                                <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-muted-foreground ml-1">
                                  {audioCount > 0 && (
                                    <span className="inline-flex items-center gap-0.5 text-primary">
                                      <Headphones className="size-3" /> {audioCount}
                                    </span>
                                  )}
                                  {videoCount > 0 && (
                                    <span className="inline-flex items-center gap-0.5 text-blue-500">
                                      <Video className="size-3" /> {videoCount}
                                    </span>
                                  )}
                                  {pdfCount > 0 && (
                                    <span className="inline-flex items-center gap-0.5 text-orange-500">
                                      <FileText className="size-3" /> {pdfCount}
                                    </span>
                                  )}
                                  {summaryCount > 0 && (
                                    <span className="inline-flex items-center gap-0.5 text-emerald-500">
                                      <Sparkles className="size-3" /> {summaryCount}
                                    </span>
                                  )}
                                </div>
                              </button>

                              <div className="flex items-center gap-1.5">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 text-[11px] font-medium"
                                  onClick={() => {
                                    setNewLessonClass(sub.class_level);
                                    setNewLessonSubjectId(sub.id);
                                    setNewLessonChapterId(c.id);
                                    setActiveCreatePanel("lesson");
                                    window.scrollTo({ top: 180, behavior: "smooth" });
                                  }}
                                >
                                  <Plus className="size-3 mr-1" /> Add Lesson
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 text-xs"
                                  onClick={() => setEditChapter(editChapter === c.id ? null : c.id)}
                                >
                                  {editChapter === c.id ? "Cancel" : "Edit"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                                  onClick={() =>
                                    run(
                                      () => removeRow({ data: { table: "chapters", id: c.id } }),
                                      "Chapter deleted",
                                    )
                                  }
                                >
                                  Delete
                                </Button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setCollapsedChapters((prev) => ({
                                      ...prev,
                                      [c.id]: !isCollapsed,
                                    }))
                                  }
                                  className="p-1 rounded-md text-muted-foreground hover:bg-secondary transition-colors"
                                  title={isCollapsed ? "Expand Lessons" : "Collapse Lessons"}
                                >
                                  {isCollapsed ? (
                                    <ChevronDown className="size-4" />
                                  ) : (
                                    <ChevronUp className="size-4" />
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* Edit Chapter Form */}
                            {editChapter === c.id && (
                              <form
                                className="m-3 grid gap-3 rounded-xl border border-border/80 bg-background p-3 sm:grid-cols-2 text-xs"
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  const f = new FormData(e.currentTarget);
                                  const title = String(f.get("title") ?? c.title);
                                  const slug = String(f.get("slug") ?? "").trim() || slugify(title);
                                  void run(
                                    () =>
                                      upsertChapter({
                                        data: {
                                          id: c.id,
                                          subject_id: String(f.get("subject_id") ?? c.subject_id),
                                          title,
                                          slug,
                                          description: String(f.get("description") ?? c.description ?? "") || null,
                                          order_index: Number(f.get("order_index") ?? c.order_index ?? 1),
                                          published: (f.get("published") as string) === "on",
                                        },
                                      }),
                                    "Chapter updated",
                                  );
                                  setEditChapter(null);
                                }}
                              >
                                <div className="space-y-1 sm:col-span-2">
                                  <div className="flex items-center justify-between">
                                    <Label className="text-xs">Title</Label>
                                    <AiAutofill mode="chapter" />
                                  </div>
                                  <Input name="title" defaultValue={c.title} required className="h-8 text-xs" />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Subject</Label>
                                  <select
                                    name="subject_id"
                                    defaultValue={c.subject_id}
                                    className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                                  >
                                    {(data?.subjects ?? []).map((s: any) => (
                                      <option key={s.id} value={s.id}>
                                        {s.name} ({classLabel(s.class_level)})
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Slug (URL key)</Label>
                                  <Input name="slug" defaultValue={c.slug ?? ""} className="h-8 text-xs" />
                                </div>
                                <div className="space-y-1 sm:col-span-2">
                                  <Label className="text-xs">Description</Label>
                                  <Input name="description" defaultValue={c.description ?? ""} className="h-8 text-xs" />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Order</Label>
                                  <Input name="order_index" type="number" defaultValue={c.order_index ?? 1} className="h-8 text-xs" />
                                </div>
                                <label className="flex items-center gap-2 text-xs">
                                  <input type="checkbox" name="published" defaultChecked={c.published} />
                                  Published
                                </label>
                                <Button type="submit" disabled={busy} className="h-8 rounded-full sm:col-span-2 text-xs">
                                  Save Chapter Changes
                                </Button>
                              </form>
                            )}

                            {/* Lesson List (Collapsed/Expanded) */}
                            {!isCollapsed && (
                              <div className="p-3 pt-0 space-y-2">
                                {chapLessons.length === 0 ? (
                                  <p className="text-xs italic text-muted-foreground pl-3 py-1">
                                    No lessons in this chapter yet. Click "+ Add Lesson" to publish one.
                                  </p>
                                ) : (
                                  <div className="space-y-1.5 pl-2 sm:pl-4 border-l-2 border-primary/20">
                                    {chapLessons.map((l: any) => (
                                      <div key={l.id} className="rounded-lg bg-background/90 p-2.5 text-xs shadow-xs">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                          <div className="flex items-center gap-2">
                                            <span className="font-bold text-muted-foreground">
                                              #{l.order_index}
                                            </span>
                                            <span className="font-medium text-foreground">{l.title}</span>
                                            <Badge variant="outline" className="text-[10px] py-0 px-1.5 capitalize">
                                              {l.kind}
                                            </Badge>
                                            {(!l.published || (l as any).published === false) && (
                                              <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-zinc-500/40 text-zinc-500">
                                                Draft
                                              </Badge>
                                            )}
                                            {(l as any).scheduled_at && isScheduleInFuture((l as any).scheduled_at) && (
                                              <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[10px] py-0 px-1.5 font-semibold flex items-center gap-1">
                                                <Clock className="size-2.5" /> Scheduled: {formatScheduleDate((l as any).scheduled_at)}
                                              </Badge>
                                            )}
                                            {(l as any).scheduled_at && !isScheduleInFuture((l as any).scheduled_at) && (
                                              <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px] py-0 px-1.5 font-semibold flex items-center gap-1">
                                                <CheckCircle2 className="size-2.5" /> Released
                                              </Badge>
                                            )}
                                            {l.audio_url && (
                                              <span title="Audio available">
                                                <Headphones className="size-3 text-primary" />
                                              </span>
                                            )}
                                            {l.video_url && (() => {
                                              const vCount = parseLessonVideos(l.video_url).length;
                                              return (
                                                <span
                                                  title={vCount > 1 ? `${vCount} Videos available` : "Video available"}
                                                  className="inline-flex items-center gap-0.5 text-blue-500 font-bold text-[10px]"
                                                >
                                                  <Video className="size-3" />
                                                  {vCount > 1 && <span>{vCount}</span>}
                                                </span>
                                              );
                                            })()}
                                            {l.pdf_url && (
                                              <span title="PDF available">
                                                <FileText className="size-3 text-orange-500" />
                                              </span>
                                            )}
                                            {l.summary && (
                                              <span title="Summary notes available">
                                                <Sparkles className="size-3 text-emerald-500" />
                                              </span>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-1.5">
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="h-6 px-2 text-[11px] font-semibold gap-1 text-primary hover:bg-primary/10 border-primary/30"
                                              onClick={() => setPreviewLessonData({ lesson: l, chapter: c, subject: sub })}
                                              title="Preview as Student"
                                            >
                                              <Eye className="size-3" />
                                              <span>Preview</span>
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              className="h-6 px-2 text-[11px]"
                                              onClick={() => setEditLesson(editLesson === l.id ? null : l.id)}
                                            >
                                              {editLesson === l.id ? "Cancel" : "Edit"}
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              className="h-6 px-2 text-[11px] text-muted-foreground hover:text-destructive"
                                              onClick={() =>
                                                run(() => removeRow({ data: { table: "lessons", id: l.id } }), "Lesson deleted")
                                              }
                                            >
                                              Delete
                                            </Button>
                                          </div>
                                        </div>

                                        {editLesson === l.id && (
                                          <form
                                            className="mt-3 grid gap-3 border-t border-border/40 pt-3 sm:grid-cols-2"
                                            onSubmit={(e) => {
                                              e.preventDefault();
                                              const f = new FormData(e.currentTarget);
                                              const schedVal = String(f.get("scheduled_at") ?? "").trim();
                                              const scheduledAt = schedVal ? localDateTimeToIso(schedVal) : null;
                                              void run(
                                                () =>
                                                  upsertLesson({
                                                    data: {
                                                      id: l.id,
                                                      chapter_id: String(f.get("chapter_id") ?? l.chapter_id),
                                                      title: String(f.get("title") ?? l.title),
                                                      kind: String(f.get("kind") ?? l.kind),
                                                      audio_url: String(f.get("audio_url") ?? l.audio_url ?? "") || null,
                                                      video_url: String(f.get("video_url") ?? l.video_url ?? "") || null,
                                                      pdf_url: String(f.get("pdf_url") ?? l.pdf_url ?? "") || null,
                                                      summary: String(f.get("summary") ?? l.summary ?? "") || null,
                                                      duration_minutes: Number(f.get("duration_minutes") ?? l.duration_minutes),
                                                      order_index: Number(f.get("order_index") ?? l.order_index),
                                                      published: (f.get("published") as string) === "on",
                                                      scheduled_at: scheduledAt,
                                                    },
                                                  }),
                                                "Lesson updated",
                                              );
                                              setEditLesson(null);
                                            }}
                                          >
                                            <div className="space-y-1.5">
                                              <Label>Title</Label>
                                              <Input name="title" defaultValue={l.title} required />
                                            </div>
                                            <div className="space-y-1.5">
                                              <Label>Kind</Label>
                                              <select
                                                name="kind"
                                                defaultValue={l.kind}
                                                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                                              >
                                                <option value="audio">Audio lecture</option>
                                                <option value="video">Video lecture</option>
                                                <option value="summary">Summary</option>
                                                <option value="pdf">PDF notes</option>
                                              </select>
                                            </div>
                                            <div className="space-y-1.5 sm:col-span-2">
                                              <MediaInput
                                                name="audio_url"
                                                label="Audio File"
                                                type="audio"
                                                defaultValue={l.audio_url ?? ""}
                                              />
                                            </div>
                                            <div className="sm:col-span-2">
                                              <MultiVideoInput
                                                name="video_url"
                                                defaultValue={l.video_url ?? ""}
                                              />
                                            </div>
                                            <div className="space-y-1.5 sm:col-span-2">
                                              <MediaInput
                                                name="pdf_url"
                                                label="PDF Document"
                                                type="pdf"
                                                defaultValue={l.pdf_url ?? ""}
                                              />
                                            </div>
                                            <div className="space-y-1.5 sm:col-span-2">
                                              <div className="flex items-center justify-between">
                                                <Label className="text-xs">Summary notes / formulas</Label>
                                                <AiAutofill mode="lesson" />
                                              </div>
                                              <Textarea
                                                name="summary"
                                                defaultValue={l.summary ?? ""}
                                                placeholder="Bullet summary or key formula"
                                                rows={3}
                                                className="rounded-xl text-xs"
                                              />
                                            </div>
                                            <div className="space-y-1.5">
                                              <Label>Duration (min)</Label>
                                              <Input
                                                name="duration_minutes"
                                                type="number"
                                                defaultValue={l.duration_minutes}
                                              />
                                            </div>
                                            <div className="space-y-1.5">
                                              <Label>Order</Label>
                                              <Input
                                                name="order_index"
                                                type="number"
                                                defaultValue={l.order_index}
                                              />
                                            </div>
                                            <div className="space-y-1.5 sm:col-span-2 rounded-xl border border-border/60 bg-muted/20 p-2.5">
                                              <div className="flex items-center justify-between">
                                                <Label className="text-xs font-semibold flex items-center gap-1">
                                                  <Clock className="size-3 text-primary" /> Scheduled Release (Optional)
                                                </Label>
                                                {(l as any).scheduled_at && (
                                                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                                                    {isScheduleInFuture((l as any).scheduled_at) ? "Upcoming: " : "Released: "}
                                                    {formatScheduleDate((l as any).scheduled_at)}
                                                  </span>
                                                )}
                                              </div>
                                              <Input
                                                type="datetime-local"
                                                name="scheduled_at"
                                                defaultValue={toLocalDateTimeInputString((l as any).scheduled_at)}
                                                className="rounded-xl text-xs bg-background"
                                              />
                                              <p className="text-[10px] text-muted-foreground">
                                                Leave blank to release immediately. If set to a future date/time, students see a countdown card and media remains locked.
                                              </p>
                                            </div>
                                            <label className="flex items-center gap-2 text-sm sm:col-span-2">
                                              <input
                                                type="checkbox"
                                                name="published"
                                                defaultChecked={l.published}
                                              />
                                              Published
                                            </label>
                                            <Button
                                              type="submit"
                                              disabled={busy}
                                              className="rounded-full sm:col-span-2"
                                            >
                                              Save Lesson Changes
                                            </Button>
                                          </form>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
        </CardContent>
      </Card>

      {/* In-Studio Lesson Preview Dialog */}
      <Dialog open={Boolean(previewLessonData)} onOpenChange={(open) => !open && setPreviewLessonData(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8">
          {previewLessonData && (
            <div className="space-y-6">
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {previewLessonData.subject?.title || previewLessonData.subject?.name || "Subject"}
                  </Badge>
                  <span className="text-muted-foreground text-xs">/</span>
                  <Badge variant="secondary" className="text-xs">
                    {previewLessonData.chapter?.title || "Chapter"}
                  </Badge>
                  <Badge variant="default" className="text-xs bg-primary/20 text-primary hover:bg-primary/30">
                    Order #{previewLessonData.lesson.order_index ?? previewLessonData.lesson.sort_order}
                  </Badge>
                </div>
                <DialogTitle className="font-display text-xl sm:text-2xl font-bold">
                  {previewLessonData.lesson.title}
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
                  Teacher Preview Mode · See media, notes, and equations exactly as students will experience it.
                </DialogDescription>
              </DialogHeader>

              {/* Media Player */}
              {(previewLessonData.lesson.audio_url || previewLessonData.lesson.video_url || previewLessonData.lesson.pdf_url) ? (
                <div className="rounded-2xl overflow-hidden border border-border/70 bg-card p-4 shadow-sm">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-primary" />
                    <span>Attached Media Player</span>
                  </div>
                  <MediaPlayer
                    audioUrl={previewLessonData.lesson.audio_url}
                    videoUrl={previewLessonData.lesson.video_url}
                    pdfUrl={previewLessonData.lesson.pdf_url}
                    title={previewLessonData.lesson.title}
                  />
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                  No media (Audio/Video/PDF) attached to this lecture yet.
                </div>
              )}

              {/* Summary / Notes with KaTeX Markdown */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <FileText className="size-3.5 text-primary" />
                    <span>Summary &amp; Study Notes (With Math &amp; LaTeX)</span>
                  </h4>
                </div>

                {previewLessonData.lesson.summary ? (
                  <div className="rounded-2xl border border-border/80 bg-background/50 p-4 sm:p-5 text-sm leading-relaxed overflow-x-auto shadow-inner">
                    <MarkdownRenderer content={previewLessonData.lesson.summary} />
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                    No summary notes written yet for this lesson. You can add notes with formulas like $E = mc^2$ in the editor!
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border/60">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <span>Slug:</span>
                  <code className="bg-secondary px-1.5 py-0.5 rounded text-[11px] font-mono text-foreground">
                    {previewLessonData.chapter?.slug || previewLessonData.lesson.id}
                  </code>
                </div>
                <div className="flex items-center gap-2">
                  {previewLessonData.chapter?.slug && (
                    <Button asChild size="sm" variant="outline" className="rounded-full text-xs font-semibold gap-1.5">
                      <a
                        href={`/learn/${previewLessonData.chapter.slug}?lessonId=${previewLessonData.lesson.id}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExternalLink className="size-3.5" />
                        <span>Open Full Student Page</span>
                      </a>
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={() => {
                      const lId = previewLessonData.lesson.id;
                      setPreviewLessonData(null);
                      setEditLesson(lId);
                    }}
                    className="rounded-full text-xs font-semibold gap-1.5 bg-primary text-primary-foreground"
                  >
                    <Edit3 className="size-3.5" />
                    <span>Edit this Lesson</span>
                  </Button>
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
