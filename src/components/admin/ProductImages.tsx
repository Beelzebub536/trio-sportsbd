"use client";

import { useState } from "react";
import { Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type ImageRow = { url: string; publicId: string | null; color: string | null };
export type ColorOption = { name: string; hex: string };

export default function ProductImages({
  images,
  colors,
  onChange,
}: {
  images: ImageRow[];
  colors: ColorOption[];
  onChange: (images: ImageRow[]) => void;
}) {
  const [url, setUrl] = useState("");
  const [color, setColor] = useState<string>("none");
  const [uploading, setUploading] = useState(false);

  const addByUrl = () => {
    if (!url.trim()) return;
    try {
      new URL(url.trim());
    } catch {
      toast.error("Enter a valid image URL.");
      return;
    }
    onChange([
      ...images,
      { url: url.trim(), publicId: null, color: color === "none" ? null : color },
    ]);
    setUrl("");
    setColor("none");
  };

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const signResponse = await fetch("/api/upload/sign", { method: "POST" });
      if (!signResponse.ok) {
        const data = (await signResponse.json()) as { error?: string };
        toast.error(data.error ?? "Image upload is not available.");
        return;
      }
      const sign = (await signResponse.json()) as {
        cloudName: string;
        apiKey: string;
        timestamp: number;
        folder: string;
        signature: string;
      };

      const body = new FormData();
      body.append("file", file);
      body.append("api_key", sign.apiKey);
      body.append("timestamp", String(sign.timestamp));
      body.append("folder", sign.folder);
      body.append("signature", sign.signature);

      const upload = await fetch(
        `https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`,
        { method: "POST", body },
      );
      const data = (await upload.json()) as {
        secure_url?: string;
        public_id?: string;
        error?: { message?: string };
      };

      if (!upload.ok || !data.secure_url) {
        toast.error(data.error?.message ?? "Upload failed.");
        return;
      }

      onChange([
        ...images,
        {
          url: data.secure_url,
          publicId: data.public_id ?? null,
          color: color === "none" ? null : color,
        },
      ]);
      toast.success("Image uploaded");
    } catch {
      toast.error("Upload failed. Check your connection.");
    } finally {
      setUploading(false);
    }
  };

  const updateColor = (index: number, value: string) => {
    onChange(
      images.map((image, i) =>
        i === index ? { ...image, color: value === "none" ? null : value } : image,
      ),
    );
  };

  const remove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <section className="space-y-4 border border-border p-4">
      <h2 className="text-sm font-bold uppercase tracking-widest">Images</h2>

      {images.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image, index) => (
            <li key={`${image.url}-${index}`} className="flex gap-3 border border-border p-2">
              <span className="relative h-20 w-16 shrink-0 overflow-hidden bg-secondary">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-2">
                <Select
                  value={image.color ?? "none"}
                  onValueChange={(value) => updateColor(index, value)}
                >
                  <SelectTrigger className="h-8 text-xs" aria-label="Image colour">
                    <SelectValue placeholder="Any colour" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Any colour</SelectItem>
                    {colors.map((option) => (
                      <SelectItem key={option.name} value={option.name}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" /> Remove
                </Button>
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="grid gap-3 sm:grid-cols-[1fr_160px_auto]">
        <div className="space-y-1">
          <Label htmlFor="image-url">Image URL</Label>
          <Input
            id="image-url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://res.cloudinary.com/…"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="image-color">Colour</Label>
          <Select value={color} onValueChange={setColor}>
            <SelectTrigger id="image-color">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Any colour</SelectItem>
              {colors.map((option) => (
                <SelectItem key={option.name} value={option.name}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button type="button" variant="outline" onClick={addByUrl}>
            Add URL
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 border border-border px-3 py-2 text-xs font-bold uppercase tracking-widest hover:bg-secondary">
          <Upload className="h-4 w-4" />
          {uploading ? "Uploading…" : "Upload file"}
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={uploading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleFile(file);
              event.target.value = "";
            }}
          />
        </label>
        <span className="text-xs text-muted-foreground">
          Uploads go to Cloudinary; URLs are a fallback.
        </span>
      </div>

      {images.length > 0 && (
        <p className="text-xs text-muted-foreground">
          The first image is used as the card thumbnail.
        </p>
      )}
    </section>
  );
}
