import { supabase } from "@/integrations/supabase/client";
import { confirmIdUploads, createIdUploadUrls } from "@/lib/id-documents.functions";
import {
  ID_DOC_BUCKET, ID_DOC_KEEP_DAYS, ID_DOC_KEEP_DAYS_UNUSED, ID_DOC_MAX_BYTES, ID_DOC_TYPES,
  fileExtension, type IdDocKind, type IdDocument,
} from "@/lib/id-documents.shared";

const DAY = 24 * 60 * 60 * 1000;

/** Returns an error message for a file the customer picked, or null when it's fine. */
export function checkIdFile(file: File, fr = false): string | null {
  if (!fileExtension(file.name)) return fr ? "Format accepté : photo (JPG, PNG, HEIC) ou PDF." : "Please choose a photo (JPG, PNG, HEIC) or a PDF.";
  if (file.size > ID_DOC_MAX_BYTES) return fr ? "Fichier trop lourd (10 Mo maximum)." : "This file is too large (10 MB maximum).";
  return null;
}

/** Big phone photos are scaled down before upload: faster on mobile data, still easy to read. */
async function shrink(file: File): Promise<File> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size < 2_500_000) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 2400 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
    return blob && blob.size < file.size ? new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" }) : file;
  } catch {
    return file;
  }
}

/** Uploads the customer's documents for a booking they have just sent. */
export async function uploadIdDocuments(bookingId: string, files: Partial<Record<IdDocKind, File>>): Promise<void> {
  const picked = (await Promise.all(
    (Object.entries(files) as [IdDocKind, File | undefined][])
      .filter((e): e is [IdDocKind, File] => !!e[1])
      .map(async ([kind, file]) => [kind, await shrink(file)] as const),
  ));
  if (picked.length === 0) return;
  const links = await createIdUploadUrls({
    data: { bookingId, files: picked.map(([kind, file]) => ({ kind, ext: fileExtension(file.name) ?? "jpg" })) },
  });
  const uploaded: { kind: IdDocKind; path: string; name: string }[] = [];
  for (const [kind, file] of picked) {
    const link = links.find((l) => l.kind === kind);
    if (!link) continue;
    const ext = fileExtension(file.name) ?? "jpg";
    const { error } = await supabase.storage
      .from(ID_DOC_BUCKET)
      .uploadToSignedUrl(link.path, link.token, file, { contentType: file.type || ID_DOC_TYPES[ext] });
    if (!error) uploaded.push({ kind, path: link.path, name: file.name });
  }
  if (uploaded.length === 0) throw new Error("upload failed");
  await confirmIdUploads({ data: { bookingId, files: uploaded } });
  if (uploaded.length < picked.length) throw new Error("some uploads failed");
}

// ---------- Admin only (these calls are refused for anyone who isn't an owner) ----------

export async function fetchIdDocuments(bookingId: string): Promise<IdDocument[]> {
  const { data, error } = await supabase
    .from("booking_id_documents")
    .select("*")
    .eq("booking_id", bookingId)
    .order("kind");
  if (error) throw error;
  return (data ?? []) as IdDocument[];
}

/** A short-lived link (10 minutes) so the owner can open a document. */
export async function idDocumentLink(path: string, download = false): Promise<string> {
  const { data, error } = await supabase.storage.from(ID_DOC_BUCKET).createSignedUrl(path, 600, { download });
  if (error || !data) throw error ?? new Error("Could not open the document");
  return data.signedUrl;
}

/** Removes the stored documents of the given bookings (files and records). */
export async function deleteIdDocumentsForBookings(bookingIds: string[]): Promise<void> {
  if (bookingIds.length === 0) return;
  const { data } = await supabase.from("booking_id_documents").select("path").in("booking_id", bookingIds);
  const paths = (data ?? []).map((d) => d.path);
  if (paths.length) await supabase.storage.from(ID_DOC_BUCKET).remove(paths);
  await supabase.from("booking_id_documents").delete().in("booking_id", bookingIds);
}

/**
 * Deletes documents that are past their keep period: 90 days after the car was returned,
 * or 30 days after a booking was rejected or cancelled. Runs when an owner opens the dashboard.
 */
export async function purgeExpiredIdDocuments(): Promise<number> {
  const { data, error } = await supabase
    .from("booking_id_documents")
    .select("booking_id, bookings(status, return_at, updated_at)");
  if (error || !data) return 0;
  const now = Date.now();
  const expired = new Set<string>();
  for (const row of data as { booking_id: string; bookings: { status: string; return_at: string; updated_at: string } | null }[]) {
    const b = row.bookings;
    if (!b) { expired.add(row.booking_id); continue; }
    const unused = b.status === "rejected" || b.status === "cancelled";
    const from = new Date(unused ? b.updated_at : b.return_at).getTime();
    if (now - from > (unused ? ID_DOC_KEEP_DAYS_UNUSED : ID_DOC_KEEP_DAYS) * DAY) expired.add(row.booking_id);
  }
  await deleteIdDocumentsForBookings([...expired]);
  return expired.size;
}
