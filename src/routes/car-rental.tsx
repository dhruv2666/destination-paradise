import { createFileRoute } from "@tanstack/react-router";
import { CarRentalPage, carsQuery } from "@/components/seo/pages";
import { CAR_RENTAL } from "@/lib/seo/pages";
import { seoHead } from "@/lib/seo/site";

export const Route = createFileRoute("/car-rental")({
  staticData: { sitemap: true },
  loader: ({ context }) => context.queryClient.ensureQueryData(carsQuery).catch(() => []),
  head: () => seoHead({ lang: "en", path: "/car-rental", altPath: "/fr/car-rental", title: CAR_RENTAL.en.title, description: CAR_RENTAL.en.description, crumbs: [{ name: "Home", path: "/" }, { name: CAR_RENTAL.en.h1, path: "/car-rental" }] }),
  component: () => <CarRentalPage lang="en" />,
});
