"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { toast } from "sonner";
import z from "zod";

type Props = {
  value?: string | null;
  onChange: (url: string | null) => void;
};

const UploadResp = z.union([
  z.object({ url: z.string().url() }),
  z.object({ error: z.string() }),
]);

export default function ImageUploaderBlob({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(value ?? null);
  const [busy, setBusy] = useState(false);

  const onPick = () => inputRef.current?.click();

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/"))
      return toast.error("Only images allowed");
    if (file.size > 4 * 1024 * 1024) return toast.error("Max 4MB");

    const fd = new FormData();
    fd.append("file", file);

    try {
      setBusy(true);
      const res = await fetch("/api/appartments/upload", {
        method: "POST",
        body: fd,
      });
      const raw = (await res.json()) as unknown;
      const data = UploadResp.parse(raw);

      if (!res.ok || "error" in data) {
        toast.error("error" in data ? data.error : "Upload failed");
        return;
      }

      setPreview(data.url);
      onChange(data.url);

      toast.success("Image uploaded");
    } catch {
      toast.error("Unexpected error");
    } finally {
      setBusy(false);
    }
  };

  const onRemove = async () => {
    if (!preview) return;
    try {
      setBusy(true);
      await fetch(
        `/api/appartments/delete?url=${encodeURIComponent(preview)}`,
        { method: "DELETE" },
      );
    } catch {
    } finally {
      setPreview(null);
      onChange(null);
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Cover image</Label>

      <div className="flex items-center gap-3">
        {preview ? (
          <Image
            src={preview}
            alt="Preview"
            width={128}
            height={96}
            className="h-24 w-32 rounded border object-cover"
          />
        ) : (
          <div className="bg-muted h-24 w-32 rounded border" />
        )}

        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onFile(e.currentTarget.files?.[0])}
          />
          <Button type="button" onClick={onPick} disabled={busy}>
            {busy ? "Uploading…" : preview ? "Replace image" : "Upload image"}
          </Button>
          {preview && (
            <Button
              type="button"
              variant="outline"
              onClick={onRemove}
              disabled={busy}
            >
              Remove
            </Button>
          )}
        </div>
      </div>

      <p className="text-muted-foreground text-xs">PNG/JPG/WebP • up to 4MB</p>
    </div>
  );
}
