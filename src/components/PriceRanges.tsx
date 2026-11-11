import { formatMoney, matchRange, rangeLabel, readRanges, type TierPrices } from "@/lib/booking-math";
import { cn } from "@/lib/utils";

/** Read-only list of a car's daily rates; highlights the range that matches `days`. */
export function PriceRangesList({ car, currency, days = 0, className }: { car: TierPrices; currency: string; days?: number; className?: string }) {
  const ranges = readRanges(car.price_ranges);
  const activeIdx = days > 0 && matchRange(car, days) ? ranges.findIndex((r) => r.min <= days && (r.max == null || r.max >= days)) : -1;
  const usingStandard = days > 0 && activeIdx < 0;
  return (
    <ul className={cn("space-y-1 text-sm", className)}>
      <li className={cn("flex justify-between gap-3 rounded-md px-2 py-1", usingStandard && "bg-primary/15 font-semibold")}>
        <span className="text-muted-foreground">Standard daily rate</span>
        <span className="font-semibold">{formatMoney(car.daily_price, currency)} / day</span>
      </li>
      {ranges.map((r, i) => (
        <li key={i} className={cn("flex justify-between gap-3 rounded-md px-2 py-1", activeIdx === i && "bg-primary/15 font-semibold")}>
          <span className="text-muted-foreground">{rangeLabel(r)}</span>
          <span className="font-semibold">{formatMoney(r.price, currency)} / day</span>
        </li>
      ))}
    </ul>
  );
}
