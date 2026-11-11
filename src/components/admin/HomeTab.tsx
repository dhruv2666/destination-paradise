import type { Booking, Car } from "@/lib/data";
import { holidayToday, mauritiusDate, nextHoliday } from "@/lib/holidays";
import { StatusBadge } from "./StatusBadge";
import { Button } from "@/components/ui/button";
import { ArrowDownLeft, ArrowUpRight, Car as CarIcon, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { locationLabel } from "@/lib/booking-math";

type Props = { bookings: Booking[]; cars: Car[]; go: (tab: string) => void };

export function HomeTab({ bookings, cars, go }: Props) {
  const today = mauritiusDate();
  const holiday = holidayToday(today);
  const upcomingHoliday = nextHoliday(today);
  const day = (iso: string) => mauritiusDate(new Date(iso));
  const approved = bookings.filter((b) => b.status === "approved");
  const pending = bookings.filter((b) => b.status === "pending");
  const pickups = approved.filter((b) => day(b.pickup_at) === today);
  const returns = approved.filter((b) => day(b.return_at) === today);
  const onRoad = approved.filter((b) => day(b.pickup_at) <= today && day(b.return_at) >= today);
  const upcoming = approved.filter((b) => day(b.pickup_at) > today).sort((a, b) => a.pickup_at.localeCompare(b.pickup_at)).slice(0, 5);
  const carName = (id: string) => cars.find((c) => c.id === id)?.name ?? "Car";
  const fmt = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  const daysTo = upcomingHoliday ? Math.round((Date.parse(upcomingHoliday.date) - Date.parse(today)) / 86400000) : 0;

  const stats: [string, string | number, string][] = [
    ["Requests waiting", pending.length, "requests"],
    ["Pickups today", pickups.length, "calendar"],
    ["Returns today", returns.length, "calendar"],
    ["Cars out now", `${onRoad.length} / ${cars.filter((c) => c.active).length}`, "bookings"],
  ];
  const statStyles = ["bg-coral-soft", "bg-lagoon-soft", "bg-sunshine-soft", "bg-palm-soft"];
  const statIcons = [Inbox, ArrowUpRight, ArrowDownLeft, CarIcon];

  return (
    <div className="space-y-4">
      {holiday ? (
        <div className="rounded-2xl bg-accent p-5 text-accent-foreground">
          <p className="text-3xl">{holiday.emoji}</p>
          <p className="font-display text-2xl font-bold">{holiday.greeting}</p>
          <p className="text-sm opacity-80">{holiday.name} — public holiday in Mauritius</p>
        </div>
      ) : upcomingHoliday && daysTo <= 14 ? (
        <div className="rounded-2xl border border-accent/50 bg-card p-4">
          <p className="text-sm text-muted-foreground">Coming up {daysTo === 1 ? "tomorrow" : `in ${daysTo} days`}</p>
          <p className="font-display text-lg font-bold">{upcomingHoliday.emoji} {upcomingHoliday.name}</p>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        {stats.map(([label, value, tab], i) => {
          const Icon = statIcons[i] ?? CarIcon;
          return <Button variant="ghost" key={label} onClick={() => go(tab)} className={cn("h-auto min-h-32 flex-col items-start gap-2 whitespace-normal rounded-lg border border-border p-4 text-left shadow-card hover:bg-secondary", statStyles[i])}>
            <Icon className="text-primary" />
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="font-display text-2xl font-bold">{value}</span>
          </Button>;
        })}
      </div>


      <div className="rounded-lg border border-border bg-card p-4 shadow-card">
        <p className="mb-2 font-semibold">Today's client pickups</p>
        {pickups.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pickups today.</p>
        ) : (
          <ul className="divide-y divide-border">
            {[...pickups].sort((a, b) => a.pickup_at.localeCompare(b.pickup_at)).map((b) => (
              <li key={b.id} className="py-2 text-sm">
                <p className="font-semibold">{new Date(b.pickup_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Indian/Mauritius" })} · {b.full_name}</p>
                <p className="text-muted-foreground">{carName(b.car_id)} · Pick up: {locationLabel(b.pickup_location, b.location_details)}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-border py-4">
        <p className="mb-2 font-semibold">Next pickups</p>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming bookings.</p>
        ) : (
          <ul className="divide-y divide-border">
            {upcoming.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{b.full_name} · {carName(b.car_id)}</p>
                  <p className="text-muted-foreground">{fmt(b.pickup_at)} · {locationLabel(b.pickup_location, b.location_details)}</p>
                </div>
                <StatusBadge status={b.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
