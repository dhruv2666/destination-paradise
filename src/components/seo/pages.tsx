import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, Phone, MapPin, Users, Cog } from "lucide-react";
import { SiteShell, Prose } from "./SiteShell";
import { CarImage } from "@/components/CarImage";
import { PriceRangesList } from "@/components/PriceRanges";
import { Button } from "@/components/ui/button";
import { BUSINESS_PHONE } from "@/lib/brand";
import { whatsappUrl } from "@/lib/whatsapp";
import { fetchActiveCars, qk, type Car } from "@/lib/data";
import { formatMoney, lowestRate } from "@/lib/booking-math";
import { AIRPORT, CAR_RENTAL, FAQS } from "@/lib/seo/pages";
import { LOCATIONS, type LocationEntry } from "@/lib/seo/locations";
import { slugify, type Lang } from "@/lib/seo/site";

export const carsQuery = { queryKey: qk.activeCars, queryFn: fetchActiveCars };
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
  return (
    <SiteShell lang={lang} altPath={fr ? "/car-rental" : "/fr/car-rental"} crumbs={[{ name: fr ? "Accueil" : "Home", path: home(lang) }, { name: c.h1, path: `${pre(lang)}/car-rental` }]}>
      <Prose h1={c.h1} intro={c.intro} sections={c.sections} />
      <h2 className="mt-8 text-xl font-bold">{fr ? "Nos voitures" : "Our cars"}</h2>
      <div className="mt-3"><CarLinks lang={lang} /></div>
      <p className="mt-6">{fr ? "Vous arrivez en avion ? " : "Arriving by plane? "}{fr ? <Link to="/fr/airport-transfers" className="text-primary underline">Prise en charge à l'aéroport</Link> : <Link to="/airport-transfers" className="text-primary underline">See how airport pickup works</Link>}.</p>
      <BookCta lang={lang} />
    </SiteShell>
  );
}

export function AirportPage({ lang }: { lang: Lang }) {
  const c = AIRPORT[lang];
  const fr = lang === "fr";
  return (
    <SiteShell lang={lang} altPath={fr ? "/airport-transfers" : "/fr/airport-transfers"} crumbs={[{ name: fr ? "Accueil" : "Home", path: home(lang) }, { name: c.h1, path: `${pre(lang)}/airport-transfers` }]}>
      <Prose h1={c.h1} intro={c.intro} sections={c.sections} />
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

export function findCar(cars: Car[], slug: string) {
  return cars.find((c) => slugify(c.name) === slug);
}
