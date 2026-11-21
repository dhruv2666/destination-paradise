import { createFileRoute } from "@tanstack/react-router";
import { AirportPage } from "@/components/seo/pages";
import { carsQuery } from "@/lib/seo/queries";
import { AIRPORT } from "@/lib/seo/pages";
import { seoHead } from "@/lib/seo/site";

export const Route = createFileRoute("/airport-transfers")({
  staticData: { sitemap: true },
  loader: ({ context }) => context.queryClient.ensureQueryData(carsQuery).catch(() => []),
  head: () => seoHead({ lang: "en", path: "/airport-transfers", altPath: "/fr/airport-transfers", title: AIRPORT.en.title, description: AIRPORT.en.description, crumbs: [{ name: "Home", path: "/" }, { name: AIRPORT.en.h1, path: "/airport-transfers" }] }),
  component: () => <AirportPage lang="en" />,
});
