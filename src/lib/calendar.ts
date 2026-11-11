import { addDays, format, isSameDay } from "date-fns";
import { locationLabel } from "@/lib/booking-math";

export type CalEvent = { kind: "pickup" | "return"; at: Date; bookingId: string; car: string; client: string; phone: string; location: string };
export type DayStat = { date: Date; key: string; pickups: CalEvent[]; returns: CalEvent[]; load: number };

type B = { id: string; status: string; pickup_at: string; return_at: string; full_name: string; phone: string; pickup_location?: string | null; location_details?: string | null; cars: { name: string } | null };

export function dayStats(bookings: B[], days: Date[]): DayStat[] {
  const active = bookings.filter((b) => b.status === "approved");
  return days.map((date) => {
    const pickups: CalEvent[] = [];
    const returns: CalEvent[] = [];
    for (const b of active) {
      const base = { bookingId: b.id, car: b.cars?.name ?? "Car", client: b.full_name, phone: b.phone, location: locationLabel(b.pickup_location ?? null, b.location_details ?? null) };
      const p = new Date(b.pickup_at);
      const r = new Date(b.return_at);
      if (isSameDay(p, date)) pickups.push({ ...base, kind: "pickup", at: p });
      if (isSameDay(r, date)) returns.push({ ...base, kind: "return", at: r });
    }
    return { date, key: format(date, "yyyy-MM-dd"), pickups, returns, load: pickups.length + returns.length };
  });
}

/** The day with the highest workload (earliest wins ties); null if every day is empty. */
export function busiest(stats: DayStat[]): DayStat | null {
  let best: DayStat | null = null;
  for (const s of stats) if (s.load > 0 && (!best || s.load > best.load)) best = s;
  return best;
}

export function range(start: Date, count: number): Date[] {
  return Array.from({ length: count }, (_, i) => addDays(start, i));
}

/** Map a workload to one of 5 shade levels relative to the busiest day shown. */
export function loadLevel(load: number, max: number): 0 | 1 | 2 | 3 | 4 {
  if (load <= 0 || max <= 0) return 0;
  return Math.max(1, Math.min(4, Math.ceil((load / max) * 4))) as 1 | 2 | 3 | 4;
}
