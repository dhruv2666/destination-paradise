import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const CAR_PHOTO_BUCKET = "car-photos";
export const MAX_CAR_PHOTOS = 4;
export const MAX_INPUT_BYTES = 20 * 1024 * 1024;
export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAIN_SIZE = 1600;
export const THUMB_SIZE = 600;
export const MAIN_MAX_BYTES = 300_000;
export const THUMB_MAX_BYTES = 80_000;
export const PHOTO_QUALITY = 0.75;
export const JPEG_QUALITY = 0.82;
export const ORIGINAL_MAX_BYTES = 5 * 1024 * 1024;

export type CarPhoto = { main: string; thumb: string; w: number; h: number };

/** How many of the picked files can still be added without exceeding the limit. */
export function photosAllowed(current: number, picked: number): number {
  return Math.max(0, Math.min(picked, MAX_CAR_PHOTOS - current));
}

export function readPhotos(value: unknown): CarPhoto[] {
  return Array.isArray(value) ? (value as CarPhoto[]).filter((p) => p && typeof p.main === "string") : [];
}

export function movePhoto<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item as T);
  return next;
}

type DecodedPhoto = { source: CanvasImageSource; width: number; height: number; close: () => void };

async function decodePhoto(file: File): Promise<DecodedPhoto> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      return { source: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() };
    } catch { /* Older Safari can still decode through an orientation-aware image element. */ }
  }
  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Could not read this photo"));
      img.src = url;
    });
    return { source: image, width: image.naturalWidth, height: image.naturalHeight, close: () => URL.revokeObjectURL(url) };
  } catch (error) { URL.revokeObjectURL(url); throw error; }
}

function photoFormat(): "image/webp" | "image/jpeg" {
  try {
    return document.createElement("canvas").toDataURL("image/webp").startsWith("data:image/webp") ? "image/webp" : "image/jpeg";
  } catch { return "image/jpeg"; }
}

async function compressPhoto(bitmap: DecodedPhoto, max: number, maxBytes: number, type: "image/webp" | "image/jpeg"): Promise<{ blob: Blob; w: number; h: number }> {
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  let w = Math.round(bitmap.width * scale), h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  for (let attempt = 0; attempt < 20; attempt++) {
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not compress image");
    if (type === "image/jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
    }
    ctx.drawImage(bitmap.source, 0, 0, w, h);
    const quality = type === "image/jpeg" ? JPEG_QUALITY : Math.max(0.45, PHOTO_QUALITY - attempt * 0.05);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, type, quality));
    if (!blob || blob.type !== type) throw new Error("Could not compress this photo");
    if (blob.size < maxBytes) return { blob, w, h };
    if (attempt >= 6) { w = Math.max(1, Math.floor(w * 0.85)); h = Math.max(1, Math.floor(h * 0.85)); }
  }
  throw new Error("Could not compress this photo within the file size limit");
}

function extension(type: string): string {
  return type === "image/jpeg" ? "jpg" : type === "image/png" ? "png" : "webp";
}

/** Compress oriented main + thumbnail images, falling back to a small original. */
export async function uploadCarPhoto(file: File): Promise<CarPhoto> {
  if (!ACCEPTED_TYPES.includes(file.type)) throw new Error(`${file.name}: only JPG, PNG or WebP`);
  if (file.size > MAX_INPUT_BYTES) throw new Error(`${file.name}: please choose a smaller photo (under 20 MB).`);
  const id = crypto.randomUUID();
  let bitmap: DecodedPhoto | undefined;
  let main: { blob: Blob; w: number; h: number };
  let thumb: { blob: Blob; w: number; h: number };
  let original = false;
  try {
    bitmap = await decodePhoto(file);
    const type = photoFormat();
    main = await compressPhoto(bitmap, MAIN_SIZE, MAIN_MAX_BYTES, type);
    thumb = await compressPhoto(bitmap, THUMB_SIZE, THUMB_MAX_BYTES, type);
  } catch {
    if (file.size >= ORIGINAL_MAX_BYTES) throw new Error(`${file.name}: could not compress this photo. Please choose a smaller photo under 5 MB.`);
    main = { blob: file, w: bitmap?.width ?? 0, h: bitmap?.height ?? 0 };
    thumb = main;
    original = true;
  } finally { bitmap?.close(); }
  const paths = {
    main: `${id}/${original ? "original" : "main"}.${extension(main.blob.type)}`,
    thumb: original ? `${id}/original.${extension(main.blob.type)}` : `${id}/thumb.${extension(thumb.blob.type)}`,
  };
  for (const [key, data] of [["main", main.blob], ["thumb", thumb.blob]] as const) {
    if (original && key === "thumb") continue;
    const { error } = await supabase.storage.from(CAR_PHOTO_BUCKET).upload(paths[key], data, { contentType: data.type, cacheControl: "31536000", upsert: false });
    if (error) {
      if (key === "thumb") await supabase.storage.from(CAR_PHOTO_BUCKET).remove([paths.main]);
      throw error;
    }
  }
  return { ...paths, w: main.w, h: main.h };
}

export async function reprocessCarPhoto(photo: CarPhoto): Promise<CarPhoto> {
  const { data, error } = await supabase.storage.from(CAR_PHOTO_BUCKET).download(photo.main);
  if (error || !data) throw new Error("Could not download the photo for optimization");
  return uploadCarPhoto(new File([data], `photo.${extension(data.type)}`, { type: data.type }));
}

export async function deleteCarPhotos(photos: CarPhoto[]) {
  if (!photos.length) return;
  const { data: cars, error: readError } = await supabase.from("cars").select("photos");
  if (readError) throw readError;
  const referenced = new Set((cars ?? []).flatMap((c) => readPhotos(c.photos).flatMap((p) => [p.main, p.thumb])));
  const paths = photos.flatMap((p) => [p.main, p.thumb]).filter((p) => !referenced.has(p));
  if (!paths.length) return;
  const { error } = await supabase.storage.from(CAR_PHOTO_BUCKET).remove(paths);
  if (error) throw error;
}

/** Signed read links (bucket is readable by everyone through its policy). */
export function usePhotoUrls(paths: string[]) {
  return useQuery({
    queryKey: ["car-photo-urls", paths],
    enabled: paths.length > 0,
    staleTime: 1000 * 60 * 60 * 12,
    queryFn: async () => {
      const { signCarPhotos } = await import("./car-photos.functions");
      const urls: Record<string, string> = await signCarPhotos({ data: { paths } }).catch(() => ({}));
      const missing = paths.filter((p) => !urls[p]);
      if (missing.length) {
        // Owners can sign photos of inactive cars or unsaved uploads directly.
        const { data } = await supabase.storage.from(CAR_PHOTO_BUCKET).createSignedUrls(missing, 60 * 60 * 24 * 7);
        for (const d of data ?? []) if (d.path && d.signedUrl) urls[d.path] = d.signedUrl;
      }
      return urls;
    },
  }).data ?? {};
}
