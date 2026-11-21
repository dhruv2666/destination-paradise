import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Check, Loader2, Pencil, Trash2, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { friendlyError, qk, type Booking, type BookingWithCar, type Car, type Settings } from "@/lib/data";
import { docNumberLabel, formatMoney, locationLabel } from "@/lib/booking-math";
import { deleteBookingDocuments, generateDocument } from "@/lib/documents";
import { DocumentActions } from "./DocumentActions";
import { BookingDialog } from "./BookingDialog";
import { StatusBadge } from "./StatusBadge";
import { Badge } from "@/components/ui/badge";
import { readExtras } from "@/lib/booking-extras";
import { IdDocumentsPanel } from "./IdDocumentsPanel";

export function BookingCard({ booking, settings, cars }: { booking: BookingWithCar; settings: Settings; cars: Car[] }) {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const fmt = (s: string) => format(new Date(s), "EEE d MMM, HH:mm");
  const refresh = () => qc.invalidateQueries({ queryKey: qk.bookings });

  async function setStatus(status: string, extra: Partial<Booking> = {}) {
    setBusy(true);
    try {
      const { data, error } = await supabase.from("bookings").update({ status, ...extra }).eq("id", booking.id).select("*").single();
      if (error) throw error;
      if (status === "approved") {
        await generateDocument(data, booking.cars, settings);
        toast.success("Approved — document generated. You can now send it on WhatsApp.");
      } else toast.success(`Booking ${status}`);
      await refresh();
    } catch (e) {
      toast.error(friendlyError(e));
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm(`Permanently delete ${docNumberLabel(booking.doc_number)} (${booking.full_name})? Its document will be removed too. This cannot be undone.`)) return;
    setBusy(true);
    try {
      await deleteBookingDocuments([booking.id]);
      const { error } = await supabase.from("bookings").delete().eq("id", booking.id);
      if (error) throw error;
      toast.success("Booking deleted");
      await refresh();
    } catch (e) {
      toast.error(friendlyError(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-card sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold">{booking.full_name}</h3>
            <StatusBadge status={booking.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {docNumberLabel(booking.doc_number)} · {booking.source === "admin" ? "Added by you" : "Online request"}
          </p>
        </div>
        <div className="text-right">
          <div className="font-display text-xl font-bold">{formatMoney(booking.total_price, booking.currency ?? settings.currency)}</div>
          <div className="text-xs text-muted-foreground">
            {booking.days} day{booking.days > 1 ? "s" : ""} × {formatMoney(booking.price_per_day, booking.currency ?? settings.currency)}
            {Number(booking.deposit) > 0 && ` · deposit ${formatMoney(booking.deposit, booking.currency ?? settings.currency)}`}
          </div>
        </div>
      </div>

      <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        <Row k="Car" v={`${booking.cars?.name ?? "—"} ${booking.cars?.plate ? `(${booking.cars.plate})` : ""}`} />
        <Row k="Phone" v={<a className="text-primary underline-offset-2 hover:underline" href={`tel:${booking.phone}`}>{booking.phone}</a>} />
        <Row k="Pickup" v={fmt(booking.pickup_at)} />
        <Row k="Return" v={fmt(booking.return_at)} />
        <Row k="Pickup point" v={locationLabel(booking.pickup_location, booking.location_details)} />
        {booking.email && <Row k="Email" v={booking.email} />}
        {booking.id_number && <Row k="ID / passport" v={booking.id_number} />}
        {booking.licence_number && <Row k="Licence" v={booking.licence_number} />}
        {booking.notes && <Row k="Notes" v={booking.notes} />}
        {booking.rejection_reason && <Row k="Reason" v={booking.rejection_reason} />}
      </dl>

      {readExtras(booking.extras).length > 0 && <div className="mt-3 flex flex-wrap gap-2" aria-label="Requested extras">
        {readExtras(booking.extras).map((extra) => <Badge key={extra} variant="secondary">{extra}</Badge>)}
      </div>}

      <div className="mt-4 space-y-3 border-t border-border pt-4">
        <div className="flex flex-wrap gap-2">
          {booking.status === "pending" && (
            <>
              <Button variant="success" size="tap" onClick={() => setStatus("approved")} disabled={busy}>
                {busy ? <Loader2 className="animate-spin" /> : <Check />} Approve
              </Button>
              <Button variant="outline" size="tap" onClick={() => setRejectOpen(true)} disabled={busy}>
                <X /> Reject
              </Button>
            </>
          )}
          <Button variant="ghost" size="tap" onClick={() => setEditOpen(true)}>
            <Pencil /> Edit
          </Button>
          {booking.status === "approved" && (
            <Button variant="ghost" size="tap" onClick={() => confirm("Cancel this booking?") && setStatus("cancelled")} disabled={busy}>
              Cancel booking
            </Button>
          )}
          <Button variant="ghost" size="tap" className="text-destructive" onClick={remove} disabled={busy}>
            <Trash2 /> Delete
          </Button>
        </div>
        <IdDocumentsPanel bookingId={booking.id} />
        <DocumentActions booking={booking} settings={settings} />
        {booking.pdf_generated_at && (
          <p className="text-xs text-muted-foreground">Document last generated {format(new Date(booking.pdf_generated_at), "d MMM yyyy, HH:mm")}</p>
        )}
      </div>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject this request?</DialogTitle></DialogHeader>
          <Textarea placeholder="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} />
          <DialogFooter>
            <Button variant="destructive" onClick={() => { setRejectOpen(false); setStatus("rejected", { rejection_reason: reason || null }); }}>
              Reject request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BookingDialog open={editOpen} onOpenChange={setEditOpen} cars={cars} settings={settings} booking={booking} />
    </article>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <dt className="w-24 shrink-0 text-muted-foreground">{k}</dt>
      <dd className="min-w-0 break-words font-medium">{v}</dd>
    </div>
  );
}
