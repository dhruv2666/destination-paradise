import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/HomePage";
import { fetchActiveCars, qk } from "@/lib/data";
import { seoHead } from "@/lib/seo/site";

export const Route = createFileRoute("/fr/")({
  staticData: { sitemap: true },
  loader: ({ context }) => context.queryClient.ensureQueryData({ queryKey: qk.activeCars, queryFn: fetchActiveCars }).catch(() => []),
  head: () => seoHead({ lang: "fr", path: "/fr", altPath: "/", title: "Destination Paradise Mauritius Car Rental — Location de voiture à l'île Maurice", description: "Louez une voiture à l'île Maurice avec Destination Paradise Mauritius Car Rental, à Grand Baie. Remise à l'aéroport SSR, réservation en ligne et confirmation sur WhatsApp." }),
  component: () => <HomePage lang="fr" initialCars={Route.useLoaderData()} />,
});
