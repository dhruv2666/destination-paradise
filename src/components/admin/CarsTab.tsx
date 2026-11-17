import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Pencil, Plus } from "lucide-react";
import { CarImage } from "@/components/CarImage";
import { CarPhotosEditor } from "@/components/admin/CarPhotosEditor";
import { deleteCarPhotos, MAX_CAR_PHOTOS, readPhotos, type CarPhoto } from "@/lib/car-photos";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { friendlyError, qk, type Car } from "@/lib/data";
import { currencyLabel, readRanges } from "@/lib/booking-math";
import { PriceRangesList } from "@/components/PriceRanges";
import { Trash2 } from "lucide-react";
import { z } from "zod";
import { CarSchedule } from "@/components/admin/CarSchedule";

type RangeDraft = { min: string; max: string; price: string };
const amount = z.coerce.number().finite().nonnegative();
const rangeSchema = z.object({ min: z.number().int().min(1), max: z.number().int().min(1).nullable(), price: z.number().finite().nonnegative() })
  .refine((r) => r.max == null || r.max >= r.min);
const carSchema = z.object({
  name: z.string().trim().min(1).max(100), plate: z.string().trim().max(30),
  daily_price: amount, price_ranges: z.array(rangeSchema).max(20),
  currency: z.enum(["MUR", "EUR"]),
  seats: z.coerce.number().int().min(1).max(50), transmission: z.enum(["Manual", "Automatic"]),
  photo_url: z.string().nullable(), active: z.boolean(),
  photos: z.array(z.object({ main: z.string(), thumb: z.string(), w: z.number(), h: z.number() })).max(MAX_CAR_PHOTOS),
});

export function CarsTab({ cars, currency }: { cars: Car[]; currency: string }) {
  const [editing, setEditing] = useState<Partial<Car> | null>(null);
  const [schedule, setSchedule] = useState<Car | null>(null);
  return (
    <div className="space-y-4">
      <Button size="tap" onClick={() => setEditing({ seats: 5, transmission: "Manual", active: true })}>
        <Plus /> Add car
      </Button>
      {cars.length === 0 && <p className="text-muted-foreground">No cars yet — add your first one.</p>}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cars.map((c, i) => (
          <div key={c.id} className={`overflow-hidden rounded-2xl border border-border bg-card shadow-card ${c.active ? "" : "opacity-60"}`}>
            <div className="flex aspect-[16/9] items-center justify-center bg-secondary">
              <CarImage car={c} size="thumb" priority={i === 0} className="h-full w-full" />
            </div>
            <div className="flex items-start justify-between gap-2 p-4">
              <div>
                <h3 className="font-semibold">{c.name}</h3>
                <p className="text-sm text-muted-foreground">{c.plate} · {c.seats} seats · {c.transmission}</p>
                <PriceRangesList car={c} currency={c.currency ?? currency} className="-mx-2 mt-2" />
                {!c.active && <p className="text-xs font-semibold text-destructive">Deactivated</p>}
                <Button variant="outline" size="sm" className="mt-3" onClick={() => setSchedule(c)}>Block dates / Calendar</Button>
              </div>
              <Button variant="ghost" size="icon" className="h-11 w-11" onClick={() => setEditing(c)} aria-label={`Edit ${c.name}`}><Pencil /></Button>
            </div>
          </div>
        ))}
      </div>
      <CarDialog car={editing} onClose={() => setEditing(null)} />
      {schedule && <CarSchedule car={schedule} onClose={() => setSchedule(null)} />}
    </div>
  );
}

function CarDialog({ car, onClose }: { car: Partial<Car> | null; onClose: () => void }) {
  const qc = useQueryClient();
  const [f, setF] = useState<Partial<Car>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [lastId, setLastId] = useState<unknown>(null);
  const [ranges, setRanges] = useState<RangeDraft[]>([]);
  if (car !== lastId) {
    setLastId(car);
    setF(car ?? {});
    setRanges(readRanges(car?.price_ranges).map((r) => ({ min: String(r.min), max: r.max == null ? "" : String(r.max), price: String(r.price) })));
  }
  const setRange = (i: number, k: keyof RangeDraft, v: string) => setRanges((rs) => rs.map((r, j) => (j === i ? { ...r, [k]: v } : r)));

  const photos = readPhotos(f.photos);
  const [uploaded, setUploaded] = useState<CarPhoto[]>([]);
  async function removeCar() {
    if (!car?.id || saving) return;
    if (!window.confirm(`Permanently delete ${car.name ?? "this car"} and its photos? This cannot be undone.`)) return;
    setSaving(true);
    try {
      const { data, error } = await supabase.from("cars").delete().eq("id", car.id).select("id").single();
      if (error) {
        if (error.code === "23503") throw new Error("This car has booking history. Switch off Available for booking to hide it while keeping bookings and invoices.");
        throw error;
      }
      if (!data) throw new Error("Car could not be deleted.");
      await deleteCarPhotos([...readPhotos(car.photos), ...uploaded]);
      setUploaded([]);
      await qc.invalidateQueries({ queryKey: ["cars"] });
      toast.success("Car deleted");
      onClose();
    } catch (e) { toast.error(friendlyError(e)); }
    finally { setSaving(false); }
  }
  function close() {
    // Discard files uploaded in this session that were never saved.
    const saved = new Set(readPhotos(car?.photos).map((p) => p.main));
    void deleteCarPhotos(uploaded.filter((p) => !saved.has(p.main)));
    setUploaded([]);
    onClose();
  }

  async function save() {
    if (!f.name?.trim()) return void toast.error("Car name is required.");
    setSaving(true);
    const parsed = carSchema.safeParse({
      name: f.name.trim(),
      plate: f.plate ?? "",
      daily_price: Number(f.daily_price ?? 0),
      currency: f.currency ?? "MUR",
      price_ranges: ranges.map((r) => ({ min: Number(r.min), max: r.max.trim() === "" ? null : Number(r.max), price: r.price.trim() === "" ? NaN : Number(r.price) })),
      seats: Number(f.seats ?? 5),
      transmission: f.transmission ?? "Manual",
      photo_url: f.photo_url ?? null,
      active: f.active ?? true,
      photos,
    });
    if (!parsed.success) { setSaving(false); return void toast.error("Check the prices: each range needs a 'from' day, a 'to' day that isn't smaller (or empty for no limit), and a price."); }
    const row = parsed.data;
    const { error } = f.id
      ? await supabase.from("cars").update(row).eq("id", f.id)
      : await supabase.from("cars").insert(row);
    setSaving(false);
    if (error) return void toast.error(friendlyError(error));
    const kept = new Set(photos.map((p) => p.main));
    await deleteCarPhotos(readPhotos(car?.photos).filter((p) => !kept.has(p.main)));
    setUploaded([]);
    toast.success("Car saved");
    qc.invalidateQueries({ queryKey: ["cars"] });
    qc.invalidateQueries({ queryKey: qk.bookings });
    onClose();
  }

  return (
    <Dialog open={!!car} onOpenChange={(v) => !v && close()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{f.id ? "Edit car" : "Add car"}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <CarPhotosEditor photos={photos} onChange={(p) => setF((s) => ({ ...s, photos: p }))} onUploaded={(p) => setUploaded((u) => [...u, p])} onUploading={setUploading} />
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5"><Label>Name</Label><Input className="h-11" placeholder="Suzuki Swift" value={f.name ?? ""} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Plate</Label><Input className="h-11" value={f.plate ?? ""} onChange={(e) => setF({ ...f, plate: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Seats</Label><Input className="h-11" inputMode="numeric" value={f.seats ?? ""} onChange={(e) => setF({ ...f, seats: e.target.value as unknown as number })} /></div>
            <div className="space-y-1.5">
              <Label>Transmission</Label>
              <Select value={f.transmission ?? "Manual"} onValueChange={(v) => setF({ ...f, transmission: v })}>
                <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Manual">Manual</SelectItem><SelectItem value="Automatic">Automatic</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <fieldset className="space-y-3">
            <legend className="mb-1 font-semibold">Daily prices</legend>
            <p className="text-sm text-muted-foreground">Total = number of days × the daily rate of the matching range. If no range matches, the standard daily rate is used.</p>
            <div className="space-y-1.5">
              <Label htmlFor="car-currency">Currency</Label>
              <Select value={f.currency ?? "MUR"} onValueChange={(v) => setF({ ...f, currency: v })}>
                <SelectTrigger id="car-currency" className="h-11"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="MUR">Rs — Mauritian rupees</SelectItem><SelectItem value="EUR">€ — Euros</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="daily_price">Standard daily rate ({currencyLabel(f.currency)} / day)</Label>
              <Input id="daily_price" type="number" min="0" step="0.01" className="h-11" value={f.daily_price ?? ""} onChange={(e) => setF({ ...f, daily_price: e.target.value === "" ? 0 : Number(e.target.value) })} />
            </div>
            {ranges.map((r, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_1.4fr_auto] items-end gap-2 rounded-xl border border-border p-2">
                <div className="space-y-1"><Label className="text-xs">From (days)</Label><Input type="number" min="1" inputMode="numeric" className="h-11" value={r.min} onChange={(e) => setRange(i, "min", e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-xs">To (days)</Label><Input type="number" min="1" inputMode="numeric" placeholder="No limit" className="h-11" value={r.max} onChange={(e) => setRange(i, "max", e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-xs">{currencyLabel(f.currency)} / day</Label><Input type="number" min="0" step="0.01" className="h-11" value={r.price} onChange={(e) => setRange(i, "price", e.target.value)} /></div>
                <Button type="button" variant="ghost" size="icon" className="h-11 w-11" aria-label="Remove range" onClick={() => setRanges((rs) => rs.filter((_, j) => j !== i))}><Trash2 /></Button>
              </div>
            ))}
            <Button type="button" variant="outline" className="w-full" onClick={() => setRanges((rs) => [...rs, { min: "", max: "", price: "" }])}><Plus /> Add price range</Button>
          </fieldset>
          <div className="flex items-center justify-between rounded-xl bg-secondary p-3">
            <Label htmlFor="active">Available for booking</Label>
            <Switch id="active" checked={f.active ?? true} onCheckedChange={(v) => setF({ ...f, active: v })} />
          </div>
          <Button size="lg" className="w-full" onClick={save} disabled={saving || uploading}>{saving && <Loader2 className="animate-spin" />} Save car</Button>
          {f.id && <Button variant="destructive" className="w-full" onClick={removeCar} disabled={saving}><Trash2 /> Delete car</Button>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
