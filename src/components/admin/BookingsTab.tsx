import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Layers, Loader2, Search, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { friendlyError, qk, type BookingWithCar, type Car, type Settings } from "@/lib/data";
import { docNumberLabel } from "@/lib/booking-math";
import { deleteBookingDocuments } from "@/lib/documents";
import { BookingCard } from "./BookingCard";

export function BookingsTab({ bookings, cars, settings }: { bookings: BookingWithCar[]; cars: Car[]; settings: Settings }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [car, setCar] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [openPiles, setOpenPiles] = useState<Record<string, boolean>>({});
  const [deleting, setDeleting] = useState<string | null>(null);
  const qc = useQueryClient();

  async function deletePile(value: string, pile: BookingWithCar[]) {
    if (!confirm(`Permanently delete all ${pile.length} ${value} booking${pile.length === 1 ? "" : "s"}? This cannot be undone.`)) return;
    setDeleting(value);
    try {
      const ids = pile.map((b) => b.id);
      await deleteBookingDocuments(ids);
      const { error } = await supabase.from("bookings").delete().in("id", ids);
      if (error) throw error;
      toast.success(`Deleted ${pile.length} booking${pile.length === 1 ? "" : "s"}`);
      await qc.invalidateQueries({ queryKey: qk.bookings });
    } catch (e) {
      toast.error(friendlyError(e));
    } finally {
      setDeleting(null);
    }
  }

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return bookings.filter((b) => {
      if (status !== "all" && b.status !== status) return false;
      if (car !== "all" && b.car_id !== car) return false;
      if (from && new Date(b.return_at) < new Date(`${from}T00:00`)) return false;
      if (to && new Date(b.pickup_at) > new Date(`${to}T23:59`)) return false;
      if (!s) return true;
      return [b.full_name, b.phone, b.email, b.cars?.name, b.cars?.plate, docNumberLabel(b.doc_number)]
        .some((v) => v?.toLowerCase().includes(s));
    });
  }, [bookings, q, status, car, from, to]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input className="h-11 pl-9" placeholder="Name, phone, plate, INV-…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
          <SelectContent>
            {["all", "pending", "approved", "rejected", "cancelled"].map((s) => (
              <SelectItem key={s} value={s} className="capitalize">{s === "all" ? "All statuses" : s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={car} onValueChange={setCar}>
          <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All cars</SelectItem>
            {cars.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2"><Label className="w-10 text-xs">From</Label><Input type="date" className="h-11" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
        <div className="flex items-center gap-2"><Label className="w-10 text-xs">To</Label><Input type="date" className="h-11" value={to} onChange={(e) => setTo(e.target.value)} /></div>
      </div>
      <p className="text-sm text-muted-foreground">{list.length} booking{list.length === 1 ? "" : "s"}</p>
      <div className="space-y-3">
        {list.filter((b) => b.status !== "rejected" && b.status !== "cancelled").map((b) => <BookingCard key={b.id} booking={b} settings={settings} cars={cars} />)}
      </div>
      {([['rejected', 'Rejected requests'], ['cancelled', 'Cancelled bookings']] as const).map(([value, label]) => {
        const pile = list.filter((b) => b.status === value);
        if (pile.length === 0) return null;
        const open = openPiles[value] === true;
        return (
          <section key={value} className="space-y-3">
            <div className="flex items-stretch gap-2">
              <Button variant="outline" size="tap" className="h-auto min-w-0 flex-1 justify-between gap-3 py-4" aria-expanded={open} aria-controls={`booking-pile-${value}`} onClick={() => setOpenPiles((current) => ({ ...current, [value]: !current[value] }))}>
                <span className="flex min-w-0 items-center gap-2 text-left"><Layers className="shrink-0" /><span className="whitespace-normal">{label} ({pile.length})</span></span>
                <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">{open ? 'Close' : 'Tap to open'}{open ? <ChevronUp /> : <ChevronDown />}</span>
              </Button>
              <Button variant="destructive" size="tap" className="h-auto shrink-0 px-4" disabled={deleting !== null} onClick={() => deletePile(value, pile)}>
                {deleting === value ? <Loader2 className="animate-spin" /> : <Trash2 />}
                Delete all
              </Button>
            </div>
            <div id={`booking-pile-${value}`} className="space-y-3" hidden={!open}>
              {open && pile.map((b) => <BookingCard key={b.id} booking={b} settings={settings} cars={cars} />)}
            </div>
          </section>
        );
      })}
    </div>
  );
}
