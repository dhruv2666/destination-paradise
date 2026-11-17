import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { mauritiusDate } from "./holidays";

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((v) => {
  const parsed = new Date(`${v}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === v;
});
export const dateRangeSchema = z.object({ from: date, to: date }).refine((r) => r.to > r.from, "Return date must be after pickup date (minimum 1 day).");
export function dateRangeProblem(from: string, to: string, today = mauritiusDate()): string | null {
  const parsed = dateRangeSchema.safeParse({ from, to });
  if (!parsed.success) return "Choose valid dates with return after pickup (minimum 1 day).";
  return from < today ? "Pickup date cannot be in the past." : null;
}
export function periodDays(from: string, to: string) {
  return Math.round((Date.parse(to) - Date.parse(from)) / 86400000);
}
export function mauritiusMidnight(date: string) {
  return `${date}T00:00:00+04:00`;
}
export function shiftDate(date: string, days: number) {
  return new Date(Date.parse(date) + days * 86400000).toISOString().slice(0, 10);
}
export async function availableCarIds(from: string, to: string): Promise<string[]> {
  const problem = dateRangeProblem(from, to);
  if (problem) throw new Error(problem);
  const { data, error } = await supabase.rpc("available_car_ids", { requested_from: from, requested_to: to });
  if (error) throw error;
  return data.map((row) => row.car_id);
}
export async function nearbyAvailableDates(from: string, to: string) {
  const shifts = [-1, 1, -2, 2, -3, 3, -4, 4, -5, 5, -6, 6, -7, 7];
  const results = await Promise.all(shifts.map(async (shift) => {
    const range = { from: shiftDate(from, shift), to: shiftDate(to, shift) };
    if (dateRangeProblem(range.from, range.to)) return null;
    return (await availableCarIds(range.from, range.to)).length ? range : null;
  }));
  return results.filter((r): r is { from: string; to: string } => r !== null).slice(0, 3);
}