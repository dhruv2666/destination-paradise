export const bookingExtras = ["Baby seat", "Portable WiFi", "Additional driver", "Full insurance"] as const;
export type BookingExtra = typeof bookingExtras[number];
export function readExtras(value: unknown): BookingExtra[] {
  return bookingExtras.filter((extra) => Array.isArray(value) && value.includes(extra));
}