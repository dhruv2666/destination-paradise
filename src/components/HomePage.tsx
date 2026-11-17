import { brandLogo, BUSINESS_PHONE } from "@/lib/brand";
import coast from "@/assets/mauritius-coast.webp";
import { slugify, type Lang } from "@/lib/seo/site";
import { LOCATIONS } from "@/lib/seo/locations";
import { whatsappUrl } from "@/lib/whatsapp";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Cog, MapPin, MessageCircle, Users } from "lucide-react";
import { CarImage } from "@/components/CarImage";
import { Button } from "@/components/ui/button";
import { fetchActiveCars, fetchPublicSettings, qk, type Car } from "@/lib/data";
import { formatMoney, lowestRate } from "@/lib/booking-math";
import { DateSearch } from "@/components/DateSearch";

export function HomePage({ lang, initialCars }: { lang: Lang; initialCars: Car[] }) {
  const fr = lang === "fr";
  const settings = useQuery({ queryKey: qk.publicSettings, queryFn: fetchPublicSettings });
  const cars = useQuery({ queryKey: qk.activeCars, queryFn: fetchActiveCars, initialData: initialCars });
  const s = settings.data;
  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card py-3 pr-4">
        <div className="flex w-full items-center justify-between gap-4">
          <img src={brandLogo(s?.logo_url)} alt={fr ? "Logo Destination Paradise Mauritius Car Rental" : "Destination Paradise Mauritius Car Rental logo"} width={144} height={49} loading="eager" decoding="async" className="h-12 w-36 shrink-0 object-contain object-left" />
          <nav className="flex flex-wrap items-center gap-x-3 text-sm font-semibold"><Link to={fr ? "/fr/car-rental" : "/car-rental"} className="hidden hover:text-primary sm:inline">{fr ? "Location" : "Car rental"}</Link><Link to={fr ? "/fr/airport-transfers" : "/airport-transfers"} className="hidden hover:text-primary sm:inline">{fr ? "Aéroport" : "Airport"}</Link><Link to={fr ? "/fr/faq" : "/faq"} className="hidden hover:text-primary sm:inline">FAQ</Link><Link to={fr ? "/fr/contact" : "/contact"} className="hidden hover:text-primary sm:inline">Contact</Link><a href={fr ? "/" : "/fr"} hrefLang={fr ? "en" : "fr"} className="text-primary">{fr ? "EN" : "FR"}</a></nav>
          <Button asChild variant="ghost" size="sm"><Link to="/auth">{fr ? "Propriétaire" : "Owner"} <ArrowUpRight className="h-4 w-4" /></Link></Button>
        </div>
      </header>
      <section className="relative isolate overflow-hidden px-4 py-12 text-on-photo sm:py-16">
        <img src={coast} alt={fr ? "Lagon turquoise et plage bordée de palmiers à l’île Maurice" : "Turquoise lagoon and palm-lined beach in Mauritius"} width={1920} height={1024} loading="eager" fetchPriority="high" decoding="async" className="absolute inset-0 -z-20 h-full w-full object-cover object-center" />
        <div className="coastal-shade absolute inset-0 -z-10" />
        <div className="coastal-content mx-auto max-w-5xl">
          <p className="flex items-center gap-2 text-sm font-semibold"><MapPin className="h-4 w-4" />Grand Baie · {fr ? "Île Maurice" : "Mauritius"}</p>
          <h1 className="mt-5 max-w-xl text-4xl font-bold leading-tight sm:text-5xl">Destination Paradise Mauritius Car Rental</h1>
           <p className="mt-4 max-w-md text-base leading-relaxed sm:text-lg">{fr ? "Choisissez vos dates pour voir les voitures disponibles et le prix total." : "Choose your dates to see available cars and the total price."}</p>
           <DateSearch lang={lang} />
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild variant="coastal" size="lg"><a href={whatsappUrl(BUSINESS_PHONE, fr ? "Bonjour Destination Paradise Mauritius Car Rental, je souhaite louer une voiture." : "Hello Destination Paradise Mauritius Car Rental, I would like to rent a car.")} target="_blank" rel="noopener noreferrer"><MessageCircle />WhatsApp</a></Button>
          </div>
        </div>
      </section>
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-7">
        <div className="mb-5 flex items-center justify-between gap-3"><h2 className="text-2xl font-bold">{fr ? "Nos voitures" : "Our cars"}</h2><span className="flex items-center gap-1.5 text-sm text-primary"><MapPin className="h-4 w-4" />{fr ? "Île Maurice" : "Mauritius"}</span></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cars.data?.map((c, i) => (
            <Link key={c.id} to="/book" search={{ car: c.id }} className="overflow-hidden rounded-lg border border-border bg-card shadow-card transition-transform hover:-translate-y-0.5">
              <div className="aspect-[16/10] bg-secondary"><CarImage car={c} size="thumb" priority={i === 0} className="h-full w-full" /></div>
              <div className="p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <h3 className="min-w-0 break-words text-lg font-semibold">{c.name}</h3>
                  <span className="font-semibold text-primary"><span className="text-sm font-normal text-muted-foreground">{lowestRate(c) < c.daily_price ? (fr ? "dès " : "from ") : ""}</span>{formatMoney(lowestRate(c), c.currency)}<span className="text-sm font-normal text-muted-foreground">{fr ? " / jour" : " / day"}</span></span>
                </div>
                <p className="mt-1 flex gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Users className="h-4 w-4" />{c.seats}</span>
                  <span className="flex items-center gap-1"><Cog className="h-4 w-4" />{fr ? (c.transmission.toLowerCase().startsWith("auto") ? "Automatique" : "Manuelle") : c.transmission}</span>
                </p>
              </div>
            </Link>
          ))}
          {cars.isLoading && [0, 1, 2].map((i) => (
            <div key={i} className="overflow-hidden rounded-lg bg-card shadow-card">
              <div className="aspect-[16/10] animate-pulse bg-secondary" />
              <div className="space-y-2 p-4"><div className="h-5 w-2/3 animate-pulse rounded bg-secondary" /><div className="h-4 w-1/3 animate-pulse rounded bg-secondary" /></div>
            </div>
          ))}
          {cars.data?.length === 0 && <p className="col-span-full border-y border-border py-8 text-center text-muted-foreground">{fr ? "Nos voitures seront bientôt disponibles." : "Cars coming soon."}</p>}
        </div>
        {!!cars.data?.length && (
          <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">{fr ? "Détails des voitures : " : "Car details: "}{cars.data.map((c) => <Link key={c.id} to={fr ? "/fr/cars/$slug" : "/cars/$slug"} params={{ slug: slugify(c.name) }} className="text-primary underline">{c.name}</Link>)}</p>
        )}
        <section className="mt-10 space-y-3 leading-relaxed">
          <h2 className="text-xl font-bold">{fr ? "Location de voitures locale sur la côte nord-ouest" : "Local car hire on the northwest coast"}</h2>
          <p>{fr ? "Destination Paradise Mauritius Car Rental est située sur Royal road à Grand Baie, à l’île Maurice. Sélectionnez une voiture ci-dessus pour ouvrir le formulaire avec cette voiture déjà sélectionnée, choisissez vos dates et votre lieu de prise en charge — l’aéroport international SSR ou un autre lieu de votre choix — puis envoyez votre demande. Nous vérifions la disponibilité, approuvons la réservation et vous envoyons votre facture sur WhatsApp." : "Destination Paradise Mauritius Car Rental is based on Royal road in Grand Baie, Mauritius. Tap any car above to open the booking form with that car already selected, choose your dates and where to collect it — SSR International Airport or another place you name — and send your request. We check availability, approve the booking and send your invoice on WhatsApp."}</p>
          <p>{fr ? "À Maurice, on roule à gauche et l’autoroute relie l’aéroport à Port-Louis et au nord. Découvrez comment fonctionne la location, consultez les détails de la prise en charge à l’aéroport ou parcourez les destinations ci-dessous pour trouver des idées de trajets." : "Mauritius drives on the left, and the motorway links the airport with Port Louis and the north. Read how renting works, see airport pickup details, or browse the areas below for ideas on where to drive."}</p>
        </section>
        <section className="mt-10 grid gap-6 sm:grid-cols-2">
          <div>
            <h2 className="text-xl font-bold">{fr ? "Où séjournez-vous ?" : "Where are you staying?"}</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {LOCATIONS.map((l) => <li key={l.slug}><Link to={fr ? "/fr/locations/$slug" : "/locations/$slug"} params={{ slug: l.slug }} className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1 text-sm hover:bg-secondary"><MapPin className="h-3.5 w-3.5" />{l[lang].name}</Link></li>)}
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-bold">{fr ? "Bon à savoir" : "Good to know"}</h2>
            <ul className="mt-3 space-y-1 text-sm">
              <li><Link to={fr ? "/fr/car-rental" : "/car-rental"} className="text-primary underline">{fr ? "Comment fonctionne la location" : "How car rental works"}</Link></li>
              <li><Link to={fr ? "/fr/airport-transfers" : "/airport-transfers"} className="text-primary underline">{fr ? "Prise en charge à l’aéroport SSR (MRU)" : "Airport pickup at SSR (MRU)"}</Link></li>
              <li><Link to={fr ? "/fr/faq" : "/faq"} className="text-primary underline">{fr ? "Questions fréquentes" : "Frequently asked questions"}</Link></li>
              <li><Link to={fr ? "/fr/contact" : "/contact"} className="text-primary underline">{fr ? "Contact et adresse" : "Contact and address"}</Link></li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
