import { CarImage } from "@/components/CarImage";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { fetchCarUnavailable, friendlyError, type Booking, type Car } from "@/lib/data";
import { PriceRangesList } from "@/components/PriceRanges";
import { bookingExtras, readExtras } from "@/lib/booking-extras";
import { bookingDailyPrice, tierDailyPrice, currencyCode, currencyLabel, formatMoney, locationProblem, rangesOverlap, rentalDays } from "@/lib/booking-math";

type Props = {
  mode: "public" | "admin";
  cars: Car[];
  currency: string;
  termsHtml?: string | undefined;
  initial?: Partial<Booking> | undefined;
  defaults?: { car?: string | undefined; from?: string | undefined; to?: string | undefined } | undefined;
  onSaved: (b: Booking | null) => void;
};

const toDate = (iso?: string) => (iso ? format(new Date(iso), "yyyy-MM-dd") : "");
const toTime = (iso?: string) => (iso ? format(new Date(iso), "HH:mm") : "10:00");

export function BookingForm({ mode, cars, currency, termsHtml, initial, defaults, onSaved }: Props) {
  const isAdmin = mode === "admin";
  const editing = Boolean(initial?.id);
  const [f, setF] = useState({
    full_name: initial?.full_name ?? "",
    phone: initial?.phone ?? "",
    email: initial?.email ?? "",
    id_number: initial?.id_number ?? "",
    licence_number: initial?.licence_number ?? "",
    car_id: initial?.car_id ?? (defaults?.car && cars.some((c) => c.id === defaults.car) ? defaults.car : ""),
    pickupDate: toDate(initial?.pickup_at) || defaults?.from || "",
    pickupTime: toTime(initial?.pickup_at),
    returnDate: toDate(initial?.return_at) || defaults?.to || "",
    returnTime: toTime(initial?.return_at),
    pickup_location: initial?.pickup_location ?? "",
    location_details: initial?.location_details ?? "",
    notes: initial?.notes ?? "",
    price: initial?.price_per_day != null ? String(initial.price_per_day) : "",
    deposit: initial?.deposit != null ? String(initial.deposit) : "0",
    status: initial?.status ?? "approved",
    currency: currencyCode(initial?.currency ?? cars.find((c) => c.id === (initial?.car_id ?? defaults?.car))?.currency ?? currency),
  });
  const [accepted, setAccepted] = useState(false);
  const [extras, setExtras] = useState(() => readExtras(initial?.extras));
  const [termsOpen, setTermsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof f) => (v: string) => setF((s) => ({ ...s, [k]: v }));

  const car = cars.find((c) => c.id === f.car_id);
  const selectedCurrency = isAdmin ? f.currency : car?.currency ?? currency;
  const pickup = f.pickupDate ? new Date(`${f.pickupDate}T${f.pickupTime || "00:00"}`) : null;
  const ret = f.returnDate ? new Date(`${f.returnDate}T${f.returnTime || "00:00"}`) : null;
  const days = pickup && ret ? rentalDays(pickup, ret) : 0;
  const pricePerDay = bookingDailyPrice(car ? tierDailyPrice(car, days) : 0, isAdmin && f.price !== "" ? Number(f.price) : null);
  const total = days * pricePerDay;

  const { data: busy = [] } = useQuery({
    queryKey: ["unavailable", f.car_id],
    queryFn: () => fetchCarUnavailable(f.car_id),
    enabled: !!f.car_id && !isAdmin,
  });
  const conflict = useMemo(
    () =>
      !!pickup && !!ret && busy.some((r) => rangesOverlap(pickup, ret, new Date(r.pickup_at), new Date(r.return_at))),
    [busy, pickup?.getTime(), ret?.getTime()],
  );

  const onCarChange = (id: string) => {
    setF((s) => ({ ...s, car_id: id, price: "", currency: currencyCode(cars.find((c) => c.id === id)?.currency) }));
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!f.full_name.trim() || !f.phone.trim() || !f.car_id || !pickup || !ret) {
      toast.error("Please fill in name, phone, car and both dates.");
      return;
    }
    if (ret <= pickup) return void toast.error("Return must be after pickup.");
    const locErr = locationProblem(f.pickup_location, f.location_details);
    if (locErr) return void toast.error(locErr);
    if (!isAdmin && !accepted) return void toast.error("Please accept the Terms and Conditions.");
    if (conflict) return void toast.error("This car is already booked for those dates.");
    if (!Number.isFinite(pricePerDay) || pricePerDay < 0 || !Number.isFinite(Number(f.deposit)) || Number(f.deposit) < 0) return void toast.error("Prices and deposit must be valid non-negative amounts.");
    setSaving(true);
    const base = {
      full_name: f.full_name.trim(),
      phone: f.phone.trim(),
      email: f.email.trim(),
      id_number: f.id_number.trim(),
      licence_number: f.licence_number.trim(),
      car_id: f.car_id,
      pickup_location: f.pickup_location,
      location_details: f.pickup_location === "other" ? f.location_details.trim() : null,
      pickup_at: pickup.toISOString(),
      return_at: ret.toISOString(),
      notes: f.notes.trim(),
      extras,
    };
    try {
      if (!isAdmin) {
        const { error } = await supabase.from("bookings").insert(base);
        if (error) throw error;
        onSaved({ ...base, car_name: car?.name ?? "car" } as unknown as Booking);
      } else {
        const adminFields = {
          currency: f.currency,
          price_per_day: pricePerDay,
          deposit: Number(f.deposit || 0),
          status: f.status,
        };
        const q = editing
          && initial?.id ? supabase.from("bookings").update({ ...base, ...adminFields }).eq("id", initial.id)
          : supabase.from("bookings").insert({ ...base, ...adminFields, source: "admin" });
        const { data, error } = await q.select("*").single();
        if (error) throw error;
        onSaved(data);
      }
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setSaving(false);
    }
  }

  const field = "min-w-0 space-y-1.5";
  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className={field}>
          <Label htmlFor="full_name">Full name *</Label>
          <Input id="full_name" className="h-11" value={f.full_name} onChange={(e) => set("full_name")(e.target.value)} />
        </div>
        <div className={field}>
          <Label htmlFor="phone">WhatsApp number *</Label>
          <Input id="phone" className="h-11" type="tel" placeholder="+230 5xxx xxxx" value={f.phone} onChange={(e) => set("phone")(e.target.value)} />
        </div>
        <div className={field}>
          <Label htmlFor="email">Email</Label>
          <Input id="email" className="h-11" type="email" value={f.email} onChange={(e) => set("email")(e.target.value)} />
        </div>
        <div className={field}>
          <Label htmlFor="id_number">ID / passport number</Label>
          <Input id="id_number" className="h-11" value={f.id_number} onChange={(e) => set("id_number")(e.target.value)} />
        </div>
        <div className={`${field} sm:col-span-2`}>
          <Label htmlFor="licence">Driving licence number</Label>
          <Input id="licence" className="h-11" value={f.licence_number} onChange={(e) => set("licence_number")(e.target.value)} />
        </div>
      </div>

      <div className={field}>
        <Label>Car *</Label>
        <Select value={f.car_id} onValueChange={onCarChange}>
          <SelectTrigger className="h-11"><SelectValue placeholder="Choose a car" /></SelectTrigger>
          <SelectContent>
            {cars.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name} · {formatMoney(c.daily_price, c.currency)}/day{!c.active ? " (inactive)" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {car && <div className="mt-2 rounded-xl border border-border p-2"><p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Daily rates</p><PriceRangesList car={car} currency={car.currency} days={days} /></div>}
        {car && <div className="mt-2 aspect-[16/10] overflow-hidden rounded-xl bg-secondary"><CarImage car={car} size="main" className="h-full w-full" /></div>}
      </div>

      <div className={field}>
        <Label>Pickup location *</Label>
        <RadioGroup value={f.pickup_location} onValueChange={set("pickup_location")} className="grid gap-2 sm:grid-cols-2">
          <Label htmlFor="loc-airport" className="flex h-11 cursor-pointer items-center gap-3 rounded-md border px-3 font-normal">
            <RadioGroupItem id="loc-airport" value="airport" /> SSR International Airport
          </Label>
          <Label htmlFor="loc-other" className="flex h-11 cursor-pointer items-center gap-3 rounded-md border px-3 font-normal">
            <RadioGroupItem id="loc-other" value="other" /> Other
          </Label>
        </RadioGroup>
        {f.pickup_location === "other" && (
          <Input
            className="h-11"
            placeholder="Hotel, address or meeting point"
            value={f.location_details}
            onChange={(e) => set("location_details")(e.target.value)}
          />
        )}
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
        <div className={field}>
          <Label htmlFor="pd">Pickup date *</Label>
          <Input id="pd" className="h-11 min-w-0 max-w-full" type="date" value={f.pickupDate} onChange={(e) => set("pickupDate")(e.target.value)} />
        </div>
        <div className={field}>
          <Label htmlFor="pt">Pickup time</Label>
          <Input id="pt" className="h-11 min-w-0 max-w-full" type="time" value={f.pickupTime} onChange={(e) => set("pickupTime")(e.target.value)} />
        </div>
        <div className={field}>
          <Label htmlFor="rd">Return date *</Label>
          <Input id="rd" className="h-11 min-w-0 max-w-full" type="date" value={f.returnDate} onChange={(e) => set("returnDate")(e.target.value)} />
        </div>
        <div className={field}>
          <Label htmlFor="rt">Return time</Label>
          <Input id="rt" className="h-11 min-w-0 max-w-full" type="time" value={f.returnTime} onChange={(e) => set("returnTime")(e.target.value)} />
        </div>
      </div>

      {isAdmin && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className={`${field} col-span-2 sm:col-span-3`}>
            <Label htmlFor="booking-currency">Currency</Label>
            <Select value={f.currency} onValueChange={(v) => set("currency")(currencyCode(v))}>
              <SelectTrigger id="booking-currency" className="h-11"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="MUR">Rs — Mauritian rupees</SelectItem><SelectItem value="EUR">€ — Euros</SelectItem></SelectContent>
            </Select>
          </div>
          <div className={field}>
            <Label htmlFor="price">Daily rate ({currencyLabel(selectedCurrency)})</Label>
            <Input id="price" className="h-11" inputMode="decimal" value={f.price} onChange={(e) => set("price")(e.target.value)} />
          </div>
          <div className={field}>
            <Label htmlFor="deposit">Deposit ({currencyLabel(selectedCurrency)})</Label>
            <Input id="deposit" className="h-11" inputMode="decimal" value={f.deposit} onChange={(e) => set("deposit")(e.target.value)} />
          </div>
          <div className={`${field} col-span-2 sm:col-span-1`}>
            <Label>Status</Label>
            <Select value={f.status} onValueChange={set("status")}>
              <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["approved", "pending", "rejected", "cancelled"].map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-medium">Optional extras</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {bookingExtras.map((extra, index) => (
            <Label key={extra} htmlFor={`extra-${index}`} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-border px-3 py-2 font-normal">
              <Checkbox id={`extra-${index}`} checked={extras.includes(extra)} onCheckedChange={(checked) => setExtras((current) => checked === true ? [...current.filter((item) => item !== extra), extra] : current.filter((item) => item !== extra))} />
              {extra}
            </Label>
          ))}
        </div>
      </fieldset>

      <div className={field}>
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" rows={3} value={f.notes} onChange={(e) => set("notes")(e.target.value)} />
      </div>

      <div className="rounded-xl bg-secondary p-4">
        {conflict ? (
          <p className="text-sm font-medium text-destructive">This car is already booked for part of these dates. Please pick other dates or another car.</p>
        ) : days > 0 && car ? (
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              <div>Duration: <span className="font-semibold text-foreground">{days} day{days > 1 ? "s" : ""}</span></div>
              <div>Daily rate: <span className="font-semibold text-foreground">{formatMoney(pricePerDay, selectedCurrency)} / day</span></div>
              <div>{days} × {formatMoney(pricePerDay, selectedCurrency)}</div>
              {isAdmin && Number(f.deposit) > 0 && <div>+ deposit {formatMoney(Number(f.deposit), selectedCurrency)}</div>}
            </div>
            <div className="text-right"><div className="text-xs text-muted-foreground">Total</div><div className="font-display text-2xl font-bold">{formatMoney(total, selectedCurrency)}</div></div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Choose a car and dates to see the total.</p>
        )}
      </div>

      {!isAdmin && (
        <div className="flex items-start gap-3">
          <Checkbox id="terms" checked={accepted} onCheckedChange={(v) => setAccepted(v === true)} className="mt-0.5 h-5 w-5" />
          <Label htmlFor="terms" className="text-sm font-normal leading-snug">
            I accept the{" "}
            <button type="button" onClick={() => setTermsOpen(true)} className="font-semibold text-primary underline underline-offset-2">
              Terms and Conditions
            </button>
          </Label>
        </div>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={saving || conflict}>
        {saving && <Loader2 className="animate-spin" />}
        {isAdmin ? (editing ? "Save changes" : "Create booking") : "Send booking request"}
      </Button>

      <Dialog open={termsOpen} onOpenChange={setTermsOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>Terms and Conditions</DialogTitle></DialogHeader>
          <div className="prose-terms text-sm" dangerouslySetInnerHTML={{ __html: termsHtml || "<p>No terms published yet.</p>" }} />
          <Button onClick={() => { setAccepted(true); setTermsOpen(false); }}>I accept</Button>
        </DialogContent>
      </Dialog>
    </form>
  );
}
