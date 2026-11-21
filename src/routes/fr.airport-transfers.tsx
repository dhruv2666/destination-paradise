import { createFileRoute } from "@tanstack/react-router";
import { AirportPage } from "@/components/seo/pages";
import { carsQuery } from "@/lib/seo/queries";
import { AIRPORT } from "@/lib/seo/pages";
import { seoHead } from "@/lib/seo/site";

export const Route = createFileRoute("/fr/airport-transfers")({
  staticData: { sitemap: true },
  loader: ({ context }) => context.queryClient.ensureQueryData(carsQuery).catch(() => []),
  head: () => seoHead({ lang: "fr", path: "/fr/airport-transfers", altPath: "/airport-transfers", title: AIRPORT.fr.title, description: AIRPORT.fr.description, crumbs: [{ name: "Accueil", path: "/fr" }, { name: AIRPORT.fr.h1, path: "/fr/airport-transfers" }] }),
  component: () => <AirportPage lang="fr" />,
});
