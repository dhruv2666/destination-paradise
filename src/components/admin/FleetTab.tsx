import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Loader2, Pencil, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllCars, friendlyError, type Car } from "@/lib/data";
import { fleetAlerts, fleetDateFields, fleetNumberFields, resetFleetSchedule, sortedFleet, type FleetFields } from "@/lib/fleet";
import { cn } from "@/lib/utils";

export function FleetAlertBadges({ car }: { car: Car }) {
  return <div className="flex flex-wrap gap-2">{fleetAlerts(car).map((alert) => (
    <Badge key={alert.key} variant={alert.severity === "overdue" ? "destructive" : "outline"} className={cn("gap-1 whitespace-normal", alert.severity === "warning" && "border-transparent bg-warning text-warning-foreground")}><AlertTriangle className="h-3 w-3 shrink-0" />{alert.reason}</Badge>
  ))}</div>;
}

export function FleetTab({ cars }: { cars: Car[] }) {
  const [editing, setEditing] = useState<Car | null>(null);
  return <section className="space-y-4">
    <h1 className="font-display text-xl font-bold">Fleet management</h1>
    {cars.length === 0 && <p className="text-muted-foreground">No cars yet.</p>}
    <div className="grid gap-3 md:grid-cols-2">
      {sortedFleet(cars).map((car) => <article key={car.id} className="min-w-0 space-y-4 rounded-lg border border-border bg-card p-4 shadow-card">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0"><h2 className="break-words font-semibold">{car.name}</h2><p className="text-sm text-muted-foreground">{car.plate || "No plate"}{!car.active && " · Inactive"}</p></div>
          <Button variant="ghost" size="icon" aria-label={`Edit fleet ${car.name}`} onClick={() => setEditing(car)}><Pencil /></Button>
        </div>
        <FleetAlertBadges car={car} />
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          {fleetNumberFields.map(({ key, label }) => <div key={key}><dt className="text-muted-foreground">{label}</dt><dd className="font-medium">{car[key] == null ? "—" : `${car[key].toLocaleString()} km`}</dd></div>)}
          {fleetDateFields.map(({ key, label }) => <div key={key}><dt className="text-muted-foreground">{label}</dt><dd className="font-medium">{car[key] ? new Date(`${car[key]}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}</dd></div>)}
        </dl>
        {car.fleet_notes && <p className="whitespace-pre-wrap break-words border-t border-border pt-3 text-sm">{car.fleet_notes}</p>}
      </article>)}
    </div>
    {editing && <FleetEditor key={editing.id} car={editing} onClose={() => setEditing(null)} />}
  </section>;
}

function FleetEditor({ car, onClose }: { car: Car; onClose: () => void }) {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<FleetFields>({ mileage: car.mileage, service_due_km: car.service_due_km, service_due_date: car.service_due_date, insurance_expiry: car.insurance_expiry, road_tax_expiry: car.road_tax_expiry, fitness_expiry: car.fitness_expiry, fleet_notes: car.fleet_notes });
  const [saving, setSaving] = useState(false);
  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (fleetNumberFields.some(({ key }) => draft[key] != null && (!Number.isInteger(draft[key]) || Number(draft[key]) < 0 || Number(draft[key]) > 2147483647))) return void toast.error("Mileage must be a valid non-negative whole number.");
    setSaving(true);
    try {
      const { error } = await supabase.from("cars").update(draft).eq("id", car.id).select("id").single();
      if (error) throw error;
      const rows = await fetchAllCars();
      const stored = rows.find((row) => row.id === car.id);
      if (!stored || Object.keys(draft).some((key) => stored[key as keyof FleetFields] !== draft[key as keyof FleetFields])) throw new Error("The fleet changes could not be verified. Please try again.");
      await qc.invalidateQueries({ queryKey: ["cars"] });
      toast.success("Fleet details saved");
      onClose();
    } catch (error) { toast.error(friendlyError(error)); }
    finally { setSaving(false); }
  }
  return <Dialog open onOpenChange={(open) => { if (!open && !saving) onClose(); }}><DialogContent className="max-h-[92vh] overflow-y-auto">
    <DialogHeader><DialogTitle>Fleet · {car.name}</DialogTitle></DialogHeader>
    <form onSubmit={save} className="space-y-4">
      <fieldset disabled={saving} className="space-y-4">
        {fleetNumberFields.map(({ key, label }) => <div key={key} className="space-y-1.5">
          <Label htmlFor={`fleet-${key}`}>{label}</Label><div className="flex min-w-0 gap-2"><Input id={`fleet-${key}`} type="number" min="0" max="2147483647" step="1" className="h-11 min-w-0" value={draft[key] ?? ""} onChange={(e) => setDraft((current) => ({ ...current, [key]: e.target.value === "" ? null : Number(e.target.value) }))} /><Button variant="outline" type="button" aria-label={`Reset ${label}`} onClick={() => setDraft((current) => ({ ...current, [key]: null }))}><RotateCcw />Reset</Button></div>
        </div>)}
        {fleetDateFields.map(({ key, label }) => <div key={key} className="space-y-1.5">
          <Label htmlFor={`fleet-${key}`}>{label}</Label><div className="flex min-w-0 gap-2"><Input id={`fleet-${key}`} type="date" className="h-11 min-w-0 max-w-full" value={draft[key] ?? ""} onChange={(e) => setDraft((current) => ({ ...current, [key]: e.target.value || null }))} /><Button variant="outline" type="button" aria-label={`Reset ${label}`} onClick={() => setDraft((current) => ({ ...current, [key]: null }))}><RotateCcw />Reset</Button></div>
        </div>)}
        <div className="space-y-1.5"><Label htmlFor="fleet-notes">Fleet notes</Label><Textarea id="fleet-notes" value={draft.fleet_notes ?? ""} onChange={(e) => setDraft((current) => ({ ...current, fleet_notes: e.target.value || null }))} /></div>
        <Button type="button" variant="outline" className="w-full" onClick={() => { if (confirm("Clear all service targets and compliance dates? Current mileage and notes will be kept. Changes apply only when you save.")) setDraft(resetFleetSchedule); }}><RotateCcw />Reset all</Button>
      </fieldset>
      <Button type="submit" className="w-full" size="lg" disabled={saving}>{saving ? <Loader2 className="animate-spin" /> : <Save />}Save</Button>
    </form>
  </DialogContent></Dialog>;
}