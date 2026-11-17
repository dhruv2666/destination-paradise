<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules
- UI colour roles live in semantic CSS tokens; coastal page imagery is bundled locally, keeping the visual refresh independent of rental calculations and the existing PDF pipeline.
- Booking PDFs are built in the browser (jsPDF, `src/lib/pdf.ts`) and stored in the private `documents` bucket at `<booking id>.pdf`; regenerating overwrites the same path so the number and link never change.
- Each booking snapshots `terms_html` at insert (DB trigger `bookings_prepare`), so documents never change when Settings T&C are edited.
- Price/days/overlap are enforced by the `bookings_prepare` trigger; `src/lib/booking-math.ts` must mirror it.
- Omitted booking rates default to NULL so the trigger selects the car rate even for signed-in owners using the public form; explicit owner overrides remain valid.
- Car photos use orientation-aware main+thumb compression with canvas-detected WebP/JPEG and MIME-matched paths, or one small original shared by both paths if compression fails; this supports Safari without changing signed reads or the four-photo DB limit. Uploaded settings logos use resized PNG data URLs (no shared WebP compression); the bundled brand logo uses a CDN pointer, converted to a data URL for browser PDF generation.
- Sign-ups stay pending (no role) until an owner approves them; all owner mutations serialize on one advisory lock to protect the final owner.

- Car price ranges (`cars.price_ranges`) are matched by the DB function `car_range_price` inside the booking trigger and mirrored by `tierDailyPrice`; stored booking rates and totals remain invoice snapshots.
- Cars store one pricing currency; bookings snapshot it in bookings_prepare (owners may override), and all documents use that snapshot. Group summary totals by currency to avoid adding unlike amounts.
- Owner approval uses role-checked database RPCs; only password resets use a privileged server client after verifying the caller is an owner. No auth emails are sent.
- Pending account deletion uses an owner-checked server function and a database reservation under the owners advisory lock, so concurrent approval cannot turn a deletion target into an owner.
- CarImage uses Embla with viewport-gated signing and selected-slide image mounting; lists expose only thumbnail sources and detail views use responsive thumb/main source sets. Photo uploads use immutable paths and long cache headers; optimization stages replacements until the car is saved. The standalone exchange tool never changes stored rental prices.
- The base database schema arrived with the remix without migration history; migrations record subsequent changes only, so never recreate an existing table or column.
- Keep branding centralized in `src/lib/brand.ts` and semantic CSS tokens; browser PDFs keep their existing rendering and storage pipeline while matching brand colors.
- Rasterize uploaded SVG brand logos to a small PNG CDN asset for shared UI/PDF use, and pad the same logo into local square favicon/PWA icons; this keeps original artwork compatible with jsPDF without changing document storage.
- Settings writes use the singleton upsert/read-back helper in `src/lib/settings.ts`; missing-row reads return an unsaved form so admins can recreate row 1 through RLS.
- Invoice numbers are allocated once by the booking column default; the preparation trigger must not advance the same sequence again, so public and owner bookings start at the reset counter without skipped numbers.
- Public SEO pages share `src/lib/seo/*` content and `src/components/seo/*` shells; English routes have `/fr/...` twins with hreflang, the business JSON-LD lives in the root head, and every route declares `staticData.sitemap` for the router-derived sitemap.
- English and French home routes render the shared HomePage with a language prop so their layouts, car queries and image delivery cannot drift apart.
- Fleet data is read through the owner-checked owner_fleet_cars RPC; public car queries explicitly select rental fields because column grants keep internal maintenance notes private.
- Fleet alert thresholds and schedule resets live in src/lib/fleet.ts; both dashboard and Fleet tab use them to keep Mauritius-date warnings consistent.
- Booking extras use the shared allowlist in src/lib/booking-extras.ts and are stored without altering rental prices or PDF generation.
