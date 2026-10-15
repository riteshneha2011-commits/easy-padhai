import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import {
  getAdminCatalog,
  saveChapter,
  saveSubject,
  saveLesson,
  saveTest,
  saveQuestion,
  addQuestions,
  getTestQuestions,
  generateQuestions,
  deleteRow,
} from "@/lib/admin.functions";
import { createNotificationFn } from "@/lib/notifications.functions";
import { useAuth } from "@/hooks/use-auth";
import { soundFx } from "@/lib/sound-effects";
import { TeachCurriculumTab } from "@/components/teach/teach-curriculum-tab";
import { TeachQuizBuilderTab } from "@/components/teach/teach-quiz-builder-tab";
import { TeachQuizBankTab } from "@/components/teach/teach-quiz-bank-tab";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ACTIVE_CLASS_LABEL,
  getAllActiveClasses,
  saveCustomClass,
  classOrdinalLabel,
  classLabel,
} from "@/lib/classes";
import { GraduationCap } from "lucide-react";

export const Route = createFileRoute("/teach")({
  head: () => ({
    meta: [
      { title: "Studio — Easy Padhai" },
      {
        name: "description",
        content: "Teacher studio: publish chapters, lessons and objective tests, and build questions fast.",
      },
      { property: "og:title", content: "Studio — Easy Padhai" },
      {
        property: "og:description",
        content: "Add chapters, lessons and MCQs by form, JSON, Markdown or AI generation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TeachRoute,
});

function TeachRoute() {
  const { user, isStaff, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const fetchCatalog = useServerFn(getAdminCatalog);
  const upsertChapter = useServerFn(saveChapter);
  const upsertSubject = useServerFn(saveSubject);
  const upsertLesson = useServerFn(saveLesson);
  const upsertTest = useServerFn(saveTest);
  const upsertQuestion = useServerFn(saveQuestion);
  const fetchTestQuestions = useServerFn(getTestQuestions);
  const insertQuestions = useServerFn(addQuestions);
  const aiGenerate = useServerFn(generateQuestions);
  const removeRow = useServerFn(deleteRow);
  const sendNotification = useServerFn(createNotificationFn);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", replace: true });
  }, [loading, user, navigate]);

  const { data, isLoading, refetch: refetchCatalog } = useQuery({
    queryKey: ["admin-catalog"],
    queryFn: () => fetchCatalog(),
    enabled: Boolean(user) && isStaff,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
  });

  const refresh = async () => {
    await refetchCatalog();
    await Promise.all([
      qc.invalidateQueries({ queryKey: ["admin-catalog"] }),
      qc.invalidateQueries({ queryKey: ["curriculum"] }),
      qc.invalidateQueries({ queryKey: ["chapters"] }),
      qc.invalidateQueries({ queryKey: ["content"] }),
      qc.invalidateQueries({ queryKey: ["learn"] }),
      qc.invalidateQueries({ queryKey: ["dashboard"] }),
    ]);
  };

  const [busy, setBusy] = useState(false);

  const dbClassLevels = useMemo(
    () => (data?.subjects ?? []).map((s: any) => s.class_level).filter(Boolean),
    [data?.subjects],
  );
  const [extraClasses, setExtraClasses] = useState<number[]>([]);
  const availableClassLevels = useMemo(
    () => getAllActiveClasses([...dbClassLevels, ...extraClasses]),
    [dbClassLevels, extraClasses],
  );

  const [addClassDialogOpen, setAddClassDialogOpen] = useState(false);
  const [newClassInput, setNewClassInput] = useState("");

  const handleAddNewClass = (val: string) => {
    const num = Math.round(Number(val));
    if (isNaN(num) || num <= 0) {
      toast.error("Please enter a valid class number (e.g. 5, 6, 7, 8)");
      return;
    }
    saveCustomClass(num);
    setExtraClasses((prev) => Array.from(new Set([...prev, num])).sort((a, b) => a - b));
    setNewClassInput("");
    setAddClassDialogOpen(false);
    toast.success(`Class ${num} added! You can now create subjects and content for Class ${num}.`);
  };

  async function run(fn: () => Promise<unknown>, message: string) {
    setBusy(true);
    try {
      await fn();
      await refresh();
      toast.success(message);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <Shell>Loading…</Shell>;
  if (user && !isStaff) return <Shell>You need a teacher or admin role to open Studio.</Shell>;
  if (isLoading || !data) return <Shell>Loading studio…</Shell>;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Studio</h1>
          <p className="mt-1 text-muted-foreground">Publish content and build tests for {ACTIVE_CLASS_LABEL}.</p>
        </div>
        {user && (
          <Button asChild className="rounded-full shadow-sm">
            <Link to="/admin">
              ⚡ Challenges &amp; Growth Hub &rarr;
            </Link>
          </Button>
        )}
      </div>

      <Tabs defaultValue="content" className="mt-6">
        <TabsList className="rounded-full flex-wrap h-auto gap-1 p-1 bg-secondary/80">
          <TabsTrigger value="content" className="rounded-full text-xs sm:text-sm font-semibold">
            1. Content Hierarchy
          </TabsTrigger>
          <TabsTrigger value="questions" className="rounded-full text-xs sm:text-sm font-semibold">
            2. AI Quiz Builder ✨
          </TabsTrigger>
          <TabsTrigger value="manage_tests" className="rounded-full text-xs sm:text-sm font-semibold">
            3. All Quizzes &amp; Tests ({data?.tests?.length ?? 0})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Curriculum & Content Hierarchy */}
        <TabsContent value="content" className="space-y-6">
          <TeachCurriculumTab
            data={data}
            availableClassLevels={availableClassLevels}
            classOrdinalLabel={classOrdinalLabel}
            classLabel={classLabel}
            onOpenAddClass={() => {
              soundFx.playClick();
              setAddClassDialogOpen(true);
            }}
            upsertSubject={upsertSubject}
            upsertChapter={upsertChapter}
            upsertLesson={upsertLesson}
            removeRow={removeRow}
            sendNotification={sendNotification}
            refresh={refresh}
            run={run}
            busy={busy}
          />
        </TabsContent>

        {/* Tab 2: AI Quiz Builder */}
        <TabsContent value="questions" className="space-y-6">
          <TeachQuizBuilderTab
            data={data}
            availableClassLevels={availableClassLevels}
            classOrdinalLabel={classOrdinalLabel}
            classLabel={classLabel}
            upsertTest={upsertTest}
            insertQuestions={insertQuestions}
            aiGenerate={aiGenerate}
            refresh={refresh}
            busy={busy}
          />
        </TabsContent>

        {/* Tab 3: All Quizzes Bank */}
        <TabsContent value="manage_tests" className="space-y-6">
          <TeachQuizBankTab
            data={data}
            availableClassLevels={availableClassLevels}
            classOrdinalLabel={classOrdinalLabel}
            classLabel={classLabel}
            onOpenAddClass={() => {
              soundFx.playClick();
              setAddClassDialogOpen(true);
            }}
            refresh={refresh}
            fetchTestQuestions={fetchTestQuestions}
            upsertQuestion={upsertQuestion}
            removeRow={removeRow}
            run={run}
          />
        </TabsContent>
      </Tabs>

      {/* Global Add New Class Modal */}
      <Dialog open={addClassDialogOpen} onOpenChange={setAddClassDialogOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display text-xl">
              <GraduationCap className="size-5 text-primary" />
              Add New Class Level
            </DialogTitle>
            <DialogDescription>
              Add a new class (e.g. Class 5, 6, 7, 8) to create subjects, chapters, audio lectures, and quizzes for it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Class Number (Grade Level)</Label>
              <Input
                type="number"
                min={1}
                max={15}
                placeholder="e.g. 5, 6, 7, 8"
                value={newClassInput}
                onChange={(e) => setNewClassInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddNewClass(newClassInput);
                  }
                }}
              />
              <p className="text-[11px] text-muted-foreground">
                Enter numeric grade (e.g. 8 for Class 8th). It will immediately become available in all dropdowns and filters.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setAddClassDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={() => handleAddNewClass(newClassInput)}>
                Save &amp; Add Class
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-5xl px-4 py-16 text-muted-foreground">{children}</div>;
}
