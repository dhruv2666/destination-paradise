import { createFileRoute } from "@tanstack/react-router";
import { getRouterInstance } from "@tanstack/react-start";
import { isSitemapRouteIncluded, sitemapPathForLocation, sitemapStaticPaths, sitemapXML, type SitemapEntry } from "@/lib/sitemap";
import { LOCATIONS } from "@/lib/seo/locations";
import { SITE_URL, slugify } from "@/lib/seo/site";

const BASE_URL = SITE_URL;

export const Route = createFileRoute("/sitemap.xml")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      GET: async () => {
        const router = await getRouterInstance();
        const entries: SitemapEntry[] = sitemapStaticPaths(router).map((path) => ({ path }));
        const add = (routeId: string, to: string, slug: string) => {
          if (!isSitemapRouteIncluded((router.routesById as unknown as Record<string, import("@tanstack/react-router").AnyRoute>)[routeId])) return;
          const location = router.buildLocation({ to, params: { slug }, search: () => ({}), hash: "" } as never);
          const path = sitemapPathForLocation(router, location, routeId);
          if (path) entries.push({ path });
        };
        for (const l of LOCATIONS) {
          add("/locations/$slug", "/locations/$slug", l.slug);
          add("/fr/locations/$slug", "/fr/locations/$slug", l.slug);
        }
        const { createClient } = await import("@supabase/supabase-js");
        const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
        const supabase = createClient(process.env["SUPABASE_URL"]!, key, {
          auth: { persistSession: false, autoRefreshToken: false },
          global: { fetch: (input, init) => {
            const headers = new Headers(init?.headers);
            if (key.startsWith("sb_") && headers.get("Authorization") === "Bearer " + key) headers.delete("Authorization");
            headers.set("apikey", key);
            return fetch(input, { ...init, headers });
          } },
        });
        const pageSize = 1000;
        for (let offset = 0; ; ) {
          const { data, error } = await supabase.from("cars").select("id,name").eq("active", true).order("id").range(offset, offset + pageSize - 1);
          if (error) throw error;
          if (data.length === 0) break;
          for (const car of data) {
            add("/cars/$slug", "/cars/$slug", slugify(car.name));
            add("/fr/cars/$slug", "/fr/cars/$slug", slugify(car.name));
          }
          offset += data.length;
        }
        return new Response(sitemapXML(BASE_URL, entries), {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
