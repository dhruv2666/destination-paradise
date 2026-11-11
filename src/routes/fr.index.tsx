import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/seo/SiteShell";
import { carsQuery } from "@/components/seo/pages";
import { useQuery } from "@tanstack/react-query";
import { LOCATIONS } from "@/lib/seo/locations";
import { formatMoney, lowestRate } from "@/lib/booking-math";
import { seoHead, slugify } from "@/lib/seo/site";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/fr/")({
  staticData: { sitemap: true },
  loader: ({ context }) => context.queryClient.ensureQueryData(carsQuery).catch(() => []),
  head: () => seoHead({ lang: "fr", path: "/fr", altPath: "/", title: "Victoria Car rental — Location de voiture à l'île Maurice", description: "Louez une voiture à l'île Maurice avec Victoria Car rental, à Pointe aux Piments. Remise à l'aéroport SSR, réservation en ligne et confirmation sur WhatsApp." }),
  component: FrHome,
});

function FrHome() {
  const cars = useQuery(carsQuery);
  return (
    <SiteShell lang="fr" altPath="/">
      <h1 className="text-3xl font-bold sm:text-4xl">Location de voiture à l'île Maurice</h1>
      <p className="mt-3 text-lg leading-relaxed text-muted-foreground">Victoria Car rental est une agence locale située sur la Coastal Road à Pointe aux Piments. Choisissez une voiture et vos dates, indiquez où vous souhaitez la récupérer — à l'aéroport international SSR ou ailleurs — et nous confirmons sur WhatsApp avec votre facture.</p>
      <Button asChild variant="coral" size="lg" className="mt-5"><Link to="/book" search={{}}>Réserver une voiture</Link></Button>
      <h2 className="mt-10 text-2xl font-bold">Nos voitures</h2>
      {cars.data?.length ? (
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {cars.data.map((c) => (
            <li key={c.id} className="rounded-lg border border-border bg-card p-3 shadow-card">
              <Link to="/fr/cars/$slug" params={{ slug: slugify(c.name) }} className="font-semibold text-primary">{c.name}</Link>
              <p className="text-sm text-muted-foreground">{c.seats} places · dès {formatMoney(lowestRate(c), c.currency)} / jour</p>
            </li>
          ))}
        </ul>
      ) : <p className="mt-3 text-muted-foreground">Aucune voiture disponible pour le moment.</p>}
      <h2 className="mt-10 text-2xl font-bold">Où allez-vous ?</h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {LOCATIONS.map((l) => <li key={l.slug}><Link to="/fr/locations/$slug" params={{ slug: l.slug }} className="inline-block rounded-full border border-border px-3 py-1 text-sm hover:bg-secondary">{l.fr.name}</Link></li>)}
      </ul>
      <p className="mt-8 flex flex-wrap gap-4">
        <Link to="/fr/car-rental" className="text-primary underline">Comment louer</Link>
        <Link to="/fr/airport-transfers" className="text-primary underline">Aéroport SSR</Link>
        <Link to="/fr/faq" className="text-primary underline">FAQ</Link>
      </p>
    </SiteShell>
  );
}
