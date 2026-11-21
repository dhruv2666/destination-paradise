// Shared by the browser and the server: which documents exist and how they are named.

export const ID_DOC_BUCKET = "id-documents";
export const ID_DOC_MAX_BYTES = 10 * 1024 * 1024; // 10 MB, matches the bucket limit
export const ID_DOC_ACCEPT = ".jpg,.jpeg,.png,.webp,.heic,.heif,.pdf";
export const ID_DOC_TYPES: Record<string, string> = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp",
  heic: "image/heic", heif: "image/heif", pdf: "application/pdf",
};
/** How long after the car is returned the files are kept. */
export const ID_DOC_KEEP_DAYS = 90;
/** How long the files of a rejected or cancelled booking are kept. */
export const ID_DOC_KEEP_DAYS_UNUSED = 30;

export const ID_DOC_KINDS = ["licence_front", "licence_back", "id_passport", "other"] as const;
export type IdDocKind = (typeof ID_DOC_KINDS)[number];
/** Uploading is always optional: customers can show the originals at pickup instead. */
export const REQUIRED_ID_DOCS: IdDocKind[] = [];

export const ID_DOC_LABELS: Record<"en" | "fr", Record<IdDocKind, string>> = {
  en: { licence_front: "Driving licence — front", licence_back: "Driving licence — back", id_passport: "NIC / passport", other: "Other document" },
  fr: { licence_front: "Permis de conduire — recto", licence_back: "Permis de conduire — verso", id_passport: "NIC / passeport", other: "Autre document" },
};

/** A row of the booking_id_documents table. */
export type IdDocument = { id: string; booking_id: string; kind: IdDocKind; path: string; name: string; content_type: string; size_bytes: number; uploaded_at: string };

export function fileExtension(name: string): string | null {
  const ext = name.toLowerCase().split(".").pop() ?? "";
  return ext in ID_DOC_TYPES ? ext : null;
}
