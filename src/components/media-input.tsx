import { useRef, useState } from "react";
import { Loader2, Link2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isStorageRef, storagePath, uploadLessonFile } from "@/lib/storage";

type Props = {
  name: string;
  label: string;
  accept: string;
  defaultValue?: string;
  folder: string;
};

/** URL field with an optional direct file upload into Easy Padhai storage. */
export function MediaInput({ name, label, accept, defaultValue = "", folder }: Props) {
  const [value, setValue] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          name={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Paste a YouTube / Drive / any link"
        />
        <Button
          type="button"
          variant="outline"
          className="shrink-0 rounded-xl"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          Upload
        </Button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept={accept}
        hidden
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setBusy(true);
          try {
            const ref = await uploadLessonFile(file, folder);
            setValue(ref);
            toast.success("File uploaded");
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Upload failed");
          } finally {
            setBusy(false);
            if (fileRef.current) fileRef.current.value = "";
          }
        }}
      />
      <p className="text-xs text-muted-foreground">
        {isStorageRef(value) ? (
          <>Uploaded file: {storagePath(value)}</>
        ) : (
          <span className="inline-flex items-center gap-1">
            <Link2 className="size-3" /> External link or upload a file (max 50MB)
          </span>
        )}
      </p>
    </div>
  );
}
