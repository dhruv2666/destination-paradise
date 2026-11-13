// Pure booking helpers shared by the UI. Must match the database trigger
// (bookings_prepare): days = ceil(hours / 24), minimum 1.

export function rentalDays(pickup: Date, ret: Date): number {
  const ms = ret.getTime() - pickup.getTime();
  if (!(ms > 0)) return 0;
  return Math.max(1, Math.ceil(ms / 86_400_000));
}

export function rentalTotal(pickup: Date, ret: Date, pricePerDay: number): number {
  return rentalDays(pickup, ret) * pricePerDay;
}

/** An omitted rate uses the car rate; an explicit owner override is preserved. */
export function bookingDailyPrice(carPrice: number, override?: number | null): number {
  return override ?? carPrice;
}

export type PriceRange = { min: number; max: number | null; price: number };
export type TierPrices = { daily_price: number; price_ranges?: unknown };

export function currencyCode(value?: string | null): "MUR" | "EUR" {
  return value === "EUR" || value === "€" ? "EUR" : "MUR";
}

export function currencyLabel(value?: string | null): string {
  return currencyCode(value) === "EUR" ? "€" : "Rs";
}

export function currencyTotals(rows: { currency: string | null; total_price: number }[]): { currency: string; total: number }[] {
  const totals = new Map<string, number>();
  for (const row of rows) {
    const code = currencyCode(row.currency);
    totals.set(code, (totals.get(code) ?? 0) + Number(row.total_price));
  }
  return Array.from(totals, ([currency, total]) => ({ currency, total }));
}

export function readRanges(v: unknown): PriceRange[] {
  if (!Array.isArray(v)) return [];
  return v.filter((r) => r && typeof r.min === "number" && typeof r.price === "number")
    .map((r) => ({ min: r.min, max: typeof r.max === "number" ? r.max : null, price: r.price }));
}

/** Mirrors car_range_price: first range containing `days`, else the standard daily rate. */
export function matchRange(car: TierPrices, days: number): PriceRange | null {
  return readRanges(car.price_ranges).find((r) => r.min <= days && (r.max == null || r.max >= days)) ?? null;
}

export function tierDailyPrice(car: TierPrices, days: number): number {
  return matchRange(car, days)?.price ?? car.daily_price;
}

export function rangeLabel(r: PriceRange): string {
  if (r.max == null) return `${r.min}+ days`;
  if (r.max === r.min) return `${r.min} day${r.min > 1 ? "s" : ""}`;
  return `${r.min}–${r.max} days`;
}

export function lowestRate(car: TierPrices): number {
  return Math.min(car.daily_price, ...readRanges(car.price_ranges).map((r) => r.price));
}

export function rangesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && aEnd > bStart;
}

export function formatMoney(amount: number, currency: string): string {
  const n = Number(amount || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${currencyLabel(currency)} ${n}`;
}

export function docNumberLabel(n: number): string {
  return `INV-${n}`;
}


/** Mirrors the bookings_prepare trigger: the client must pick airport or other, and "other" needs a place. */
export function locationProblem(loc: string, details: string): string | null {
  if (loc !== "airport" && loc !== "other") return "Please choose where you want to pick up the car.";
  if (loc === "other" && !details.trim()) return "Please say where the car will be picked up.";
  return null;
}

export function locationLabel(loc: string | null | undefined, details: string | null | undefined): string {
  if (loc === "airport") return "SSR International Airport";
  if (loc === "other") return details?.trim() || "Other";
  return "Not given";
}
