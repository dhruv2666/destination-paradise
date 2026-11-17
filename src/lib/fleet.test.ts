import { describe, expect, it } from "vitest";
import { emptyFleet, fleetAlerts, resetFleetSchedule, sortedFleet } from "./fleet";
import { readExtras } from "./booking-extras";
import type { Car } from "./data";

describe("fleet alert rules", () => {
  const today = "2026-11-17";
  it("includes 15 days but not 16 days", () => {
    expect(fleetAlerts({ insurance_expiry: "2026-12-02" }, today)[0]?.remaining).toBe(15);
    expect(fleetAlerts({ insurance_expiry: "2026-12-03" }, today)).toEqual([]);
  });
  it("marks past dates red and calculates days overdue", () => {
    expect(fleetAlerts({ road_tax_expiry: "2026-11-15" }, today)[0]).toMatchObject({ severity: "overdue", remaining: -2 });
  });
  it("marks today as a warning, not overdue", () => {
    expect(fleetAlerts({ fitness_expiry: today }, today)[0]).toMatchObject({ severity: "warning", remaining: 0 });
  });
  it("warns at 1000 km and not at 1001 km", () => {
    expect(fleetAlerts({ mileage: 9000, service_due_km: 10000 }, today)[0]?.remaining).toBe(1000);
    expect(fleetAlerts({ mileage: 8999, service_due_km: 10000 }, today)).toEqual([]);
  });
  it("reports exceeded mileage and handles an exact target", () => {
    expect(fleetAlerts({ mileage: 10010, service_due_km: 10000 }, today)[0]).toMatchObject({ severity: "overdue", remaining: -10 });
    expect(fleetAlerts({ mileage: 10000, service_due_km: 10000 }, today)[0]?.remaining).toBe(0);
  });
  it("does not warn about missing dates or mileage", () => {
    expect(fleetAlerts({ ...emptyFleet, service_due_km: 10000 }, today)).toEqual([]);
  });
  it("evaluates every compliance date", () => {
    expect(fleetAlerts({ service_due_date: today, insurance_expiry: today, road_tax_expiry: today, fitness_expiry: today }, today)).toHaveLength(4);
  });
  it("sorts active alerts above clear cars", () => {
    const cars = [{ ...emptyFleet, id: "clear", name: "A" }, { ...emptyFleet, id: "soon", name: "B", insurance_expiry: today }, { ...emptyFleet, id: "late", name: "C", fitness_expiry: "2026-11-16" }] as Car[];
    expect(sortedFleet(cars, today).map((car) => car.id)).toEqual(["late", "soon", "clear"]);
  });
  it("reset all clears schedules but preserves odometer and notes", () => {
    expect(resetFleetSchedule({ mileage: 12345, service_due_km: 14000, service_due_date: today, insurance_expiry: today, road_tax_expiry: today, fitness_expiry: today, fleet_notes: "Spare tyre" })).toEqual({ ...emptyFleet, mileage: 12345, fleet_notes: "Spare tyre" });
  });
});
describe("booking extras", () => {
  it("supports exactly the four requested add-ons", () => {
    expect(readExtras(["GPS", "Baby seat", "Booster seat", "Additional driver", "unknown", "GPS"])).toEqual(["Baby seat", "Booster seat", "Additional driver", "GPS"]);
    expect(readExtras(null)).toEqual([]);
  });
});