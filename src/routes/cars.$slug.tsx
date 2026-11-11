import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CarPage, carsQuery, findCar } from "@/components/seo/pages";
import { currencyCode } from "@/lib/booking-math";
import { seoHead, slugify, SITE_URL } from "@/lib/seo/site";

export const Route = createFileRoute("/cars/$slug")({
  staticData: { sitemap: true },
  loader: async ({ params, context }) => {
    const cars = await context.queryClient.ensureQueryData(carsQuery);
    const car = findCar(cars, params.slug);
    if (!car) throw notFound();
    return { car };
  },
  head: ({ loaderData }) => {
    const car = loaderData?.car;
    if (!car) return { meta: [{ title: "Car not found" }, { name: "robots", content: "noindex" }] };
    const slug = slugify(car.name);
    const path = `/cars/${slug}`;
    return seoHead({
      lang: "en", path, altPath: `/fr/cars/${slug}`, type: "product",
      title: `${car.name} for rent in Mauritius — Destination Paradise Mauritius Car Rental`,
      description: `Rent the ${car.name} in Mauritius: ${car.seats} seats, ${car.transmission} gearbox, from ${car.daily_price} ${currencyCode(car.currency)} per day. Airport pickup available.`,
      crumbs: [{ name: "Home", path: "/" }, { name: "Car rental", path: "/car-rental" }, { name: car.name, path }],
      extra: [{
        "@context": "https://schema.org", "@type": "Product", name: car.name,
        description: `Rent the ${car.name} in Mauritius: ${car.seats} seats, ${car.transmission} gearbox, from ${car.daily_price} ${currencyCode(car.currency)} per day. Airport pickup available.`,
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
  return <CarPage lang="en" car={car} />;
}
