import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarDays, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RentalDateField } from "@/components/DateSearch";
import { supabase } from "@/integrations/supabase/client";
import { fetchBookings, friendlyError, qk, type Car } from "@/lib/data";
import { dateRangeProblem, mauritiusMidnight } from "@/lib/availability";
import { mauritiusDate } from "@/lib/holidays";

export function CarSchedule({ car, onClose }: { car: Car; onClose: () => void }) {
  const qc = useQueryClient();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [reason, setReason] = useState("maintenance");
  const [saving, setSaving] = useState(false);
  const [day, setDay] = useState<Date>();
  const bookings = useQuery({ queryKey: qk.bookings, queryFn: fetchBookings });
  const blocks = useQuery({ queryKey: ["car-blocks", car.id], queryFn: async () => {
    const { data, error } = await supabase.from("car_date_blocks").select("*").eq("car_id", car.id).order("start_at");
    if (error) throw error;
    return data;
  } });
  const rows = (bookings.data ?? []).filter((b) => b.car_id === car.id && ["approved", "confirmed", "pending"].includes(b.status));
  const covers = (date: Date, start: string, end: string) => {
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    const a = Date.parse(mauritiusMidnight(local));
    return Date.parse(start) < a + 86400000 && Date.parse(end) > a;
  };
  async function refresh() {
    await Promise.all([qc.invalidateQueries({ queryKey: ["car-blocks", car.id] }), qc.invalidateQueries({ queryKey: ["available-cars"] }), qc.invalidateQueries({ queryKey: ["nearby-dates"] })]);
  }
  async function save() {
    const problem = dateRangeProblem(from, to);
    if (problem) return void toast.error(problem);
    setSaving(true);
    try {
      const { error } = await supabase.from("car_date_blocks").insert({ car_id: car.id, start_at: mauritiusMidnight(from), end_at: mauritiusMidnight(to), reason });
      if (error) throw error;
      await refresh(); setFrom(""); setTo(""); toast.success("Dates blocked");
    } catch (e) { toast.error(friendlyError(e)); } finally { setSaving(false); }
  }
  async function remove(id: string) {
    if (!window.confirm("Remove this date block?")) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("car_date_blocks").delete().eq("id", id).eq("car_id", car.id);
      if (error) throw error;
      await refresh(); toast.success("Date block removed");
    } catch (e) { toast.error(friendlyError(e)); } finally { setSaving(false); }
  }
  return <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
    <DialogHeader><DialogTitle>{car.name} · Bookings & blocked dates</DialogTitle></DialogHeader>
    {(blocks.isError || bookings.isError) && <p role="alert" className="text-destructive">Could not load this car’s schedule.</p>}
    <div className="grid gap-4 sm:grid-cols-2">
      <div><Calendar mode="single" selected={day} onSelect={setDay} className="pointer-events-auto mx-auto" modifiers={{ booked: (d) => rows.some((b) => b.status !== "pending" && covers(d, b.pickup_at, b.return_at)), blocked: (d) => (blocks.data ?? []).some((b) => covers(d, b.start_at, b.end_at)), pending: (d) => rows.some((b) => b.status === "pending" && covers(d, b.pickup_at, b.return_at)) }} modifiersClassNames={{ booked: "bg-primary text-primary-foreground", blocked: "bg-destructive text-destructive-foreground", pending: "border border-primary" }} />
        <div className="flex flex-wrap gap-3 text-xs"><span className="text-primary">● Approved</span><span className="text-destructive">● Blocked</span><span>○ Pending</span></div>
      </div>
      <div className="space-y-3"><h3 className="font-semibold">Block dates</h3><RentalDateField label="Block from" value={from} onChange={setFrom} min={mauritiusDate()} /><RentalDateField label="Block until" value={to} onChange={setTo} min={from || mauritiusDate()} /><Select value={reason} onValueChange={setReason}><SelectTrigger aria-label="Block reason"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="maintenance">Maintenance</SelectItem><SelectItem value="off-hire">Off-hire</SelectItem></SelectContent></Select><Button onClick={save} disabled={saving || blocks.isLoading || bookings.isLoading} className="w-full"><CalendarDays />Block dates</Button></div>
    </div>
    <section className="space-y-2"><h3 className="font-semibold">{day ? `Schedule · ${day.toLocaleDateString("en-GB")}` : "Bookings"}</h3>{rows.filter((b) => !day || covers(day, b.pickup_at, b.return_at)).map((b) => <p key={b.id} className="border-b border-border py-2 text-sm">{b.full_name} · {b.status}<br />{mauritiusDate(new Date(b.pickup_at))} – {mauritiusDate(new Date(b.return_at))}</p>)}{rows.length === 0 && <p className="text-sm text-muted-foreground">No bookings for this car.</p>}</section>
    <section className="space-y-2"><h3 className="font-semibold">Blocked dates</h3>{(blocks.data ?? []).map((b) => <div key={b.id} className="flex items-center justify-between gap-2 border-b border-border py-2"><p className="text-sm">{mauritiusDate(new Date(b.start_at))} – {mauritiusDate(new Date(b.end_at))}<br />{b.reason}</p><Button size="icon" variant="ghost" aria-label="Remove date block" disabled={saving} onClick={() => remove(b.id)}><Trash2 /></Button></div>)}{blocks.data?.length === 0 && <p className="text-sm text-muted-foreground">No blocked dates.</p>}</section>
  </DialogContent></Dialog>;
}