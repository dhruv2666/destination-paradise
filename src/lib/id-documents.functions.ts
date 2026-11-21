import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { ID_DOC_BUCKET, ID_DOC_KINDS, ID_DOC_MAX_BYTES, ID_DOC_TYPES } from "@/lib/id-documents.shared";

/** A customer may attach documents only to a booking they sent in the last hour that has none yet. */
const UPLOAD_WINDOW_MS = 60 * 60 * 1000;

const kind = z.enum(ID_DOC_KINDS);
const extension = z.string().refine((e) => e in ID_DOC_TYPES, "File type not allowed");

async function loadOpenBooking(bookingId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: booking, error } = await supabaseAdmin
    .from("bookings")
    .select("id,status,source,created_at")
    .eq("id", bookingId)
    .maybeSingle();
  if (error || !booking) throw new Error("Booking not found");
  const { count, error: countError } = await supabaseAdmin
    .from("booking_id_documents")
    .select("id", { count: "exact", head: true })
    .eq("booking_id", bookingId);
  if (countError) throw new Error("Could not check this booking");
  const fresh = Date.now() - new Date(booking.created_at).getTime() < UPLOAD_WINDOW_MS;
  if (booking.status !== "pending" || booking.source !== "online" || !fresh || (count ?? 0) > 0) {
    throw new Error("Documents can no longer be added to this booking. Please send them on WhatsApp.");
  }
  return supabaseAdmin;
}

/** Step 1: one signed upload link per document. Each link works once and only for its own path. */
export const createIdUploadUrls = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    bookingId: z.string().uuid(),
    files: z.array(z.object({ kind, ext: extension })).min(1).max(ID_DOC_KINDS.length)
      .refine((f) => new Set(f.map((x) => x.kind)).size === f.length, "One file per document"),
  }))
  .handler(async ({ data }) => {
    const admin = await loadOpenBooking(data.bookingId);
    const out: { kind: string; path: string; token: string }[] = [];
    for (const f of data.files) {
      const path = `${data.bookingId}/${f.kind}-${crypto.randomUUID()}.${f.ext}`;
      const { data: signed, error } = await admin.storage.from(ID_DOC_BUCKET).createSignedUploadUrl(path);
      if (error || !signed) throw new Error("Could not prepare the upload. Please try again.");
      out.push({ kind: f.kind, path: signed.path, token: signed.token });
    }
    return out;
  });

/** Step 2: after uploading, record on the booking which files really arrived. */
export const confirmIdUploads = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    bookingId: z.string().uuid(),
    files: z.array(z.object({ kind, path: z.string().max(300), name: z.string().max(200) })).min(1).max(ID_DOC_KINDS.length),
  }))
  .handler(async ({ data }) => {
    const admin = await loadOpenBooking(data.bookingId);
    const { data: stored, error } = await admin.storage.from(ID_DOC_BUCKET).list(data.bookingId, { limit: 20 });
    if (error) throw new Error("Could not check the uploaded files.");
    const byPath = new Map((stored ?? []).map((o) => [`${data.bookingId}/${o.name}`, o]));
    const rows = [];
    for (const f of data.files) {
      const obj = byPath.get(f.path);
      // Only accept files inside this booking's folder that match the declared document type.
      if (!obj || !f.path.startsWith(`${data.bookingId}/${f.kind}-`)) continue;
      const meta = (obj.metadata ?? {}) as { size?: number; mimetype?: string };
      const size = Number(meta.size ?? 0);
      if (size > ID_DOC_MAX_BYTES) continue;
      rows.push({
        booking_id: data.bookingId,
        kind: f.kind,
        path: f.path,
        name: f.name.replace(/[^\w.\- ]+/g, "_").slice(0, 120),
        content_type: String(meta.mimetype ?? ""),
        size_bytes: size,
      });
    }
    if (rows.length === 0) throw new Error("The files did not upload. Please try again.");
    const { error: insertError } = await admin.from("booking_id_documents").insert(rows);
    if (insertError) throw new Error("Could not save the documents on your booking.");
    return { saved: rows.length };
  });
