import { brandLogo } from "@/lib/brand";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { BookingForm } from "@/components/BookingForm";
import { locationLabel } from "@/lib/booking-math";
import { fetchActiveCars, fetchPublicSettings, qk } from "@/lib/data";

const search = z.object({ car: z.string().optional(), from: z.string().optional(), to: z.string().optional() });

export const Route = createFileRoute("/book")({
  staticData: { sitemap: true },
  validateSearch: (s) => search.parse(s),
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Book a car — Victoria Car rental" },
      { name: "description", content: "Request your Victoria Car rental rental car in Mauritius online." },
      { property: "og:title", content: "Book a car — Victoria Car rental" },
      { property: "og:description", content: "Request your Victoria Car rental rental car in Mauritius online." },
    ],
  }),
  component: BookPage,
});

function BookPage() {
  const params = Route.useSearch();
  const navigate = useNavigate();
  const settings = useQuery({ queryKey: qk.publicSettings, queryFn: fetchPublicSettings });
  const cars = useQuery({ queryKey: qk.activeCars, queryFn: fetchActiveCars });

  return (
    <div className="min-h-screen">
      <header className="bg-hero px-4 pb-16 pt-6 text-foreground">
        <div className="mx-auto max-w-2xl">
          <Link to="/" className="flex items-center gap-2 font-display text-base font-bold">
            <img src={brandLogo(settings.data?.logo_url)} alt="Victoria Car rental logo" width={144} height={49} loading="eager" fetchPriority="high" decoding="async" className="h-12 w-36 shrink-0 rounded-md object-contain" />
            {settings.data?.company_name ?? "Victoria Car rental"}
          </Link>
          <h1 className="mt-6 text-3xl font-bold sm:text-4xl">Book your car</h1>
          <p className="mt-1 opacity-85">Send a request — we confirm and send your invoice on WhatsApp.</p>
        </div>
      </header>
      <main className="mx-auto -mt-10 max-w-2xl px-4 pb-12">
        <div className="rounded-2xl bg-card p-5 shadow-card sm:p-7">
          {!settings.data || !cars.data ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin" /></div>
          ) : cars.data.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No cars are available for booking right now.</p>
          ) : (
            <BookingForm
              mode="public"
              cars={cars.data}
              currency={settings.data.currency}
              termsHtml={settings.data.terms_html}
              defaults={params}
              onSaved={(b) => {
                const r = b as unknown as { car_name?: string; pickup_at?: string; pickup_location?: string | null; location_details?: string | null } | null;
                navigate({ to: "/booking-received", search: { car: r?.car_name, at: r?.pickup_at, loc: r ? locationLabel(r.pickup_location ?? null, r.location_details ?? null) : undefined } });
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
}
