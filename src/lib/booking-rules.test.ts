import { describe, expect, it } from "vitest";
import { bookingDailyPrice, currencyCode, currencyTotals, docNumberLabel, tierDailyPrice, locationLabel, locationProblem, rentalDays, rentalTotal, rangesOverlap } from "./booking-math";
import { fillTemplate, whatsappNumber, whatsappUrl } from "./whatsapp";
import { BUSINESS_PHONE } from "./brand";

describe("rental pricing", () => {
  it("labels the first invoice INV-1001", () => {
    expect(docNumberLabel(1001)).toBe("INV-1001");
  });
  it("allows one currency without requiring a second rate or conversion", () => {
    expect(currencyCode("EUR")).toBe("EUR");
    expect(currencyCode("Rs")).toBe("MUR");
    expect(rentalTotal(new Date("2026-11-10T10:00"), new Date("2026-11-12T10:00"), 40)).toBe(80);
  });
  it("keeps euro and rupee totals separate", () => {
    expect(currencyTotals([{ currency: "EUR", total_price: 80 }, { currency: "MUR", total_price: 3000 }, { currency: "EUR", total_price: 40 }])).toEqual([{ currency: "EUR", total: 120 }, { currency: "MUR", total: 3000 }]);
  });
  const car = { daily_price: 2000, price_ranges: [{ min: 1, max: 2, price: 1800 }, { min: 5, max: 7, price: 1400 }, { min: 10, max: null, price: 1000 }] };
  it("applies the 1–2 day range", () => { expect(tierDailyPrice(car, 1)).toBe(1800); expect(tierDailyPrice(car, 2) * 2).toBe(3600); });
  it("applies the 5–7 day range at both ends", () => { expect(tierDailyPrice(car, 5)).toBe(1400); expect(tierDailyPrice(car, 7) * 7).toBe(9800); });
  it("uses the standard rate for days no range covers", () => { expect(tierDailyPrice(car, 3)).toBe(2000); expect(tierDailyPrice(car, 8)).toBe(2000); });
  it("applies an open-ended range", () => { expect(tierDailyPrice(car, 30) * 30).toBe(30000); });
  it("uses the car rate when no owner override was supplied", () => {
    expect(bookingDailyPrice(1200, null)).toBe(1200);
    expect(rentalTotal(new Date("2026-11-10T10:00"), new Date("2026-11-24T10:00"), bookingDailyPrice(1200))).toBe(16800);
  });
  it("preserves an explicit owner rate including zero", () => {
    expect(bookingDailyPrice(1200, 900)).toBe(900);
    expect(bookingDailyPrice(1200, 0)).toBe(0);
  });
  it("counts started 24h periods as days", () => {
    expect(rentalDays(new Date("2026-11-10T09:00"), new Date("2026-11-13T09:00"))).toBe(3);
    expect(rentalDays(new Date("2026-11-10T09:00"), new Date("2026-11-13T10:00"))).toBe(4);
  });
  it("charges at least one day", () => {
    expect(rentalDays(new Date("2026-11-10T09:00"), new Date("2026-11-10T12:00"))).toBe(1);
  });
  it("total is days times price per day", () => {
    expect(rentalTotal(new Date("2026-11-10T09:00"), new Date("2026-11-13T09:00"), 1500)).toBe(4500);
  });
  it("detects overlapping bookings but allows back-to-back", () => {
    const a = [new Date("2026-11-10"), new Date("2026-11-13")] as const;
    expect(rangesOverlap(a[0], a[1], new Date("2026-11-12"), new Date("2026-11-15"))).toBe(true);
    expect(rangesOverlap(a[0], a[1], new Date("2026-11-13"), new Date("2026-11-15"))).toBe(false);
  });
});

describe("pickup location", () => {
  it("requires a choice between airport and other", () => {
    expect(locationProblem("", "")).toBe("Please choose where you want to pick up the car.");
    expect(locationProblem("airport", "")).toBeNull();
  });
  it("requires a place when other is chosen", () => {
    expect(locationProblem("other", "   ")).toBe("Please say where the car will be picked up.");
    expect(locationProblem("other", "Hotel Labaya, Flic en Flac")).toBeNull();
  });
  it("labels the chosen point", () => {
    expect(locationLabel("airport", null)).toBe("SSR International Airport");
    expect(locationLabel("other", "  Hotel Labaya ")).toBe("Hotel Labaya");
    expect(locationLabel(null, null)).toBe("Not given");
  });
});

describe("whatsapp", () => {
  it("contacts the new company at its supplied international number", () => {
    expect(whatsappUrl(BUSINESS_PHONE, "Hello")).toBe("https://wa.me/23059224353?text=Hello");
  });
  it("strips +, spaces and leading 00 from the phone", () => {
    expect(whatsappNumber("+230 5712 3456")).toBe("23057123456");
    expect(whatsappNumber("00230-5712-3456")).toBe("23057123456");
  });
  it("fills every placeholder", () => {
    const msg = fillTemplate("Hi {name}: {car} {from}-{to} {total} {link}", {
      name: "Ana", car: "Swift", from: "1 Dec", to: "3 Dec", total: "Rs 3,000.00", link: "https://x/y.pdf",
    });
    expect(msg).toBe("Hi Ana: Swift 1 Dec-3 Dec Rs 3,000.00 https://x/y.pdf");
  });
  it("builds a wa.me link with the encoded message", () => {
    expect(whatsappUrl("+230 5712 3456", "Hello & bye")).toBe("https://wa.me/23057123456?text=Hello%20%26%20bye");
  });
});
