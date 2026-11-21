// Lightweight data helpers used by route loaders.
// Kept out of the page component files so importing them in a route
// doesn't pull the whole page UI into the main JavaScript bundle.
import { fetchActiveCars, qk, type Car } from "@/lib/data";
import { slugify } from "@/lib/seo/site";

export const carsQuery = { queryKey: qk.activeCars, queryFn: fetchActiveCars };

export function findCar(cars: Car[], slug: string) {
  return cars.find((c) => slugify(c.name) === slug);
}
