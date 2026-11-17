import { brandLogo, BUSINESS_PHONE } from "@/lib/brand";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, MessageCircle } from "lucide-react";
import { z } from "zod";
import { BookingForm } from "@/components/BookingForm";
import { locationLabel } from "@/lib/booking-math";
import { fetchActiveCars, fetchPublicSettings, qk } from "@/lib/data";
import { DateSearch } from "@/components/DateSearch";
import { CarImage } from "@/components/CarImage";
import { Button } from "@/components/ui/button";
import { availableCarIds, dateRangeProblem, nearbyAvailableDates, periodDays } from "@/lib/availability";
import { formatMoney, tierDailyPrice } from "@/lib/booking-math";
import { whatsappUrl } from "@/lib/whatsapp";

const search = z.object({ car: z.string().optional(), from: z.string().optional(), to: z.string().optional() });

export const Route = createFileRoute("/book")({
  staticData: { sitemap: true },
  validateSearch: (s) => search.parse(s),
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Book a car — Destination Paradise Mauritius Car Rental" },
      { name: "description", content: "Request your Destination Paradise Mauritius Car Rental rental car in Mauritius online." },
      { property: "og:title", content: "Book a car — Destination Paradise Mauritius Car Rental" },
      { property: "og:description", content: "Request your Destination Paradise Mauritius Car Rental rental car in Mauritius online." },
    ],
  }),
  component: BookPage,
});

function BookPage() {
  const params = Route.useSearch();
  const navigate = useNavigate();
  const settings = useQuery({ queryKey: qk.publicSettings, queryFn: fetchPublicSettings });
  const cars = useQuery({ queryKey: qk.activeCars, queryFn: fetchActiveCars });
  const from = params.from ?? "";
  const to = params.to ?? "";
  const problem = dateRangeProblem(from, to);
  const availability = useQuery({ queryKey: ["available-cars", from, to], queryFn: () => availableCarIds(from, to), enabled: !problem, staleTime: 0, refetchOnMount: "always" });
  const available = (cars.data ?? []).filter((c) => availability.data?.includes(c.id));
  const selected = available.find((c) => c.id === params.car);
  const nearby = useQuery({ queryKey: ["nearby-dates", from, to], queryFn: () => nearbyAvailableDates(from, to), enabled: !problem && availability.isSuccess && available.length === 0 && cars.isSuccess });
  const days = problem ? 0 : periodDays(from, to);

  return (
    <div className="min-h-screen">
      <header className="bg-hero px-4 pb-16 pt-6 text-foreground">
        <div className="mx-auto max-w-2xl">
          <Link to="/" className="flex items-center gap-2 font-display text-base font-bold">
            <img src={brandLogo(settings.data?.logo_url)} alt="Destination Paradise Mauritius Car Rental logo" width={144} height={49} loading="eager" fetchPriority="high" decoding="async" className="h-12 w-36 shrink-0 rounded-md object-contain" />
            {settings.data?.company_name ?? "Destination Paradise Mauritius Car Rental"}
          </Link>
           <h1 className="mt-6 text-3xl font-bold sm:text-4xl">{selected ? "Book your car" : "Available cars"}</h1>
           <DateSearch key={`${from}-${to}`} initialFrom={problem ? "" : from} initialTo={problem ? "" : to} />
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 pb-12">
        <div className="bg-background py-5 sm:py-7">
          {problem ? <p role="status" className="py-6">{from || to ? problem : "Choose your pickup and return dates to see available cars."}</p> : cars.isError || availability.isError || settings.isError ? <p role="alert">We couldn’t check availability. Please try again or contact us on WhatsApp.</p> : !settings.data || !cars.data || availability.isPending ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin" /></div>
          ) : available.length === 0 ? (
            <section className="space-y-4 py-8">
              <h2 className="text-xl font-bold">No cars available for these dates</h2>
              <p className="text-muted-foreground">Sorry, our cars are booked or off-hire for this period. We can help you find another option.</p>
              <Button asChild variant="coral"><a href={whatsappUrl(BUSINESS_PHONE, `Hello, do you have a car available from ${from} to ${to}?`)} target="_blank" rel="noopener noreferrer"><MessageCircle />Ask on WhatsApp</a></Button>
              {!!nearby.data?.length && <div><h3 className="mb-2 font-semibold">Nearby dates with availability</h3><div className="flex flex-wrap gap-2">{nearby.data.map((range) => <Button key={range.from} asChild variant="outline"><Link to="/book" search={range}>{range.from} – {range.to}</Link></Button>)}</div></div>}
            </section>
          ) : selected ? (
            <>
            <Button asChild variant="outline" className="mb-4"><Link to="/book" search={{ from, to }}>Choose another car</Link></Button>
            <BookingForm
              key={`${selected.id}-${from}-${to}`}
              lockSelection
              mode="public"
              cars={[selected]}
              currency={settings.data.currency}
              termsHtml={settings.data.terms_html}
              defaults={params}
              onSaved={(b) => {
                const r = b as unknown as { car_name?: string; pickup_at?: string; pickup_location?: string | null; location_details?: string | null } | null;
                navigate({ to: "/booking-received", search: { car: r?.car_name, at: r?.pickup_at, loc: r ? locationLabel(r.pickup_location ?? null, r.location_details ?? null) : undefined } });
              }}
            />
            </>
          ) : <section className="space-y-4">
            {params.car && <p role="status">Please select an available car for your dates.</p>}
            <p className="font-semibold">{from} – {to} · {days} day{days === 1 ? "" : "s"}</p>
            <div className="grid gap-4 sm:grid-cols-2">{available.map((c, i) => {
              const rate = tierDailyPrice(c, days);
              return <article key={c.id} className="overflow-hidden rounded-lg border border-border bg-card shadow-card">
                <div className="aspect-[16/10] bg-secondary"><CarImage car={c} size="thumb" priority={i === 0} className="h-full w-full" /></div>
                <div className="space-y-3 p-4"><h2 className="text-lg font-semibold">{c.name}</h2><p className="text-sm text-muted-foreground">{c.seats} seats · {c.transmission}</p><p className="text-sm">{days} × {formatMoney(rate, c.currency)} / day</p><p className="text-xl font-bold text-primary">{formatMoney(days * rate, c.currency)} <span className="text-sm font-normal">total</span></p><Button asChild className="w-full"><Link to="/book" search={{ from, to, car: c.id }}>Select {c.name}</Link></Button></div>
              </article>;
            })}</div>
          </section>}
        </div>
      </main>
    </div>
  );
}
