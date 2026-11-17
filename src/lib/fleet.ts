import type { Car } from "./data";
import { mauritiusDate } from "./holidays";

export const fleetDateFields = [
  { key: "service_due_date", label: "Service date" },
  { key: "insurance_expiry", label: "Insurance expiry" },
  { key: "road_tax_expiry", label: "Road tax expiry" },
  { key: "fitness_expiry", label: "Fitness expiry" },
] as const;
export const fleetNumberFields = [
  { key: "mileage", label: "Current mileage (km)" },
  { key: "service_due_km", label: "Service due (km)" },
] as const;
export type FleetFields = Pick<Car, "mileage" | "service_due_km" | "service_due_date" | "insurance_expiry" | "road_tax_expiry" | "fitness_expiry" | "fleet_notes">;
export const emptyFleet: FleetFields = { mileage: null, service_due_km: null, service_due_date: null, insurance_expiry: null, road_tax_expiry: null, fitness_expiry: null, fleet_notes: null };
export type FleetAlert = { key: string; severity: "overdue" | "warning"; reason: string; remaining: number; unit: "days" | "km" };

export function fleetAlerts(car: Partial<FleetFields>, today = mauritiusDate()): FleetAlert[] {
  const alerts: FleetAlert[] = [];
  for (const { key, label } of fleetDateFields) {
    const value = car[key];
    if (!value) continue;
    const days = Math.round((Date.parse(value) - Date.parse(today)) / 86400000);
    if (!Number.isFinite(days) || days > 15) continue;
    alerts.push({ key, severity: days < 0 ? "overdue" : "warning", remaining: days, unit: "days", reason: `${label}: ${days < 0 ? `${Math.abs(days)} day${days === -1 ? "" : "s"} overdue` : days === 0 ? "due today" : `due in ${days} day${days === 1 ? "" : "s"}`}` });
  }
  if (car.mileage != null && car.service_due_km != null) {
    const km = car.service_due_km - car.mileage;
    if (km <= 1000) alerts.push({ key: "service_due_km", severity: km < 0 ? "overdue" : "warning", remaining: km, unit: "km", reason: km < 0 ? `Service mileage: ${Math.abs(km).toLocaleString()} km overdue` : km === 0 ? "Service mileage: due now" : `Service mileage: due in ${km.toLocaleString()} km` });
  }
  return alerts.sort((a, b) => Number(b.severity === "overdue") - Number(a.severity === "overdue") || a.remaining - b.remaining);
}

export function sortedFleet(cars: Car[], today = mauritiusDate()): Car[] {
  const rank = (car: Car) => { const alerts = fleetAlerts(car, today); return alerts.some((a) => a.severity === "overdue") ? 2 : alerts.length ? 1 : 0; };
  return [...cars].sort((a, b) => rank(b) - rank(a) || a.name.localeCompare(b.name));
}

export function resetFleetSchedule<T extends Partial<FleetFields>>(draft: T): T {
  return { ...draft, service_due_date: null, service_due_km: null, insurance_expiry: null, road_tax_expiry: null, fitness_expiry: null };
}