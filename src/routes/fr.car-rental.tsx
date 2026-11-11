import { createFileRoute } from "@tanstack/react-router";
import { CarRentalPage, carsQuery } from "@/components/seo/pages";
import { CAR_RENTAL } from "@/lib/seo/pages";
import { seoHead } from "@/lib/seo/site";

export const Route = createFileRoute("/fr/car-rental")({
  staticData: { sitemap: true },
  loader: ({ context }) => context.queryClient.ensureQueryData(carsQuery).catch(() => []),
  head: () => seoHead({ lang: "fr", path: "/fr/car-rental", altPath: "/car-rental", title: CAR_RENTAL.fr.title, description: CAR_RENTAL.fr.description, crumbs: [{ name: "Accueil", path: "/fr" }, { name: CAR_RENTAL.fr.h1, path: "/fr/car-rental" }] }),
  component: () => <CarRentalPage lang="fr" />,
});
