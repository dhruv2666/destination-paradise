import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, Phone, MapPin, Users, Cog, Plane, FileText, ShieldCheck, ArrowRight } from "lucide-react";
import { SiteShell, Prose } from "./SiteShell";
import { CarImage } from "@/components/CarImage";
import { PriceRangesList } from "@/components/PriceRanges";
import { Button } from "@/components/ui/button";
import { BUSINESS_PHONE } from "@/lib/brand";
import { whatsappUrl } from "@/lib/whatsapp";
import { type Car } from "@/lib/data";
import { carsQuery } from "@/lib/seo/queries";
import { formatMoney, lowestRate } from "@/lib/booking-math";
import { AIRPORT, CAR_RENTAL, FAQS } from "@/lib/seo/pages";
import { LOCATIONS, type LocationEntry } from "@/lib/seo/locations";
import { slugify, type Lang } from "@/lib/seo/site";
import { DateSearch } from "@/components/DateSearch";
import { ServiceRequestForm } from "@/components/ServiceRequestForm";
import { Reveal } from "@/components/Reveal";

const home = (lang: Lang) => (lang === "fr" ? "/fr" : "/");
const pre = (lang: Lang) => (lang === "fr" ? "/fr" : "");

function CarLinks({ lang }: { lang: Lang }) {
  const cars = useQuery(carsQuery);
  if (!cars.data?.length) return null;
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {cars.data.map((c) => (
        <li key={c.id} className="rounded-lg border border-border bg-card p-3 shadow-card">
          {lang === "fr" ? <Link to="/fr/cars/$slug" params={{ slug: slugify(c.name) }} className="font-semibold text-primary">{c.name}</Link>
            : <Link to="/cars/$slug" params={{ slug: slugify(c.name) }} className="font-semibold text-primary">{c.name}</Link>}
          <p className="text-sm text-muted-foreground">{lang === "fr" ? "dès" : "from"} {formatMoney(lowestRate(c), c.currency)} / {lang === "fr" ? "jour" : "day"}</p>
        </li>
      ))}
    </ul>
  );
}

function BookCta({ lang }: { lang: Lang }) {
  const fr = lang === "fr";
  return (
    <div className="mt-8 flex flex-wrap gap-3 rounded-lg bg-secondary p-4">
      <Button asChild variant="coral"><Link to="/book" search={{}}>{fr ? "Réserver une voiture" : "Book a car"}</Link></Button>
      <Button asChild variant="outline"><a href={whatsappUrl(BUSINESS_PHONE, "Hello Destination Paradise Mauritius Car Rental, I would like to rent a car.")} target="_blank" rel="noopener noreferrer"><MessageCircle />WhatsApp</a></Button>
    </div>
  );
}

export function CarRentalPage({ lang }: { lang: Lang }) {
  const c = CAR_RENTAL[lang];
  const fr = lang === "fr";
  const [intro, ...details] = c.sections;
  const perks = fr
    ? [{ icon: Plane, text: "Prise en charge à l'aéroport SSR" }, { icon: ShieldCheck, text: "Aucun paiement en ligne" }, { icon: FileText, text: "Facture envoyée sur WhatsApp" }]
    : [{ icon: Plane, text: "Pickup at SSR airport" }, { icon: ShieldCheck, text: "Nothing charged online" }, { icon: FileText, text: "Invoice sent on WhatsApp" }];
  return (
    <SiteShell wide lang={lang} altPath={fr ? "/car-rental" : "/fr/car-rental"} crumbs={[{ name: fr ? "Accueil" : "Home", path: home(lang) }, { name: c.h1, path: `${pre(lang)}/car-rental` }]}>
      {/* Hero */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-10">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-primary"><MapPin className="h-4 w-4" />Grand Baie, {fr ? "Île Maurice" : "Mauritius"}</p>
        <h1 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">{c.h1}</h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">{c.intro}</p>
        <DateSearch lang={lang} />
        <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3 border-t border-border pt-6 text-sm">
          {perks.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-primary"><Icon className="h-4 w-4" /></span>{text}</li>
          ))}
        </ul>
      </section>

      {/* Fleet */}
      <Reveal>
        <section id="fleet" className="mt-14 scroll-mt-6 sm:mt-20" aria-labelledby="fleet-heading">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="fleet-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">{fr ? "Notre flotte" : "Our fleet"}</h2>
              <p className="mt-2 text-muted-foreground">{fr ? "Choisissez votre voiture : le formulaire s'ouvre avec la voiture déjà sélectionnée." : "Pick a car and the booking form opens with it already selected."}</p>
            </div>
          </div>
          <FleetGrid lang={lang} />
        </section>
      </Reveal>

      {/* How it works */}
      <Reveal>
        <section className="mt-14 sm:mt-20" aria-labelledby="how-heading">
          <h2 id="how-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">{intro?.h ?? (fr ? "Comment ça marche" : "How renting works")}</h2>
          {intro && <div className="mt-4 max-w-3xl space-y-4 leading-relaxed">{intro.p.map((p, i) => <p key={i}>{p}</p>)}</div>}
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {details.map((s, i) => (
              <article key={s.h} className={`rounded-xl border border-border bg-card p-6 shadow-card ${details.length % 2 === 1 && i === details.length - 1 ? "md:col-span-2" : ""}`}>
                <h3 className="text-lg font-bold">{s.h}</h3>
                <div className="mt-3 space-y-3 leading-relaxed text-muted-foreground">{s.p.map((p, i) => <p key={i}>{p}</p>)}</div>
              </article>
            ))}
          </div>
        </section>
      </Reveal>

      <div className="mt-12 flex flex-col gap-4 rounded-2xl bg-secondary p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <p className="text-lg font-bold">{fr ? "Prêt à partir ?" : "Ready to go?"}</p>
          <p className="mt-1 text-sm text-muted-foreground">{fr ? "Vous arrivez en avion ? " : "Arriving by plane? "}{fr ? <Link to="/fr/airport-transfers" className="text-primary underline">Prise en charge à l'aéroport</Link> : <Link to="/airport-transfers" className="text-primary underline">See how airport pickup works</Link>}.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="coral" size="lg"><Link to="/book" search={{}}>{fr ? "Réserver une voiture" : "Book a car"}</Link></Button>
          <Button asChild variant="outline" size="lg"><a href={whatsappUrl(BUSINESS_PHONE, fr ? "Bonjour Destination Paradise Mauritius Car Rental, je souhaite louer une voiture." : "Hello Destination Paradise Mauritius Car Rental, I would like to rent a car.")} target="_blank" rel="noopener noreferrer"><MessageCircle />WhatsApp</a></Button>
        </div>
      </div>
    </SiteShell>
  );
}

/** Photo grid of every active car, each with a Book now button. */
function FleetGrid({ lang }: { lang: Lang }) {
  const fr = lang === "fr";
  const cars = useQuery(carsQuery);
  return (
    <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {cars.data?.map((car) => {
        const slug = slugify(car.name);
        const from = lowestRate(car) < car.daily_price;
        const auto = car.transmission.toLowerCase().startsWith("auto");
        return (
          <article key={car.id} className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="aspect-[16/10] overflow-hidden bg-secondary"><CarImage car={car} size="thumb" className="h-full w-full" /></div>
            <div className="flex flex-1 flex-col p-5">
              <h3 className="text-lg font-semibold">
                {fr ? <Link to="/fr/cars/$slug" params={{ slug }} className="hover:text-primary">{car.name}</Link>
                  : <Link to="/cars/$slug" params={{ slug }} className="hover:text-primary">{car.name}</Link>}
              </h3>
              <p className="mt-2 flex gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Users className="h-4 w-4" />{car.seats} {fr ? "places" : "seats"}</span>
                <span className="flex items-center gap-1"><Cog className="h-4 w-4" />{fr ? (auto ? "Automatique" : "Manuelle") : car.transmission}</span>
              </p>
              <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                <p className="leading-tight">
                  <span className="block text-xs text-muted-foreground">{from ? (fr ? "À partir de" : "From") : (fr ? "Prix" : "Price")}</span>
                  <span className="text-xl font-bold text-primary">{formatMoney(lowestRate(car), car.currency)}</span>
                  <span className="text-sm text-muted-foreground">{fr ? " / jour" : " / day"}</span>
                </p>
                <Button asChild variant="coral"><Link to="/book" search={{ car: car.id }} aria-label={`${fr ? "Réserver" : "Book"} ${car.name}`}>{fr ? "Réserver" : "Book now"}<ArrowRight /></Link></Button>
              </div>
            </div>
          </article>
        );
      })}
      {cars.isLoading && [0, 1, 2].map((i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
          <div className="aspect-[16/10] animate-pulse bg-secondary" />
          <div className="space-y-3 p-5"><div className="h-5 w-2/3 animate-pulse rounded bg-secondary" /><div className="h-4 w-1/3 animate-pulse rounded bg-secondary" /><div className="h-9 w-full animate-pulse rounded bg-secondary" /></div>
        </div>
      ))}
      {!cars.isLoading && !cars.data?.length && (
        <p className="col-span-full rounded-xl border border-dashed border-border py-10 text-center text-muted-foreground">{fr ? "Nos voitures seront bientôt disponibles. Contactez-nous sur WhatsApp pour réserver." : "Our cars will be listed here soon. Message us on WhatsApp to book."}</p>
      )}
    </div>
  );
}

export function AirportPage({ lang }: { lang: Lang }) {
  const c = AIRPORT[lang];
  const fr = lang === "fr";
  return (
    <SiteShell lang={lang} altPath={fr ? "/airport-transfers" : "/fr/airport-transfers"} crumbs={[{ name: fr ? "Accueil" : "Home", path: home(lang) }, { name: c.h1, path: `${pre(lang)}/airport-transfers` }]}>
      <h1 className="text-3xl font-bold sm:text-4xl">{c.h1}</h1>
      <ServiceRequestForm service="transfer" lang={lang} top />
      <Prose h1="" sections={c.sections} />
      <h2 className="mt-8 text-xl font-bold">{fr ? "Destinations depuis l'aéroport" : "Destinations from the airport"}</h2>
      <LocationList lang={lang} />
      <BookCta lang={lang} />
    </SiteShell>
  );
}

function LocationList({ lang, except }: { lang: Lang; except?: string }) {
  return (
    <ul className="mt-3 flex flex-wrap gap-2">
      {LOCATIONS.filter((l) => l.slug !== except).map((l) => (
        <li key={l.slug}>
          {lang === "fr" ? <Link to="/fr/locations/$slug" params={{ slug: l.slug }} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-sm hover:bg-secondary"><MapPin className="h-3.5 w-3.5" />{l.fr.name}</Link>
            : <Link to="/locations/$slug" params={{ slug: l.slug }} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-sm hover:bg-secondary"><MapPin className="h-3.5 w-3.5" />{l.en.name}</Link>}
        </li>
      ))}
    </ul>
  );
}

export function FaqPage({ lang }: { lang: Lang }) {
  const fr = lang === "fr";
  const h1 = fr ? "Questions fréquentes" : "Frequently asked questions";
  return (
    <SiteShell lang={lang} altPath={fr ? "/faq" : "/fr/faq"} crumbs={[{ name: fr ? "Accueil" : "Home", path: home(lang) }, { name: h1, path: `${pre(lang)}/faq` }]}>
      <h1 className="text-3xl font-bold sm:text-4xl">{h1}</h1>
      <p className="mt-3 text-muted-foreground">{fr ? "Les réponses aux questions que nos clients posent le plus souvent avant de louer une voiture à l'île Maurice." : "Answers to the questions our customers ask most often before renting a car in Mauritius."}</p>
      <dl className="mt-6 space-y-5">
        {FAQS[lang].map((f) => (
          <div key={f.q} className="rounded-lg border border-border bg-card p-4">
            <dt className="font-bold">{f.q}</dt>
            <dd className="mt-2 leading-relaxed">{f.a}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-6">{fr ? <Link to="/fr/car-rental" className="text-primary underline">Comment fonctionne la location</Link> : <Link to="/car-rental" className="text-primary underline">How car rental works</Link>}</p>
      <BookCta lang={lang} />
    </SiteShell>
  );
}

export function ContactPage({ lang }: { lang: Lang }) {
  const fr = lang === "fr";
  const h1 = fr ? "Contact" : "Contact us";
  const wa = whatsappUrl(BUSINESS_PHONE, "Hello Destination Paradise Mauritius Car Rental, I would like to rent a car.");
  return (
    <SiteShell lang={lang} altPath={fr ? "/contact" : "/fr/contact"} crumbs={[{ name: fr ? "Accueil" : "Home", path: home(lang) }, { name: h1, path: `${pre(lang)}/contact` }]}>
      <h1 className="text-3xl font-bold sm:text-4xl">{h1}</h1>
      <p className="mt-3 text-lg text-muted-foreground">{fr
        ? "Destination Paradise Mauritius Car Rental est une agence de location de voitures familiale installée sur la côte nord-ouest de l'île Maurice. Pour réserver, poser une question sur une voiture ou organiser une remise à l'aéroport, contactez-nous directement : nous répondons nous-mêmes, sans centre d'appels."
        : "Destination Paradise Mauritius Car Rental is a local car hire business on the northwest coast of Mauritius. To book, ask about a car or arrange an airport pickup, contact us directly: you talk to us, not to a call centre."}</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="font-bold">{fr ? "Adresse" : "Address"}</h2>
          <address className="mt-1 not-italic">Royal road, Grand baie<br />Port Louis<br />Mauritius</address>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="font-bold">{fr ? "Téléphone et WhatsApp" : "Phone and WhatsApp"}</h2>
          <p className="mt-1"><a href={`tel:${BUSINESS_PHONE.replace(/\s/g, "")}`} className="inline-flex items-center gap-1 text-primary"><Phone className="h-4 w-4" />{BUSINESS_PHONE}</a></p>
          <p><a href="mailto:ravishnarrainen@gmail.com" className="text-primary">ravishnarrainen@gmail.com</a></p>
          <p><a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary"><MessageCircle className="h-4 w-4" />WhatsApp</a></p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 sm:col-span-2">
          <h2 className="font-bold">{fr ? "Horaires" : "Opening hours"}</h2>
          <p className="mt-1">{fr ? "Nos horaires d'ouverture seront bientôt publiés ici. En attendant, écrivez-nous sur WhatsApp : nous répondons dès que possible." : "Our opening hours will be published here shortly. In the meantime, send us a WhatsApp message and we will reply as soon as we can."}</p>
        </div>
      </div>
      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-bold">{fr ? "Nous trouver" : "Finding us"}</h2>
        <p className="leading-relaxed">{fr
          ? "Notre adresse : Royal road, Grand baie , Port Louis, Mauritius. Contactez-nous pour convenir du lieu de remise de votre voiture."
          : "Our address is Royal road, Grand baie , Port Louis, Mauritius. Contact us to agree where to collect your car."}</p>
        <p className="leading-relaxed">{fr
          ? "La plupart de nos clients ne passent pas à l'agence : nous remettons la voiture à l'aéroport international SSR ou à l'endroit convenu lors de la réservation. Indiquez simplement votre lieu de prise en charge dans le formulaire et nous confirmons l'heure et le lieu sur WhatsApp avec votre facture."
          : "Most customers never need to visit us: we hand over the car at SSR International Airport or at the place agreed when you book. Just choose your pickup point in the booking form and we confirm the time and place on WhatsApp along with your invoice."}</p>
        <p className="leading-relaxed">{fr
          ? "Pour une réponse rapide, précisez vos dates, la voiture souhaitée et votre lieu de séjour. Si vous arrivez en avion, ajoutez votre numéro de vol."
          : "For a quick answer, include your dates, the car you are interested in and where you are staying. If you are flying in, add your flight number."}</p>
        <p className="leading-relaxed">{fr
          ? "Après votre réservation en ligne, un message WhatsApp pré-rempli vous est proposé pour nous prévenir : il contient la voiture, la date et l'heure de prise en charge, afin que nous puissions préparer le véhicule sans attendre."
          : "After you book online, you are offered a ready-made WhatsApp message to let us know: it includes the car, the pickup date and time, so we can get the car ready without delay."}</p>
      </section>
      <p className="mt-6 flex flex-wrap gap-4">
        {fr ? <Link to="/fr/faq" className="text-primary underline">Questions fréquentes</Link> : <Link to="/faq" className="text-primary underline">Frequently asked questions</Link>}
        {fr ? <Link to="/fr/airport-transfers" className="text-primary underline">Prise en charge à l'aéroport</Link> : <Link to="/airport-transfers" className="text-primary underline">Airport pickup</Link>}
      </p>
      <BookCta lang={lang} />
    </SiteShell>
  );
}

export function LocationPage({ lang, loc }: { lang: Lang; loc: LocationEntry }) {
  const c = loc[lang];
  const fr = lang === "fr";
  return (
    <SiteShell lang={lang} altPath={`${fr ? "" : "/fr"}/locations/${loc.slug}`} crumbs={[{ name: fr ? "Accueil" : "Home", path: home(lang) }, { name: c.name, path: `${pre(lang)}/locations/${loc.slug}` }]}>
      <Prose h1={fr ? `Location de voiture à ${c.name}` : `Car rental in ${c.name}`} sections={c.sections} />
      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-bold">{fr ? `Choisir une voiture pour ${c.name}` : `Choosing a car for ${c.name}`}</h2>
        <p className="leading-relaxed">{fr
          ? `Toutes nos voitures peuvent être remises à l'aéroport ou au lieu convenu. Comparez les prix par jour ci-dessous, puis envoyez votre demande : nous confirmons la disponibilité pour ${c.name} sur WhatsApp.`
          : `Every car below can be handed over at the airport or at an agreed place. Compare the daily prices, then send your request and we confirm availability for ${c.name} on WhatsApp.`}</p>
        <CarLinks lang={lang} />
        <p>{fr ? <Link to="/fr/airport-transfers" className="text-primary underline">Prise en charge à l'aéroport SSR</Link> : <Link to="/airport-transfers" className="text-primary underline">Airport pickup at SSR (MRU)</Link>}</p>
      </section>
      <h2 className="mt-8 text-xl font-bold">{fr ? "Autres destinations" : "Other areas"}</h2>
      <LocationList lang={lang} except={loc.slug} />
      <BookCta lang={lang} />
    </SiteShell>
  );
}

export function CarPage({ lang, car }: { lang: Lang; car: Car }) {
  const fr = lang === "fr";
  const slug = slugify(car.name);
  const auto = car.transmission.toLowerCase().startsWith("auto");
  const trans = fr ? (auto ? "automatique" : "manuelle") : (auto ? "automatic" : "manual");
  const price = formatMoney(car.daily_price, car.currency);
  const from = formatMoney(lowestRate(car), car.currency);
  return (
    <SiteShell lang={lang} altPath={`${fr ? "" : "/fr"}/cars/${slug}`} crumbs={[{ name: fr ? "Accueil" : "Home", path: home(lang) }, { name: fr ? "Location" : "Car rental", path: `${pre(lang)}/car-rental` }, { name: car.name, path: `${pre(lang)}/cars/${slug}` }]}>
      <h1 className="text-3xl font-bold sm:text-4xl">{fr ? `${car.name} à louer à l'île Maurice` : `${car.name} for rent in Mauritius`}</h1>
      <div className="mt-4 aspect-[16/10] overflow-hidden rounded-lg bg-secondary"><CarImage car={car} size="main" priority className="h-full w-full" /></div>
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <span className="inline-flex items-center gap-1"><Users className="h-4 w-4" />{car.seats} {fr ? "places" : "seats"}</span>
        <span className="inline-flex items-center gap-1"><Cog className="h-4 w-4" />{fr ? "Boîte" : "Gearbox"}: {trans}</span>
        <span className="font-semibold text-primary">{price} / {fr ? "jour" : "day"}</span>
      </div>
      <PriceRangesList car={car} currency={car.currency} className="mt-3" />
      <Button asChild variant="coral" size="lg" className="mt-5"><Link to="/book" search={{ car: car.id }}>{fr ? `Réserver la ${car.name}` : `Book the ${car.name}`}</Link></Button>
      <section className="mt-8 space-y-3 leading-relaxed">
        <h2 className="text-xl font-bold">{fr ? "Caractéristiques" : "Specifications"}</h2>
        <p>{fr
          ? `La ${car.name} est une voiture de ${car.seats} places à boîte ${trans}, proposée au tarif standard de ${price} par jour. Pour les locations plus longues, le prix par jour peut baisser jusqu'à ${from} selon la durée ; le formulaire de réservation applique automatiquement le bon tarif à vos dates et affiche le total avant l'envoi.`
          : `The ${car.name} is a ${car.seats}-seat car with a ${trans} gearbox, available at a standard rate of ${price} per day. For longer rentals the daily price can drop to ${from} depending on the length of your rental; the booking form applies the right rate to your dates and shows the total before you send the request.`}</p>
        <p>{fr
          ? `Avec ${car.seats} places, elle convient ${car.seats >= 7 ? "aux familles nombreuses ou aux petits groupes qui voyagent avec des bagages" : car.seats >= 5 ? "à un couple ou à une famille qui veut explorer l'île en toute autonomie" : "aux couples et aux voyageurs seuls qui se déplacent surtout en ville et sur la côte"}. ${auto ? "La boîte automatique est appréciée par ceux qui découvrent la conduite à gauche, puisqu'il n'y a pas de levier à manier de la main gauche." : "La boîte manuelle se manie de la main gauche, puisqu'à Maurice on roule à gauche avec le volant à droite."}`
          : `With ${car.seats} seats it suits ${car.seats >= 7 ? "larger families or small groups travelling with luggage" : car.seats >= 5 ? "a couple or a family who want to explore the island independently" : "couples and solo travellers who mostly drive around towns and along the coast"}. ${auto ? "An automatic gearbox is popular with drivers who are new to driving on the left, as there is no gear lever to work with the left hand." : "The manual gearbox is operated with the left hand, because Mauritius drives on the left with right-hand-drive cars."}`}</p>
        <h2 className="text-xl font-bold">{fr ? "Prise en charge et retour" : "Pickup and return"}</h2>
        <p>{fr
          ? `Vous pouvez récupérer la ${car.name} à l'aéroport international SSR dès votre arrivée ou à un autre endroit que vous indiquez dans le formulaire. Choisissez la date et l'heure de prise en charge et de retour : le calendrier vérifie immédiatement que la voiture est libre. Nous validons ensuite la réservation et vous envoyons la facture sur WhatsApp, avec l'éventuelle caution.`
          : `You can collect the ${car.name} at SSR International Airport when you land or at another place you name in the form. Choose your pickup and return date and time and the calendar checks straight away that the car is free. We then approve the booking and send your invoice on WhatsApp, including any deposit.`}</p>
        <p>{fr
          ? "Nous sommes basés à Grand Baie, sur la côte nord-ouest : idéal pour Trou aux Biches, Grand Baie et Pereybère, mais la voiture vous emmène partout, de Port-Louis à Le Morne."
          : "We are based in Grand Baie on the northwest coast, handy for Trou aux Biches, Grand Baie and Pereybère, but the car will take you anywhere on the island, from Port Louis to Le Morne."}</p>
      </section>
      <h2 className="mt-8 text-xl font-bold">{fr ? "Où conduire" : "Where to drive"}</h2>
      <LocationList lang={lang} />
      <BookCta lang={lang} />
    </SiteShell>
  );
}

