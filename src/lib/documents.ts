import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { docNumberLabel, formatMoney, locationLabel } from "./booking-math";
import { readExtras } from "./booking-extras";
import { fillTemplate } from "./whatsapp";
import type { Booking, Car, Settings } from "./data";
import { brandLogo } from "./brand";

const LINK_TTL = 60 * 60 * 24 * 365; // one year

export function docPath(b: Pick<Booking, "id">) {
  return `${b.id}.pdf`;
}

export function docFileName(b: Pick<Booking, "doc_number">) {
  return `${docNumberLabel(b.doc_number)}.pdf`;
}

/** Build the PDF, store it (same path every time, so the number and link stay the same) and record it on the booking. */
export async function generateDocument(
  booking: Booking,
  car: Pick<Car, "name" | "plate"> | null,
  settings: Settings,
): Promise<Blob> {
  // Load the PDF library only when a document is actually generated,
  // so it isn't part of the admin dashboard's initial download.
  const [{ buildBookingPdf }, logo] = await Promise.all([
    import("./pdf"),
    defaultLogo(brandLogo(settings.logo_url)),
  ]);
  const blob = buildBookingPdf({ ...settings, logo_url: logo }, {
    ...booking,
    car_name: car?.name ?? "Car",
    car_plate: car?.plate ?? "",
    terms_html: settings.terms_html || booking.terms_html || "",
  });
  const path = docPath(booking);
  const { error } = await supabase.storage
    .from("documents")
    .upload(path, blob, { upsert: true, contentType: "application/pdf", cacheControl: "60" });
  if (error) throw error;
  const { error: upErr } = await supabase
    .from("bookings")
    .update({ pdf_path: path, pdf_generated_at: new Date().toISOString() })
    .eq("id", booking.id);
  if (upErr) throw upErr;
  return blob;
}

async function defaultLogo(source: string): Promise<string | null> {
  if (source.startsWith("data:image")) return source;
  try {
    const response = await fetch(source);
    if (!response.ok) return null;
    const blob = await response.blob();
    if (blob.type === "image/webp") {
      const bitmap = await createImageBitmap(blob);
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width; canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { bitmap.close(); return null; }
      ctx.drawImage(bitmap, 0, 0); bitmap.close();
      return canvas.toDataURL("image/png");
    }
    return await new Promise((resolve) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result as string);
      fr.onerror = () => resolve(null);
      fr.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/** Remove the stored PDFs of bookings being deleted. Missing files are ignored. */
export async function deleteBookingDocuments(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  await supabase.storage.from("documents").remove(ids.map((id) => docPath({ id })));
}

export async function documentLink(path: string): Promise<string> {
  const { data, error } = await supabase.storage.from("documents").createSignedUrl(path, LINK_TTL);
  if (error) throw error;
  return data.signedUrl;
}

export async function documentBlob(path: string): Promise<Blob> {
  const { data, error } = await supabase.storage.from("documents").download(path);
  if (error) throw error;
  return data;
}

export function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function bookingMessage(
  template: string,
  b: Booking,
  carName: string,
  currency: string,
  link: string,
) {
  const d = (s: string) => format(new Date(s), "d MMM yyyy, HH:mm");
  return fillTemplate(template, {
    name: b.full_name.split(" ")[0] || b.full_name,
    car: carName,
    from: d(b.pickup_at),
    to: d(b.return_at),
    total: formatMoney(b.total_price, b.currency ?? currency),
    pickup_location: locationLabel(b.pickup_location, b.location_details),
    return_location: locationLabel(b.return_location, b.return_location_details),
    extras: readExtras(b.extras).join(", ") || "None",
    link,
  });
}
