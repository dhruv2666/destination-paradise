import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import type { BookingWithCar, Car } from "@/lib/data";
import { cn } from "@/lib/utils";

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Indian/Mauritius" });

type Item = { key: string; start: string; end: string; kind: "booked" | "pending" | "blocked"; label: string; note?: string };

export function ScheduleTab({ cars, bookings }: { cars: Car[]; bookings: BookingWithCar[] }) {
  const [showPending, setShowPending] = useState(true);
  const blocks = useQuery({
    queryKey: ["all-car-blocks"],
    queryFn: async () => {
      const { data, error } = await supabase.from("car_date_blocks").select("*").order("start_at");
      if (error) throw error;
      return data;
    },
  });
  const now = Date.now();
  const itemsFor = (car: Car): Item[] => {
    const b: Item[] = bookings
      .filter((x) => x.car_id === car.id && ["approved", "confirmed", "pending"].includes(x.status) && Date.parse(x.return_at) > now)
      .filter((x) => showPending || x.status !== "pending")
      .map((x) => ({ key: x.id, start: x.pickup_at, end: x.return_at, kind: x.status === "pending" ? "pending" : "booked", label: x.full_name }));
    const k: Item[] = (blocks.data ?? [])
      .filter((x) => x.car_id === car.id && Date.parse(x.end_at) > now)
      .map((x) => ({ key: x.id, start: x.start_at, end: x.end_at, kind: "blocked", label: x.reason, note: x.note }));
    return [...b, ...k].sort((a, c) => Date.parse(a.start) - Date.parse(c.start));
  };
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-xl font-bold">Fleet schedule</h1>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={showPending} onChange={(e) => setShowPending(e.target.checked)} />Show pending</label>
      </div>
      {blocks.isError && <p role="alert" className="text-destructive">Could not load blocked dates.</p>}
      <div className="grid gap-3 md:grid-cols-2">
        {cars.map((car) => {
          const items = itemsFor(car);
          return (
            <article key={car.id} className="min-w-0 space-y-3 rounded-lg border border-border bg-card p-4 shadow-card">
              <h2 className="font-semibold">{car.name}</h2>
              {items.length === 0 && <p className="text-sm text-muted-foreground">Free</p>}
              <ul className="space-y-2">
                {items.map((i) => (
                  <li key={i.key} className={cn("flex items-start justify-between gap-2 rounded-md border border-border p-2 text-sm", i.kind === "pending" && "opacity-60 border-dashed")}>
                    <div className="min-w-0">
                      <div className="font-medium">{fmt(i.start)} – {fmt(i.end)}</div>
                      <div className="break-words text-muted-foreground"><span className={i.kind === "blocked" ? "capitalize" : ""}>{i.label}</span>{i.note ? ` · ${i.note}` : ""}</div>
                    </div>
                    <Badge variant={i.kind === "blocked" ? "destructive" : "outline"}>{i.kind === "booked" ? "Booked" : i.kind === "pending" ? "Pending" : "Blocked"}</Badge>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </section>
  );
}
