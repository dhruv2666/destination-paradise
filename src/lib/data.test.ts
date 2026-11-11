import { describe, expect, it, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }) }),
  },
}));
import { fetchPublicSettings, fetchSettings } from "./data";

describe("clean trial settings", () => {
  it("starts public and owner terms empty when settings are missing", async () => {
    expect((await fetchPublicSettings()).terms_html).toBe("");
    expect((await fetchSettings()).terms_html).toBe("");
  });
  it("defaults public and owner currency to Rs", async () => {
    expect((await fetchPublicSettings()).currency).toBe("Rs");
    expect((await fetchSettings()).currency).toBe("Rs");
  });
});