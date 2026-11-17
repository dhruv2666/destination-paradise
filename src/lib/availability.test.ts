import { describe, expect, it, vi } from "vitest";
vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc: vi.fn() } }));
import { supabase } from "@/integrations/supabase/client";
import { availableCarIds, dateRangeProblem, periodDays, mauritiusMidnight } from "./availability";
describe("date-first availability", () => {
  it("requires return after pickup", () => { expect(dateRangeProblem("2026-11-20", "2026-11-20", "2026-11-17")).not.toBeNull(); expect(dateRangeProblem("2026-11-20", "2026-11-19", "2026-11-17")).not.toBeNull(); });
  it("rejects past Mauritius dates", () => { expect(dateRangeProblem("2026-11-16", "2026-11-20", "2026-11-17")).not.toBeNull(); });
  it("allows a minimum one-day period", () => { expect(dateRangeProblem("2026-11-17", "2026-11-18", "2026-11-17")).toBeNull(); expect(periodDays("2026-11-17", "2026-11-18")).toBe(1); });
  it("rejects impossible calendar dates", () => { expect(dateRangeProblem("2026-02-30", "2026-03-03", "2026-01-01")).not.toBeNull(); });
  it("uses Mauritius midnight for locked date-only rentals", () => { expect(mauritiusMidnight("2026-11-20")).toBe("2026-11-20T00:00:00+04:00"); });
  it("retrieves only available IDs through the secure RPC", async () => { vi.mocked(supabase.rpc).mockResolvedValueOnce({ data: [{ car_id: "car-1" }], error: null } as never); expect(await availableCarIds("2099-11-20", "2099-11-22")).toEqual(["car-1"]); expect(supabase.rpc).toHaveBeenCalledWith("available_car_ids", { requested_from: "2099-11-20", requested_to: "2099-11-22" }); });
});