import { useEffect, useRef, useState } from "react";

import { Loader2, Link2, Upload, Sparkles } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isStorageRef, storagePath, LESSON_BUCKET } from "@/lib/storage";
import { supabase } from "@/integrations/supabase/client";
import { compressAudioForSpeech } from "@/lib/audio-compressor";
import { getSignedUploadUrlAction } from "@/lib/admin.functions";

type Props = {
  name: string;
  label: string;
  accept?: string;
  defaultValue?: string;
  value?: string;
  onValueChange?: (val: string) => void;
  folder?: string;
  type?: "audio" | "video" | "pdf" | string;
  placeholder?: string;
};

/** URL field with automatic audio compression and high-speed direct signed upload into Easy Padhai storage. */
export function MediaInput({
  name,
  label,
  accept,
  defaultValue = "",
  value: controlledValue,
  onValueChange,
  folder,
  type,
  placeholder,
}: Props) {
  const resolvedFolder = folder || (type === "audio" ? "audio" : type === "video" ? "video" : type === "pdf" ? "pdf" : "media");
  const resolvedAccept = accept || (resolvedFolder === "audio" ? "audio/*" : resolvedFolder === "video" ? "video/*" : resolvedFolder === "pdf" ? "application/pdf" : "*/*");
  const isAudio = resolvedFolder === "audio" || (resolvedAccept?.includes("audio") ?? false);

  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const setValue = (val: string) => {
    setInternalValue(val);
    onValueChange?.(val);
  };

  useEffect(() => {
    if (!isControlled) {
      setInternalValue(defaultValue);
    }
  }, [defaultValue, isControlled]);

  const [busy, setBusy] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const getUploadUrl = useServerFn(getSignedUploadUrlAction);



  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        {isAudio && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary">
            <Sparkles className="size-3" /> Auto voice compression enabled
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <Input
          name={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder || "Paste Cloudflare R2 / Drive / Dropbox / direct link"}
        />
        <Button
          type="button"
          variant="outline"
          className="shrink-0 rounded-xl"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          {busy ? "Processing…" : "Upload"}
        </Button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept={resolvedAccept}
        hidden
        onChange={async (e) => {
          let file = e.target.files?.[0];
          if (!file) return;
          setBusy(true);
          setStatusMsg("Preparing file...");
          try {
            if (isAudio && file.size > 4 * 1024 * 1024) {
              const res = await compressAudioForSpeech(file, (msg) => {
                setStatusMsg(msg);
                toast.loading(msg, { id: "compress-toast" });
              });
              file = res.file;
              if (res.savedPercent > 0) {
                toast.success(
                  `Audio optimized: ${res.originalSizeMb} MB → ${res.compressedSizeMb} MB (saved ${res.savedPercent}%)`,
                  { id: "compress-toast" }
                );
              } else {
                toast.dismiss("compress-toast");
              }
            }

            setStatusMsg("Getting secure upload token...");
            const uploadInfo = await getUploadUrl({
              data: {
                fileName: file.name,
                folder: resolvedFolder,
                contentType: file.type || undefined,
              },
            });

            if (uploadInfo.provider === "r2" && uploadInfo.uploadUrl) {
              setStatusMsg("Uploading directly to Cloudflare R2 CDN...");
              const res = await fetch(uploadInfo.uploadUrl, {
                method: "PUT",
                headers: {
                  "Content-Type": file.type || "application/octet-stream",
                },
                body: file,
              });
              if (!res.ok) {
                const errText = await res.text().catch(() => "");
                throw new Error(`R2 upload failed (${res.status}): ${errText || res.statusText}`);
              }
              setValue(uploadInfo.storageRef);
              toast.success("File uploaded to Cloudflare R2 CDN! ⚡");
            } else {
              setStatusMsg("Uploading directly to storage...");
              const { error } = await supabase.storage.from(LESSON_BUCKET).uploadToSignedUrl(
                uploadInfo.path,
                uploadInfo.token || "",
                file,
                { contentType: file.type || "application/octet-stream" }
              );

              if (error) throw error;

              setValue(uploadInfo.storageRef);
              toast.success("File uploaded and linked successfully!");
            }
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Upload failed", { id: "compress-toast" });
          } finally {
            setBusy(false);
            setStatusMsg("");
            if (fileRef.current) fileRef.current.value = "";
          }
        }}
      />
      <p className="text-xs text-muted-foreground flex items-center justify-between">
        {isStorageRef(value) ? (
          <span className="font-mono text-[11px] truncate text-primary font-semibold">
            ✓ Uploaded: {storagePath(value)}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1">
            <Link2 className="size-3" /> External link (Cloudflare R2, Drive, Dropbox) or upload file
          </span>
        )}
        {busy && <span className="text-primary font-medium">{statusMsg}</span>}
      </p>
    </div>
  );
}
