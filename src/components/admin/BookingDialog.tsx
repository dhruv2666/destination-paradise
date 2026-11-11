import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookingForm } from "@/components/BookingForm";
import { qk, type Booking, type BookingWithCar, type Car, type Settings } from "@/lib/data";
import { generateDocument } from "@/lib/documents";

/** Create (no booking) or edit a booking. Saving regenerates the document under the same number. */
export function BookingDialog({
  open,
  onOpenChange,
  cars,
  settings,
  booking,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  cars: Car[];
  settings: Settings;
  booking?: BookingWithCar;
}) {
  const qc = useQueryClient();

  async function onSaved(saved: Booking | null) {
    if (!saved) return;
    onOpenChange(false);
    const car = cars.find((c) => c.id === saved.car_id) ?? null;
    const shouldGenerate = booking ? Boolean(booking.pdf_path) : saved.status === "approved";
    try {
      if (shouldGenerate) await generateDocument(saved, car, settings);
      toast.success(
        booking
          ? shouldGenerate
            ? "Saved — document updated (same number)."
            : "Booking saved."
          : shouldGenerate
            ? "Booking created and document generated."
            : "Booking created.",
      );
    } catch (e) {
      toast.error(`Saved, but the document failed: ${(e as Error).message}`);
    }
    qc.invalidateQueries({ queryKey: qk.bookings });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{booking ? "Edit booking" : "New booking"}</DialogTitle>
        </DialogHeader>
        {open && (
          <BookingForm
            key={booking?.id ?? "new"}
            mode="admin"
            cars={cars}
            currency={settings.currency}
            initial={booking}
            onSaved={onSaved}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
