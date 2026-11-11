import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ACCEPTED_TYPES, MAX_CAR_PHOTOS, movePhoto, photosAllowed, reprocessCarPhoto, uploadCarPhoto, usePhotoUrls, type CarPhoto } from "@/lib/car-photos";

export function CarPhotosEditor({ photos, onChange, onUploaded, onUploading }: { photos: CarPhoto[]; onChange: (p: CarPhoto[]) => void; onUploaded: (p: CarPhoto) => void; onUploading?: (uploading: boolean) => void }) {
  const urls = usePhotoUrls(photos.map((p) => p.thumb));
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [drag, setDrag] = useState<number | null>(null);
  async function optimize() {
    onUploading?.(true);
    let current = [...photos];
    setProgress({ done: 0, total: photos.length });
    try {
      for (const [i, photo] of photos.entries()) {
        const replacement = await reprocessCarPhoto(photo);
        onUploaded(replacement); current[i] = replacement; onChange([...current]);
        setProgress({ done: i + 1, total: photos.length });
      }
      toast.success("Photos optimized. Save the car to keep them.");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Optimization failed"); }
    finally { setProgress(null); onUploading?.(false); }
  }

  async function pick(list: FileList | null) {
    const files = Array.from(list ?? []);
    const n = photosAllowed(photos.length, files.length);
    if (n < files.length) toast.error(`A car can have at most ${MAX_CAR_PHOTOS} photos.`);
    if (!n) return;
    onUploading?.(true);
    let current = photos;
    setProgress({ done: 0, total: n });
    for (const [i, file] of files.slice(0, n).entries()) {
      try {
        const photo = await uploadCarPhoto(file);
        onUploaded(photo);
        current = [...current, photo];
        onChange(current);
      } catch (e) { toast.error(e instanceof Error ? e.message : "Upload failed"); }
      setProgress({ done: i + 1, total: n });
    }
    setProgress(null);
    onUploading?.(false);
  }

  return (
    <fieldset className="space-y-2">
      <legend className="mb-1 font-semibold">Photos ({photos.length}/{MAX_CAR_PHOTOS})</legend>
      <p className="text-xs text-muted-foreground">The first photo is the cover. Drag or use the arrows to reorder.</p>
      <div className="grid grid-cols-2 gap-2">
        {photos.map((p, i) => (
          <div key={p.main} draggable onDragStart={() => setDrag(i)} onDragOver={(e) => e.preventDefault()}
            onDrop={() => { if (drag !== null) onChange(movePhoto(photos, drag, i)); setDrag(null); }}
            className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-secondary">
            {urls[p.thumb] && <img src={urls[p.thumb]} alt="" loading="lazy" decoding="async" width={p.w} height={p.h} className="h-full w-full object-cover" />}
            {i === 0 && <span className="absolute left-1 top-1 rounded bg-primary px-1.5 text-xs font-semibold text-primary-foreground">Cover</span>}
            <button type="button" aria-label="Delete photo" onClick={() => onChange(photos.filter((_, j) => j !== i))} className="absolute right-1 top-1 rounded-full bg-background/90 p-1"><X className="h-4 w-4" /></button>
            <div className="absolute bottom-1 right-1 flex gap-1">
              <button type="button" aria-label="Move left" disabled={i === 0} onClick={() => onChange(movePhoto(photos, i, i - 1))} className="rounded-full bg-background/90 p-1 disabled:opacity-40"><ArrowLeft className="h-4 w-4" /></button>
              <button type="button" aria-label="Move right" disabled={i === photos.length - 1} onClick={() => onChange(movePhoto(photos, i, i + 1))} className="rounded-full bg-background/90 p-1 disabled:opacity-40"><ArrowRight className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
        {photos.length < MAX_CAR_PHOTOS && !progress && (
          <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-input bg-secondary text-sm text-muted-foreground">
            <ImagePlus className="h-5 w-5" />Add photos
            <input type="file" multiple accept={ACCEPTED_TYPES.join(",")} className="hidden" onChange={(e) => { pick(e.target.files); e.target.value = ""; }} />
          </label>
        )}
      </div>
      {photos.length > 0 && <Button type="button" variant="outline" className="w-full" disabled={!!progress} onClick={optimize}>Optimize existing photos</Button>}
      {progress && <div className="space-y-1"><p className="flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" />Compressing and uploading {progress.done}/{progress.total}…</p><Progress value={(progress.done / progress.total) * 100} /></div>}
    </fieldset>
  );
}
