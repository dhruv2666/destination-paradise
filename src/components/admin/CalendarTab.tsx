import { useMemo, useState } from "react";
import {
  addDays, addMonths, addWeeks, endOfMonth, endOfWeek, format, isSameDay, isSameMonth,
  startOfDay, startOfMonth, startOfWeek, differenceInCalendarDays,
} from "date-fns";
import { ArrowDownLeft, ArrowUpRight, ChevronLeft, ChevronRight, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { busiest, dayStats, loadLevel, range, type DayStat } from "@/lib/calendar";
import type { BookingWithCar } from "@/lib/data";
import { cn } from "@/lib/utils";

const LEVEL = ["bg-load-0", "bg-load-1", "bg-load-2", "bg-load-3 text-primary-foreground", "bg-load-4 text-primary-foreground"];
const wk = { weekStartsOn: 1 as const };

export function CalendarTab({ bookings }: { bookings: BookingWithCar[] }) {
  const [view, setView] = useState<"week" | "month">("week");
  const [cursor, setCursor] = useState(() => new Date());
  const [open, setOpen] = useState<DayStat | null>(null);
  const today = startOfDay(new Date());

  const weekDays = range(startOfWeek(cursor, wk), 7);
  const monthStart = startOfMonth(cursor);
  const gridStart = startOfWeek(monthStart, wk);
  const gridDays = range(gridStart, differenceInCalendarDays(endOfWeek(endOfMonth(cursor), wk), gridStart) + 1);

  const shown = useMemo(() => dayStats(bookings, view === "week" ? weekDays : gridDays), [bookings, view, cursor]);
  const inPeriod = view === "week" ? shown : shown.filter((s) => isSameMonth(s.date, cursor));
  const top = busiest(inPeriod);
  const max = Math.max(0, ...inPeriod.map((s) => s.load));

  const thisWeek = busiest(dayStats(bookings, range(startOfWeek(today, wk), 7)));
  const thisMonth = busiest(dayStats(bookings, range(startOfMonth(today), endOfMonth(today).getDate())));
  const next7 = dayStats(bookings, range(today, 7)).filter((s) => s.load > 0).sort((a, b) => b.load - a.load).slice(0, 3);

  const move = (n: number) => setCursor((c) => (view === "week" ? addWeeks(c, n) : addMonths(c, n)));
  const label = view === "week"
    ? `${format(weekDays[0]!, "d MMM")} – ${format(weekDays[6]!, "d MMM yyyy")}`
    : format(cursor, "MMMM yyyy");

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-3">
        <Insight title="Busiest day this week" stat={thisWeek} />
        <Insight title="Busiest day this month" stat={thisMonth} />
        <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Next 7 days — prepare for</p>
          {next7.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">Nothing scheduled.</p>
          ) : (
            <ol className="mt-2 space-y-1.5">
              {next7.map((s) => (
                <li key={s.key}>
                  <button className="flex w-full items-center justify-between rounded-md px-1 py-1 text-left text-sm hover:bg-secondary" onClick={() => setOpen(s)}>
                    <span className="font-medium">{format(s.date, "EEE d MMM")}</span>
                    <span className="text-muted-foreground">{s.pickups.length} out · {s.returns.length} in</span>
                  </button>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-11 w-11" onClick={() => move(-1)} aria-label="Previous"><ChevronLeft /></Button>
          <Button variant="outline" size="tap" onClick={() => setCursor(new Date())}>Today</Button>
          <Button variant="outline" size="icon" className="h-11 w-11" onClick={() => move(1)} aria-label="Next"><ChevronRight /></Button>
          <h2 className="ml-2 text-lg font-semibold">{label}</h2>
        </div>
        <div className="inline-flex rounded-lg bg-secondary p-1">
          {(["week", "month"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} className={cn("h-9 rounded-md px-4 text-sm font-semibold capitalize", view === v ? "bg-card shadow-card" : "text-muted-foreground")}>
              {v === "week" ? "Weekly" : "Monthly"}
            </button>
          ))}
        </div>
      </div>

      {view === "week" ? (
        <div className="grid gap-2 sm:grid-cols-7">
          {shown.map((s) => (
            <button key={s.key} onClick={() => setOpen(s)} className={cn("relative flex items-center justify-between rounded-xl p-3 text-left sm:min-h-36 sm:flex-col sm:items-stretch", LEVEL[loadLevel(s.load, max)], isSameDay(s.date, today) && "ring-2 ring-accent")}>
              <div>
                <div className="text-xs font-semibold uppercase opacity-75">{format(s.date, "EEE")}</div>
                <div className="font-display text-2xl font-bold">{format(s.date, "d")}</div>
              </div>
              <div className="space-y-0.5 text-sm">
                {s.pickups.map((e) => <div key={e.bookingId} className="text-xs font-semibold leading-tight">{format(e.at, "HH:mm")} {e.client} · {e.location}</div>)}
                <div className="flex items-center gap-1"><ArrowUpRight className="h-3.5 w-3.5" />{s.pickups.length} out</div>
                <div className="flex items-center gap-1"><ArrowDownLeft className="h-3.5 w-3.5" />{s.returns.length} in</div>
                <div className="text-xs font-semibold opacity-80">Load {s.load}</div>
              </div>
              {top?.key === s.key && <BusyBadge />}
            </button>
          ))}
        </div>
      ) : (
        <div>
          <div className="mb-1 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted-foreground">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <div key={d}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {shown.map((s) => {
              const inMonth = isSameMonth(s.date, cursor);
              return (
                <button key={s.key} onClick={() => setOpen(s)} className={cn("relative flex aspect-square flex-col rounded-lg p-1.5 text-left sm:aspect-auto sm:min-h-24", inMonth ? LEVEL[loadLevel(s.load, max)] : "bg-transparent opacity-40", isSameDay(s.date, today) && "ring-2 ring-accent")}>
                  <span className="text-sm font-bold">{format(s.date, "d")}</span>
                  {s.load > 0 && (
                    <span className="mt-auto text-[11px] leading-tight sm:text-xs">
                      {s.pickups[0] && <span className="hidden truncate font-semibold sm:block">{s.pickups[0].client} · {s.pickups[0].location}</span>}<span className="hidden sm:inline">↑{s.pickups.length} ↓{s.returns.length} · </span>{s.load}
                    </span>
                  )}
                  {inMonth && top?.key === s.key && <BusyBadge compact />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        Quiet {LEVEL.map((c, i) => <span key={i} className={cn("h-3 w-6 rounded", c)} />)} Busy
      </div>

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{open && format(open.date, "EEEE d MMMM")}</DialogTitle></DialogHeader>
          {open && open.load === 0 && <p className="text-sm text-muted-foreground">No pickups or returns.</p>}
          <ul className="space-y-2">
            {open && [...open.pickups, ...open.returns].sort((a, b) => a.at.getTime() - b.at.getTime()).map((e) => (
              <li key={e.kind + e.bookingId} className="flex items-center gap-3 rounded-xl border border-border p-3">
                <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold", e.kind === "pickup" ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground")}>
                  {e.kind === "pickup" ? "Pickup" : "Return"}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{format(e.at, "HH:mm")} · {e.car}</div>
                  <div className="text-sm text-muted-foreground">{e.client} · {e.kind === "pickup" ? `Pick up: ${e.location} · ` : ""}<a href={`tel:${e.phone}`} className="text-primary">{e.phone}</a></div>
                </div>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BusyBadge({ compact }: { compact?: boolean }) {
  return (
    <span className={cn("absolute right-1.5 top-1.5 inline-flex items-center gap-0.5 rounded-full bg-destructive font-bold text-destructive-foreground ring-2 ring-card", compact ? "px-1 py-0.5 text-[9px]" : "px-2 py-0.5 text-[10px]")}>
      <Flame className="h-3 w-3" />{!compact && "Busiest day"}
    </span>
  );
}

function Insight({ title, stat }: { title: string; stat: DayStat | null }) {
  return (
    <div className="rounded-2xl bg-busy p-4 text-busy-foreground shadow-card">
      <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{title}</p>
      {stat ? (
        <>
          <p className="mt-1 font-display text-xl font-bold">{format(stat.date, "EEEE d MMM")}</p>
          <p className="text-sm opacity-90">{stat.pickups.length} pickup{stat.pickups.length === 1 ? "" : "s"} + {stat.returns.length} return{stat.returns.length === 1 ? "" : "s"}</p>
        </>
      ) : (
        <p className="mt-1 text-sm opacity-90">No pickups or returns yet.</p>
      )}
    </div>
  );
}

export { addDays };
