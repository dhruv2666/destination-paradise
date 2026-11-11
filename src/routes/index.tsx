import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/HomePage";
import { seoHead } from "@/lib/seo/site";
import { fetchActiveCars, qk } from "@/lib/data";

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  loader: ({ context }) => context.queryClient.ensureQueryData({ queryKey: qk.activeCars, queryFn: fetchActiveCars }).catch(() => []),
  head: () => seoHead({ lang: "en", path: "/", altPath: "/fr", title: "Destination Paradise Mauritius Car Rental — Car hire in Mauritius with airport pickup", description: "Rent a car in Mauritius from Destination Paradise Mauritius Car Rental in Grand Baie. Airport pickup at SSR, online booking and confirmation on WhatsApp." }),
  component: () => <HomePage lang="en" initialCars={Route.useLoaderData()} />,
});
