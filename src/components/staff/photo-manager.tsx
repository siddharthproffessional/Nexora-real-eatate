"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ImagePlus, Trash2 } from "lucide-react";
import type { PropertyImage } from "@/lib/domain/types";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/form-controls";

/** Upload, order and remove listing photos. The first photo is the cover image. */
export function PhotoManager({ propertyId, images, canEdit }: { propertyId: string; images: PropertyImage[]; canEdit: boolean }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [message, setMessage] = React.useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const call = async (method: string, body: BodyInit, headers?: HeadersInit) => {
    setPending(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/internal/properties/${propertyId}/images`, { method, body, headers });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setMessage({ kind: "error", text: json?.error ?? "That didn't work. Try again." });
        return false;
      }
      router.refresh();
      return true;
    } catch {
      setMessage({ kind: "error", text: "That didn't work. Check your connection." });
      return false;
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="rounded-md border border-line bg-white p-5 sm:p-6" aria-labelledby="photos-title">
      <h2 id="photos-title" className="text-[15.5px] font-semibold text-navy">
        Photos
      </h2>
      <p className="mt-0.5 text-[12.5px] text-slate">JPEG, PNG or WebP, up to 6 MB each. The first photo is used as the cover.</p>

      {images.length ? (
        <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img, i) => (
            <li key={img.src + i} className="overflow-hidden rounded-sm border border-line">
              <div className="relative aspect-[4/3] bg-mist">
                <Image src={img.src} alt={img.alt} fill sizes="300px" className="object-cover" />
                {i === 0 ? <span className="absolute top-2 left-2 rounded-xs bg-navy px-1.5 py-0.5 text-[11px] font-semibold text-ivory">Cover</span> : null}
              </div>
              <div className="flex items-center justify-between gap-2 px-2.5 py-2">
                <p className="truncate text-[12px] text-slate" title={img.alt}>
                  {img.alt}
                </p>
                {canEdit ? (
                  <div className="flex shrink-0 items-center">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Move earlier"
                      disabled={pending || i === 0}
                      onClick={() => call("PATCH", JSON.stringify({ src: img.src, direction: "up" }), { "Content-Type": "application/json" })}
                    >
                      <ArrowUp className="size-4" aria-hidden />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Move later"
                      disabled={pending || i === images.length - 1}
                      onClick={() => call("PATCH", JSON.stringify({ src: img.src, direction: "down" }), { "Content-Type": "application/json" })}
                    >
                      <ArrowDown className="size-4" aria-hidden />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Remove photo"
                      disabled={pending}
                      onClick={() => {
                        if (window.confirm("Remove this photo from the listing?"))
                          void call("DELETE", JSON.stringify({ src: img.src }), { "Content-Type": "application/json" });
                      }}
                    >
                      <Trash2 className="size-4 text-danger" aria-hidden />
                    </Button>
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-5 rounded-sm border border-dashed border-line-strong px-4 py-8 text-center text-[13.5px] text-slate">
          No photos yet. Listings need at least one photo before they can be published.
        </p>
      )}

      {canEdit ? (
        <form
          className="mt-5 flex flex-wrap items-end gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const formEl = e.currentTarget;
            const fd = new FormData(formEl);
            if (!fileRef.current?.files?.length) {
              setMessage({ kind: "error", text: "Choose at least one photo." });
              return;
            }
            const ok = await call("POST", fd);
            if (ok) {
              formEl.reset();
              setMessage({ kind: "ok", text: "Photos uploaded" });
            }
          }}
        >
          <div className="flex min-w-[220px] flex-1 flex-col gap-1.5">
            <Label htmlFor="photo-files">Add photos</Label>
            <input
              ref={fileRef}
              id="photo-files"
              name="files"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="text-[13px] file:mr-3 file:h-9 file:rounded-sm file:border file:border-line-strong file:bg-white file:px-3 file:text-[13px] file:font-medium file:text-navy"
            />
          </div>
          <div className="flex min-w-[220px] flex-1 flex-col gap-1.5">
            <Label htmlFor="photo-alt">Description for screen readers</Label>
            <Input id="photo-alt" name="alt" placeholder="e.g. Living room with marina view" maxLength={160} />
          </div>
          <Button type="submit" disabled={pending} variant="outline">
            <ImagePlus className="size-4" aria-hidden /> {pending ? "Uploading…" : "Upload"}
          </Button>
        </form>
      ) : null}
      {message ? (
        <p role={message.kind === "error" ? "alert" : "status"} className={`mt-3 text-[13px] ${message.kind === "ok" ? "text-success" : "text-danger"}`}>
          {message.text}
        </p>
      ) : null}
    </section>
  );
}

export function PublishToggle({ propertyId, published, hasPhotos }: { propertyId: string; published: boolean; hasPhotos: boolean }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  return (
    <div className="flex flex-col items-start gap-1.5 md:items-end">
      <Button
        variant={published ? "outline" : "gold"}
        disabled={pending || (!published && !hasPhotos)}
        onClick={async () => {
          setPending(true);
          setError(null);
          const res = await fetch(`/api/internal/properties/${propertyId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ published: !published }),
          }).catch(() => null);
          const json = await res?.json().catch(() => null);
          setPending(false);
          if (!res?.ok || !json?.ok) setError(json?.error ?? "That didn't work.");
          else router.refresh();
        }}
      >
        {pending ? "Saving…" : published ? "Unpublish" : "Publish"}
      </Button>
      {!published && !hasPhotos ? <p className="text-[12px] text-slate">Add a photo to publish.</p> : null}
      {error ? (
        <p role="alert" className="text-[12px] text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
