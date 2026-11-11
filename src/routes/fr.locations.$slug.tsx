import { createFileRoute, notFound } from "@tanstack/react-router";
import { LocationPage, carsQuery } from "@/components/seo/pages";
import { findLocation } from "@/lib/seo/locations";
import { seoHead } from "@/lib/seo/site";

export const Route = createFileRoute("/fr/locations/$slug")({
  staticData: { sitemap: true },
  loader: async ({ params, context }) => {
    const loc = findLocation(params.slug);
    if (!loc) throw notFound();
    await context.queryClient.ensureQueryData(carsQuery).catch(() => []);
    return { slug: loc.slug };
  },
  head: ({ params }) => {
    const loc = findLocation(params.slug);
    if (!loc) return { meta: [{ title: "Zone introuvable" }, { name: "robots", content: "noindex" }] };
    const c = loc.fr;
    return seoHead({ lang: "fr", path: `/fr/locations/${loc.slug}`, altPath: `/locations/${loc.slug}`, title: c.title, description: c.description, crumbs: [{ name: "Accueil", path: "/fr" }, { name: c.name, path: `/fr/locations/${loc.slug}` }] });
  },
  component: Page,
});

function Page() {
  const { slug } = Route.useLoaderData();
  return <LocationPage lang="fr" loc={findLocation(slug)!} />;
}
