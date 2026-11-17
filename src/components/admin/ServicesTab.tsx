import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, MessageCircle, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { weddingMediaQuery } from "@/lib/services.functions";
import { SERVICE_STATUSES, serviceMessage, type ServiceInput } from "@/lib/services";
import { BUSINESS_PHONE } from "@/lib/brand";
import { whatsappUrl } from "@/lib/whatsapp";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type ServiceRequest = ServiceInput & { status: string; created_at: string };
const SLOTS = [
  { slot: "hero", label: "Hero (top of page)" },
  { slot: "x5", label: "BMW X5" },
  { slot: "7series", label: "BMW 7 Series" },
] as const;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

async function fetchRequests(): Promise<ServiceRequest[]> {
  const { data, error } = await supabase.from("service_requests").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as ServiceRequest[];
}

export function ServicesTab() {
  const qc = useQueryClient();
  const requests = useQuery({ queryKey: ["service-requests"], queryFn: fetchRequests });
  const media = useQuery(weddingMediaQuery);
  const [busy, setBusy] = useState("");

  async function setStatus(id: string, status: string) {
    setBusy(id + status);
    const { error } = await supabase.from("service_requests").update({ status }).eq("id", id);
    setBusy("");
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["service-requests"] });
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this request? This cannot be undone.")) return;
    const { error } = await supabase.from("service_requests").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["service-requests"] });
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-display text-base font-bold">Wedding & transfer requests</h2>
        {requests.isLoading && <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Loading…</p>}
        {requests.data?.length === 0 && <p className="mt-3 rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">No requests yet.</p>}
        <ul className="mt-3 space-y-3">
          {requests.data?.map((r) => (
            <li key={r.id} className="rounded-xl border border-border bg-card p-4 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">{r.service === "wedding" ? `Wedding · ${r.car_choice}` : "Airport transfer"}</p>
                <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold", r.status === "confirmed" ? "bg-success text-success-foreground" : r.status === "quoted" ? "bg-warning text-warning-foreground" : "bg-secondary text-secondary-foreground")}>{r.status}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{r.request_date} {r.request_time} · {r.pickup_location} → {r.dropoff_location}</p>
              <p className="mt-1 text-sm">{r.name} · {r.phone}{r.service === "wedding" ? ` · ${r.hours}h` : ` · ${r.passengers} pax, ${r.luggage} bags`}{r.flight_number ? ` · ${r.flight_number}` : ""}</p>
              {r.notes && <p className="mt-1 text-sm text-muted-foreground">{r.notes}</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                {SERVICE_STATUSES.filter((st) => st !== r.status).map((st) => (
                  <Button key={st} variant="outline" size="sm" disabled={!!busy} onClick={() => setStatus(r.id, st)}>
                    {busy === r.id + st ? <Loader2 className="animate-spin" /> : <Check />}Mark {st}
                  </Button>
                ))}
                <Button asChild variant="whatsapp" size="sm"><a href={whatsappUrl(BUSINESS_PHONE, serviceMessage(r, false))} target="_blank" rel="noopener noreferrer"><MessageCircle />WhatsApp</a></Button>
                <Button variant="destructive" size="sm" onClick={() => remove(r.id)}><Trash2 />Delete</Button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-display text-base font-bold">Wedding car photos</h2>
        <p className="mt-1 text-sm text-muted-foreground">Replace the placeholder photos shown on the wedding page. JPG, PNG or WebP up to 5 MB.</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {SLOTS.map(({ slot, label }) => <PhotoSlot key={slot} slot={slot} label={label} current={media.data?.find((m) => m.slot === slot)} onDone={() => qc.invalidateQueries({ queryKey: weddingMediaQuery.queryKey })} />)}
        </div>
      </section>
    </div>
  );
}

function PhotoSlot({ slot, label, current, onDone }: { slot: string; label: string; current?: { image_url: string; placeholder: boolean } | undefined; onDone: () => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function upload(file: File) {
    if (file.size > MAX_PHOTO_BYTES) { toast.error("Photo must be under 5 MB"); return; }
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `${crypto.randomUUID()}/original.${ext}`;
    setUploading(true);
    const { error: upError } = await supabase.storage.from("service-photos").upload(path, file, { contentType: file.type, cacheControl: "31536000" });
    if (upError) { setUploading(false); toast.error(upError.message); return; }
    const { error } = await supabase.from("wedding_media").upsert({ slot, image_url: path, placeholder: false }, { onConflict: "slot" });
    setUploading(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`${label} photo updated`);
    onDone();
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-card">
      <p className="font-semibold">{label}</p>
      <div className="mt-2 aspect-[3/2] overflow-hidden rounded-lg bg-secondary">
        {current?.image_url ? <img src={current.image_url} alt={`${label} wedding photo`} className="h-full w-full object-cover" /> : <p className="flex h-full items-center justify-center text-sm text-muted-foreground">Placeholder photo in use</p>}
      </div>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />
      <Button variant="outline" size="sm" className="mt-3" disabled={uploading} onClick={() => input.current?.click()}>
        {uploading ? <Loader2 className="animate-spin" /> : <Upload />}{uploading ? "Uploading…" : "Replace photo"}
      </Button>
    </div>
  );
}
