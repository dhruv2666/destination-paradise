import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CarPage } from "@/components/seo/pages";
import { carsQuery, findCar } from "@/lib/seo/queries";
import { currencyCode } from "@/lib/booking-math";
import { seoHead, slugify, SITE_URL } from "@/lib/seo/site";

export const Route = createFileRoute("/fr/cars/$slug")({
  staticData: { sitemap: true },
  loader: async ({ params, context }) => {
    const cars = await context.queryClient.ensureQueryData(carsQuery);
    const car = findCar(cars, params.slug);
    if (!car) throw notFound();
    return { car };
  },
  head: ({ loaderData }) => {
    const car = loaderData?.car;
    if (!car) return { meta: [{ title: "Voiture introuvable" }, { name: "robots", content: "noindex" }] };
    const slug = slugify(car.name);
    const path = `/fr/cars/${slug}`;
    return seoHead({
      lang: "fr", path, altPath: `/cars/${slug}`, type: "product",
      title: `Location ${car.name} à l'île Maurice — Destination Paradise Mauritius Car Rental`,
      description: `Louez la ${car.name} à l'île Maurice : ${car.seats} places, boîte ${car.transmission}, ${car.daily_price} ${currencyCode(car.currency)} par jour. Remise à l'aéroport possible.`,
      crumbs: [{ name: "Accueil", path: "/fr" }, { name: "Location", path: "/fr/car-rental" }, { name: car.name, path }],
      extra: [{
        "@context": "https://schema.org", "@type": "Product", name: car.name,
        description: `Louez la ${car.name} à l'île Maurice : ${car.seats} places, boîte ${car.transmission}, ${car.daily_price} ${currencyCode(car.currency)} par jour. Remise à l'aéroport possible.`,
        brand: { "@type": "Brand", name: car.name.split(" ")[0] },
        offers: { "@type": "Offer", url: `${SITE_URL}${path}`, price: car.daily_price, priceCurrency: currencyCode(car.currency), availability: "https://schema.org/InStock", seller: { "@id": `${SITE_URL}/#business` } },
      }],
    });
  },
  component: Page,
});

function Page() {
  const { car: initial } = Route.useLoaderData();
  const cars = useQuery(carsQuery);
  const car = cars.data?.find((c) => c.id === initial.id) ?? initial;
  return <CarPage lang="fr" car={car} />;
}
