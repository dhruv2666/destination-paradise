import { brandLogo } from "@/lib/brand";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { z } from "zod";
import { BUSINESS_PHONE } from "@/lib/brand";
import { whatsappUrl } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";
import { fetchPublicSettings, qk } from "@/lib/data";

const search = z.object({ car: z.string().optional(), at: z.string().optional(), loc: z.string().optional() });

function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]!);
}

function bookedMessage(car?: string, at?: string, loc?: string) {
  const d = at ? new Date(at) : null;
  if (!d || isNaN(d.getTime())) return `Hello Victoria Car rental, I just booked ${car ? `the ${car}` : "a car"} on your website.`;
  const day = Number(d.toLocaleString("en-GB", { day: "numeric", timeZone: "Indian/Mauritius" }));
  const month = d.toLocaleString("en-GB", { month: "long", timeZone: "Indian/Mauritius" });
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Indian/Mauritius" });
  return `Hello, I just booked ${car ? `the ${car}` : "a car"} on the ${ordinal(day)} of ${month} at ${time} pick up${loc ? ` at ${loc}` : ""}.`;
}

export const Route = createFileRoute("/booking-received")({
  staticData: { sitemap: false },
  validateSearch: (s) => search.parse(s),
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Request received — Victoria Car rental" },
      { name: "description", content: "Your Victoria Car rental booking request has been received." },
      { property: "og:title", content: "Request received — Victoria Car rental" },
      { property: "og:description", content: "Your Victoria Car rental booking request has been received." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Received,
});

function Received() {
  const settings = useQuery({ queryKey: qk.publicSettings, queryFn: fetchPublicSettings });
  const s = settings.data;
  const q = Route.useSearch();
  const message = bookedMessage(q.car, q.at, q.loc);
  return (
    <div className="flex min-h-screen flex-col p-4">
      <div className="flex w-full items-center gap-2 font-display text-base font-bold">
        <img src={brandLogo(s?.logo_url)} alt="Victoria Car rental logo" width={144} height={49} loading="eager" fetchPriority="high" decoding="async" className="h-12 w-36 shrink-0 rounded-md object-contain shadow-card" />
        {s?.company_name ?? "Victoria Car rental"}
      </div>
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-md rounded-2xl bg-card p-8 text-center shadow-card">
          <CheckCircle2 className="mx-auto h-12 w-36 text-success" />
          <h1 className="mt-4 text-2xl font-bold">Your request has been received</h1>
          <p className="mt-2 text-muted-foreground">You'll get your invoice once approved.</p>
          <p className="mt-4 rounded-md bg-secondary p-3 text-sm font-semibold">Please let us know on WhatsApp that you have booked:</p>
          <p className="mt-2 text-sm italic text-muted-foreground">"{message}"</p>
          <Button asChild variant="coral" size="tap" className="mt-4 w-full"><a href={whatsappUrl(BUSINESS_PHONE, message)} target="_blank" rel="noopener noreferrer"><MessageCircle />Send on WhatsApp</a></Button>
          <Button asChild variant="outline" size="tap" className="mt-6"><Link to="/">Back to home</Link></Button>
        </div>
      </div>
    </div>
  );
}
