import { Link } from "@tanstack/react-router";
import { ArrowRight, CarFront, Check, Gem, PlaneLanding } from "lucide-react";
import type { Lang } from "@/lib/seo/site";

/** The three homepage service bars: rental, transfers and weddings. */
export function ServiceBars({ lang }: { lang: Lang }) {
  const fr = lang === "fr";
  const items = [
    { icon: CarFront, tone: "bg-primary text-primary-foreground", href: fr ? "/fr/car-rental" : "/car-rental", title: fr ? "Location de voitures" : "Self-Drive Car Rental", text: fr ? "Choisissez vos dates et réservez en ligne." : "Pick your dates and book online.", points: fr ? ["Disponibilité en direct", "Livraison à l’aéroport"] : ["Live availability", "Airport delivery"], cta: fr ? "Voir les voitures" : "View cars" },
    { icon: PlaneLanding, tone: "bg-coral text-coral-foreground", href: fr ? "/fr/airport-transfers" : "/airport-transfers", title: fr ? "Transferts aéroport & île" : "Airport & Island Transfers", text: fr ? "Accueil à l’aéroport SSR, trajets partout." : "Meet & greet at SSR, rides island-wide.", points: fr ? ["Suivi des vols", "Devis rapide"] : ["Flight tracking", "Quick quote"], cta: fr ? "Demander un transfert" : "Book a transfer" },
    { icon: Gem, tone: "bg-gold text-gold-foreground", href: fr ? "/fr/mariage" : "/wedding-cars", title: fr ? "Voitures de mariage" : "Wedding Cars", text: fr ? "BMW avec chauffeur, décorées pour le jour J." : "Chauffeur-driven BMWs for your big day.", points: fr ? ["Chauffeur inclus", "Rubans & fleurs"] : ["Chauffeur included", "Ribbons & flowers"], cta: fr ? "Demander un devis" : "Request a quote" },
  ];
  return (
    <section aria-labelledby="services-title" className="mb-12">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-coral">{fr ? "Nos services" : "Our services"}</p>
      <h2 id="services-title" className="mt-1 text-2xl font-bold">{fr ? "Tout pour votre séjour à Maurice" : "Everything for your stay in Mauritius"}</h2>
      <div className="mt-5 grid gap-3">
        {items.map((s) => (
          <Link key={s.href} to={s.href} className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg sm:gap-5 sm:p-5">
            <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${s.tone}`}><s.icon className="h-7 w-7" strokeWidth={1.75} /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-lg font-bold leading-tight">{s.title}</span>
              <span className="mt-0.5 block text-sm text-muted-foreground">{s.text}</span>
              <span className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-primary">
                {s.points.map((p) => <span key={p} className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5" />{p}</span>)}
              </span>
            </span>
            <span className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-primary sm:inline-flex">{s.cta}</span>
            <ArrowRight className="h-5 w-5 shrink-0 text-primary transition-transform group-hover:translate-x-1" />
          </Link>
        ))}
      </div>
    </section>
  );
}
