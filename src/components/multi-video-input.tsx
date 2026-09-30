import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, Video, Sparkles, Upload, Loader2, PlayCircle, Film, BookOpen, Clock } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  type LessonVideo,
  type VideoKind,
  VIDEO_KINDS,
  parseLessonVideos,
  serializeLessonVideos,
} from "@/lib/media";
import { getSignedUploadUrlAction } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { LESSON_BUCKET } from "@/lib/storage";
import { cn } from "@/lib/utils";

type Props = {
  name?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (serialized: string | null) => void;
};

export function MultiVideoInput({
  name = "video_url",
  defaultValue = "",
  value: controlledValue,
  onChange,
}: Props) {
  const getUploadUrl = useServerFn(getSignedUploadUrlAction);

  // Initialize videos from defaultValue or controlledValue
  const [videos, setVideos] = useState<LessonVideo[]>(() => {
    const initialRaw = controlledValue !== undefined ? controlledValue : defaultValue;
    const parsed = parseLessonVideos(initialRaw);
    if (parsed.length > 0) return parsed;
    return [
      {
        id: "v-0",
        title: "Main Concept Explainer",
        url: "",
        kind: "explainer",
        duration: "",
      },
    ];
  });

  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Keep synced if controlled
  useEffect(() => {
    if (controlledValue !== undefined) {
      const parsed = parseLessonVideos(controlledValue);
      if (parsed.length > 0) {
        setVideos(parsed);
      }
    }
  }, [controlledValue]);

  const updateVideo = (idx: number, patch: Partial<LessonVideo>) => {
    setVideos((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...patch };
      const serialized = serializeLessonVideos(next);
      onChange?.(serialized);
      return next;
    });
  };

  const addVideo = (suggestedKind: VideoKind = "cinematic") => {
    const defaultMeta = VIDEO_KINDS.find((k) => k.id === suggestedKind) || VIDEO_KINDS[0];
    const newVid: LessonVideo = {
      id: `v-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: suggestedKind === "cinematic" ? "Cinematic 3D Animation" : suggestedKind === "practice" ? "Solved Questions / PYQs" : `Video ${videos.length + 1}`,
      url: "",
      kind: suggestedKind,
      duration: "",
    };
    setVideos((prev) => {
      const next = [...prev, newVid];
      const serialized = serializeLessonVideos(next);
      onChange?.(serialized);
      return next;
    });
  };

  const removeVideo = (idx: number) => {
    if (videos.length <= 1) {
      // Just clear URL if it's the only one
      updateVideo(0, { url: "", title: "Main Concept Explainer", duration: "" });
      return;
    }
    setVideos((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      const serialized = serializeLessonVideos(next);
      onChange?.(serialized);
      return next;
    });
  };

  const handleFileUpload = async (idx: number, file: File) => {
    setUploadingIdx(idx);
    try {
      toast.loading("Getting secure upload slot for video...", { id: `vid-up-${idx}` });
      const uploadInfo = await getUploadUrl({
        data: {
          fileName: file.name,
          folder: "video",
          contentType: file.type || "video/mp4",
        },
      });

      if (uploadInfo.provider === "r2" && uploadInfo.uploadUrl) {
        toast.loading("Uploading video directly to Cloudflare R2 CDN...", { id: `vid-up-${idx}` });
        const res = await fetch(uploadInfo.uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": file.type || "video/mp4",
          },
          body: file,
        });
        if (!res.ok) {
          const errText = await res.text().catch(() => "");
          throw new Error(`R2 upload failed (${res.status}): ${errText || res.statusText}`);
        }
        updateVideo(idx, { url: uploadInfo.storageRef });
        toast.success("Video uploaded to Cloudflare R2 CDN! ⚡", { id: `vid-up-${idx}` });
      } else {
        toast.loading("Uploading video to storage...", { id: `vid-up-${idx}` });
        const { error } = await supabase.storage.from(LESSON_BUCKET).uploadToSignedUrl(
          uploadInfo.path,
          uploadInfo.token || "",
          file,
          { contentType: file.type || "video/mp4" }
        );
        if (error) throw error;
        updateVideo(idx, { url: uploadInfo.storageRef });
        toast.success("Video uploaded successfully!", { id: `vid-up-${idx}` });
      }
    } catch (err: any) {
      toast.error(`Upload error: ${err.message || "Failed to upload video"}`, { id: `vid-up-${idx}` });
    } finally {
      setUploadingIdx(null);
    }
  };

  const serializedValue = serializeLessonVideos(videos) || "";

  return (
    <div className="space-y-3">
      {/* Hidden input to pass value seamlessly into form submission */}
      <input type="hidden" name={name} value={serializedValue} />

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Label className="font-semibold text-sm flex items-center gap-1.5">
            <Video className="size-4 text-primary" /> Video Lectures &amp; Media ({videos.filter((v) => Boolean(v.url)).length} attached)
          </Label>
        </div>
        <span className="text-[11px] text-muted-foreground">
          Attach multiple videos (Explainer, Cinematic 3D, PYQ) in one single lesson.
        </span>
      </div>

      <div className="space-y-3">
        {videos.map((vid, idx) => {
          const kindMeta = VIDEO_KINDS.find((k) => k.id === vid.kind) || VIDEO_KINDS[0];
          const isUploading = uploadingIdx === idx;

          return (
            <Card
              key={vid.id || idx}
              className={cn(
                "p-3.5 sm:p-4 rounded-2xl border transition-all space-y-3 bg-card shadow-2xs",
                vid.kind === "cinematic"
                  ? "border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10"
                  : vid.kind === "practice"
                  ? "border-purple-500/30 bg-purple-500/5 dark:bg-purple-500/10"
                  : "border-border/80"
              )}
            >
              {/* Card Top Row: Label, Kind Badge, and Delete Button */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="grid size-6 place-items-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <span>{kindMeta.icon}</span>
                    <span>{vid.title || `Video ${idx + 1}`}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Video Type Quick Selector */}
                  <select
                    value={vid.kind || "explainer"}
                    onChange={(e) => updateVideo(idx, { kind: e.target.value as VideoKind })}
                    className="h-7 rounded-lg border border-input bg-background px-2 text-xs font-medium cursor-pointer"
                  >
                    {VIDEO_KINDS.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.icon} {k.label}
                      </option>
                    ))}
                  </select>

                  {/* Remove Button */}
                  {videos.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeVideo(idx)}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive rounded-lg"
                      title="Remove this video"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Title and Duration Row */}
              <div className="grid gap-2 sm:grid-cols-3">
                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-[11px] text-muted-foreground font-medium">Video Title / Tab Label</Label>
                  <Input
                    value={vid.title}
                    onChange={(e) => updateVideo(idx, { title: e.target.value })}
                    placeholder="e.g. Cinematic 3D Simulation, Full Concept Derivation..."
                    className="h-8 text-xs rounded-xl bg-background"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                    <Clock className="size-3 text-muted-foreground" /> Approx Duration
                  </Label>
                  <Input
                    value={vid.duration || ""}
                    onChange={(e) => updateVideo(idx, { duration: e.target.value })}
                    placeholder="e.g. 3 min, 18 min"
                    className="h-8 text-xs rounded-xl bg-background"
                  />
                </div>
              </div>

              {/* Video URL & Upload Row */}
              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground font-medium">Video Link or Upload File</Label>
                <div className="flex gap-2">
                  <Input
                    value={vid.url}
                    onChange={(e) => updateVideo(idx, { url: e.target.value })}
                    placeholder="YouTube URL, Vimeo, Google Drive, or Cloudflare R2 link"
                    className="h-8 text-xs rounded-xl bg-background"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isUploading}
                    onClick={() => fileInputRefs.current[idx]?.click()}
                    className="h-8 px-3 text-xs rounded-xl shrink-0 gap-1.5 font-medium"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin text-primary" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="size-3.5" />
                        <span>Upload MP4</span>
                      </>
                    )}
                  </Button>
                  <input
                    ref={(el) => (fileInputRefs.current[idx] = el)}
                    type="file"
                    accept="video/*"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(idx, file);
                    }}
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add More Video Buttons */}
      <div className="flex items-center gap-2 flex-wrap pt-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addVideo("cinematic")}
          className="rounded-full text-xs font-semibold gap-1.5 border-dashed border-amber-500/50 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400"
        >
          <Sparkles className="size-3.5" /> + Add Cinematic / 3D Video
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addVideo("practice")}
          className="rounded-full text-xs font-semibold gap-1.5 border-dashed border-purple-500/50 hover:bg-purple-500/10 text-purple-600 dark:text-purple-400"
        >
          <BookOpen className="size-3.5" /> + Add Solved PYQ / Practice Video
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => addVideo("explainer")}
          className="rounded-full text-xs font-semibold gap-1.5 ml-auto"
        >
          <Plus className="size-3.5" /> + Add Extra Video
        </Button>
      </div>
    </div>
  );
}
