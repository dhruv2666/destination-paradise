import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/** Signs photo links only for photos attached to active (publicly listed) cars. */
export const signCarPhotos = createServerFn({ method: "POST" })
  .inputValidator(z.object({ paths: z.array(z.string().min(1).max(300)).max(100) }))
  .handler(async ({ data }) => {
    if (data.paths.length === 0) return {} as Record<string, string>;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: cars, error } = await supabaseAdmin.from("cars").select("photos").eq("active", true);
    if (error) throw new Error("Could not load photos");
    const allowed = new Set<string>();
    for (const c of cars ?? []) {
      for (const p of (Array.isArray(c.photos) ? c.photos : []) as { main?: string; thumb?: string }[]) {
        if (p?.main) allowed.add(p.main);
        if (p?.thumb) allowed.add(p.thumb);
      }
    }
    const paths = [...new Set(data.paths)].filter((p) => allowed.has(p));
    if (paths.length === 0) return {} as Record<string, string>;
    const { data: signed, error: signError } = await supabaseAdmin.storage
      .from("car-photos")
      .createSignedUrls(paths, 60 * 60 * 24 * 7);
    if (signError) throw new Error("Could not load photos");
    const out: Record<string, string> = {};
    for (const s of signed ?? []) if (s.path && s.signedUrl) out[s.path] = s.signedUrl;
    return out;
  });
