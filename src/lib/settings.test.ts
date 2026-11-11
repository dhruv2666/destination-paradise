import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Settings } from "./data";

const mocks = vi.hoisted(() => ({ from: vi.fn(), upsert: vi.fn(), single: vi.fn(), eq: vi.fn(), select: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: mocks.from } }));
import { saveSettings } from "./settings";

const fields: Settings = {
  id: 1, company_name: "Destination Paradise Mauritius Car Rental", logo_url: null,
  address: "Royal road, Grand baie , Port Louis, Mauritius", phone: "+230 5922 4353",
  company_email: "ravishnarrainen@gmail.com", currency: "Rs", owner_email: "",
  terms_html: "<p>Test terms</p>", whatsapp_template: "Hello {name}", updated_at: "2026-11-09T00:00:00Z",
};
beforeEach(() => {
  vi.clearAllMocks();
  mocks.from.mockReturnValue({ upsert: mocks.upsert, select: mocks.select });
  mocks.select.mockReturnValue({ eq: mocks.eq });
  mocks.eq.mockReturnValue({ single: mocks.single });
  mocks.upsert.mockResolvedValue({ error: null });
  mocks.single.mockResolvedValue({ data: fields, error: null });
});
describe("singleton settings saving", () => {
  it("upserts all fields together at row 1, including when the row is missing", async () => {
    await saveSettings({ ...fields, id: 99 });
    expect(mocks.from).toHaveBeenCalledWith("settings");
    expect(mocks.upsert).toHaveBeenCalledWith({ ...fields, id: 1, updated_at: expect.any(String) }, { onConflict: "id" });
  });
  it("returns values read back from the database", async () => {
    const stored = { ...fields, terms_html: "<p>Stored terms</p>" };
    mocks.single.mockResolvedValue({ data: stored, error: null });
    expect(await saveSettings(fields)).toEqual(stored);
    expect(mocks.eq).toHaveBeenCalledWith("id", 1);
  });
  it("preserves the actual save error", async () => {
    const error = { message: "Permission denied" };
    mocks.upsert.mockResolvedValue({ error });
    await expect(saveSettings(fields)).rejects.toEqual(error);
    expect(mocks.select).not.toHaveBeenCalled();
  });
  it("reports a failed database reload", async () => {
    const error = { message: "Connection interrupted" };
    mocks.single.mockResolvedValue({ data: null, error });
    await expect(saveSettings(fields)).rejects.toEqual(error);
  });
});