import { createFileRoute, notFound } from "@tanstack/react-router";
import { LocationPage, carsQuery } from "@/components/seo/pages";
import { findLocation } from "@/lib/seo/locations";
import { seoHead } from "@/lib/seo/site";

export const Route = createFileRoute("/locations/$slug")({
  staticData: { sitemap: true },
  loader: async ({ params, context }) => {
    const loc = findLocation(params.slug);
    if (!loc) throw notFound();
    await context.queryClient.ensureQueryData(carsQuery).catch(() => []);
    return { slug: loc.slug };
  },
  head: ({ params }) => {
    const loc = findLocation(params.slug);
    if (!loc) return { meta: [{ title: "Area not found" }, { name: "robots", content: "noindex" }] };
    const c = loc.en;
    return seoHead({ lang: "en", path: `/locations/${loc.slug}`, altPath: `/fr/locations/${loc.slug}`, title: c.title, description: c.description, crumbs: [{ name: "Home", path: "/" }, { name: c.name, path: `/locations/${loc.slug}` }] });
  },
  component: Page,
});

function Page() {
  const { slug } = Route.useLoaderData();
  return <LocationPage lang="en" loc={findLocation(slug)!} />;
}
