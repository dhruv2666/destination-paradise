import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Heart, MessageCircle, Sparkles, Clock, ShieldCheck } from "lucide-react";
import { SiteShell } from "./SiteShell";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { ServiceRequestForm } from "@/components/ServiceRequestForm";
import { weddingMediaQuery } from "@/lib/services.functions";
import { WEDDING_CARS } from "@/lib/services";
import { BUSINESS_PHONE } from "@/lib/brand";
import { whatsappUrl } from "@/lib/whatsapp";
import type { Lang } from "@/lib/seo/site";
import x5Photo from "@/assets/wedding-bmw-x5-1536.webp";
import x5PhotoSmall from "@/assets/wedding-bmw-x5-768.webp";
import x5PhotoMedium from "@/assets/wedding-bmw-x5-1152.webp";
import series7Photo from "@/assets/wedding-bmw-7series-1536.webp";
import series7PhotoSmall from "@/assets/wedding-bmw-7series-768.webp";
import series7PhotoMedium from "@/assets/wedding-bmw-7series-1152.webp";

const PLACEHOLDERS: Record<string, string> = { hero: x5Photo, x5: x5Photo, "7series": series7Photo };
// Responsive versions of the built-in photos, so phones download the smaller file.
const PLACEHOLDER_SRCSET: Record<string, string> = {
  hero: `${x5PhotoSmall} 768w, ${x5PhotoMedium} 1152w, ${x5Photo} 1536w`,
  x5: `${x5PhotoSmall} 768w, ${x5PhotoMedium} 1152w, ${x5Photo} 1536w`,
  "7series": `${series7PhotoSmall} 768w, ${series7PhotoMedium} 1152w, ${series7Photo} 1536w`,
};
const SLOT_FOR_CAR: Record<(typeof WEDDING_CARS)[number], string> = { "BMW X5": "x5", "BMW 7 Series": "7series" };

const T = {
  en: {
    h1: "Wedding Cars in Mauritius",
    tagline: "Arrive in style on your special day",
    intro: "Chauffeur-driven luxury cars for your wedding day, decorated with ribbons and flowers, anywhere in Mauritius.",
    fleet: "Our wedding fleet",
    priceNote: "Price on request",
    quote: "Request a quote",
    included: "Every wedding hire includes",
    perks: [
      { icon: Heart, title: "Decorated car", text: "White ribbons and a fresh floral arrangement matched to your colours." },
      { icon: Clock, title: "Flexible hours", text: "From the ceremony to the reception — hire by the hour, up to the full day." },
      { icon: ShieldCheck, title: "Professional chauffeur", text: "A discreet, experienced driver who knows every venue on the island." },
    ],
    carBlurbs: {
      "BMW X5": "A commanding white SUV with space for the dress, the flowers and the photographer's shots.",
      "BMW 7 Series": "Our most elegant saloon — quiet, spacious and unmistakably premium for the couple's arrival.",
    } as Record<string, string>,
  },
  fr: {
    h1: "Voitures de mariage à l'île Maurice",
    tagline: "Arrivez avec élégance le jour J",
    intro: "Des voitures de luxe avec chauffeur pour votre mariage, décorées de rubans et de fleurs, partout à l'île Maurice.",
    fleet: "Notre flotte mariage",
    priceNote: "Prix sur demande",
    quote: "Demander un devis",
    included: "Chaque location mariage comprend",
    perks: [
      { icon: Heart, title: "Voiture décorée", text: "Rubans blancs et composition florale fraîche assortis à vos couleurs." },
      { icon: Clock, title: "Horaires flexibles", text: "De la cérémonie à la réception — location à l'heure ou à la journée." },
      { icon: ShieldCheck, title: "Chauffeur professionnel", text: "Un chauffeur discret et expérimenté qui connaît chaque lieu de réception de l'île." },
    ],
    carBlurbs: {
      "BMW X5": "Un SUV blanc imposant, avec de la place pour la robe, les fleurs et les photos du photographe.",
      "BMW 7 Series": "Notre berline la plus élégante — silencieuse, spacieuse et résolument haut de gamme pour l'arrivée des mariés.",
    } as Record<string, string>,
  },
};

export function WeddingPage({ lang }: { lang: Lang }) {
  const fr = lang === "fr";
  const t = T[lang];
  const media = useQuery(weddingMediaQuery);
  const photoFor = (slot: string) => {
    const row = media.data?.find((m) => m.slot === slot && !m.placeholder && m.image_url);
    return row?.image_url || PLACEHOLDERS[slot];
  };
  // Only the built-in photos have smaller versions; owner-uploaded photos are used as-is.
  const srcSetFor = (slot: string) => (photoFor(slot) === PLACEHOLDERS[slot] ? PLACEHOLDER_SRCSET[slot] : undefined);
  const hero = photoFor("hero");
  const wa = whatsappUrl(BUSINESS_PHONE, fr ? "Bonjour Destination Paradise, je souhaite un devis pour une voiture de mariage." : "Hello Destination Paradise, I would like a quote for a wedding car.");

  return (
    <SiteShell lang={lang} altPath={fr ? "/wedding-cars" : "/fr/mariage"} crumbs={[{ name: fr ? "Accueil" : "Home", path: fr ? "/fr" : "/" }, { name: t.h1, path: fr ? "/fr/mariage" : "/wedding-cars" }]}>
      {/* Hero */}
      <section className="relative isolate -mx-4 -mt-6 overflow-hidden text-on-photo">
        <img sizes="100vw" srcSet={srcSetFor("hero")} src={hero} alt={fr ? "BMW X5 blanc décoré pour un mariage au bord du lagon à l'île Maurice" : "White BMW X5 decorated for a wedding by the lagoon in Mauritius"} width={1536} height={1024} loading="eager" fetchPriority="high" decoding="async" className="absolute inset-0 -z-20 h-full w-full object-cover object-center" />
        <div className="coastal-shade absolute inset-0 -z-10" />
        <div className="coastal-content px-4 py-16 sm:py-24">
          <p className="flex items-center gap-2 text-sm font-semibold"><Sparkles className="h-4 w-4" />{t.tagline}</p>
          <h1 className="wedding-heading mt-4 max-w-xl text-4xl !text-on-photo sm:text-5xl">{t.h1}</h1>
          <p className="mt-4 max-w-md text-base leading-relaxed sm:text-lg">{t.intro}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild variant="gold" size="lg"><a href="#service-request">{t.quote}</a></Button>
            <Button asChild variant="coastal" size="lg"><a href={wa} target="_blank" rel="noopener noreferrer"><MessageCircle />WhatsApp</a></Button>
          </div>
        </div>
      </section>

      {/* Fleet */}
      <Reveal><section className="mt-10">
        <h2 className="wedding-heading text-3xl">{t.fleet}</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {WEDDING_CARS.map((car) => {
            const slot = SLOT_FOR_CAR[car];
            return (
              <article key={car} className="wedding-card group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="aspect-[3/2] overflow-hidden bg-secondary">
                  <img sizes="(min-width: 640px) 50vw, 100vw" srcSet={srcSetFor(slot)} src={photoFor(slot)} alt={fr ? `${car} décorée pour un mariage` : `${car} decorated for a wedding`} width={1536} height={1024} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <h3 className="wedding-heading text-xl">{car}</h3>
                    <span className="text-sm font-semibold text-gold">{t.priceNote}</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.carBlurbs[car]}</p>
                  <ul className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">{(fr ? ["Chauffeur inclus", "Rubans et décoration sur demande"] : ["Chauffeur included", "Ribbons & décor on request"]).map((b) => <li key={b} className="rounded-full bg-gold-soft px-2.5 py-1 text-primary">{b}</li>)}</ul>
                  <Button asChild variant="gold" size="sm" className="mt-3"><a href="#service-request">{t.quote}</a></Button>
                </div>
              </article>
            );
          })}
        </div>
      </section></Reveal>

      {/* Perks */}
      <Reveal><section className="mt-10 rounded-xl bg-gold-soft p-5 sm:p-7">
        <h2 className="wedding-heading text-2xl">{t.included}</h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-3">
          {t.perks.map((p) => (
            <li key={p.title} className="space-y-1.5">
              <p className="flex items-center gap-2 font-semibold"><p.icon className="h-5 w-5 text-gold" />{p.title}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{p.text}</p>
            </li>
          ))}
        </ul>
      </section></Reveal>

      {/* How it works */}
      <Reveal><section className="mt-10">
        <h2 className="wedding-heading text-2xl">{fr ? "Comment ça marche" : "How it works"}</h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-3">
          {(fr ? ["Envoyez date, lieux et durée", "Nous répondons avec votre devis sur WhatsApp", "Votre chauffeur arrive, voiture décorée"] : ["Send your date, places and hours", "We reply on WhatsApp with your quote", "Your chauffeur arrives, car decorated"]).map((step, i) => (
            <li key={step} className="wedding-card flex items-start gap-3 p-4"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{i + 1}</span><span className="text-sm font-medium leading-snug">{step}</span></li>
          ))}
        </ol>
      </section></Reveal>

      {/* Quote form */}
      <ServiceRequestForm service="wedding" lang={lang} />

      <p className="mt-8 text-sm text-muted-foreground">
        {fr ? <>Vous cherchez plutôt une <Link to="/fr/car-rental" className="text-primary underline">location de voiture</Link> ou un <Link to="/fr/airport-transfers" className="text-primary underline">transfert aéroport</Link> ?</>
          : <>Looking for <Link to="/car-rental" className="text-primary underline">car rental</Link> or an <Link to="/airport-transfers" className="text-primary underline">airport transfer</Link> instead?</>}
      </p>
    </SiteShell>
  );
}
