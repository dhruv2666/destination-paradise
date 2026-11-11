import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { MessageCircle, Phone } from "lucide-react";
import { BRAND_LOGO, BRAND_NAME, BUSINESS_PHONE } from "@/lib/brand";
import { whatsappUrl } from "@/lib/whatsapp";
import { LOCATIONS } from "@/lib/seo/locations";
import type { Lang } from "@/lib/seo/site";

const T = {
  en: { rental: "Car rental", airport: "Airport pickup", faq: "FAQ", contact: "Contact", book: "Book a car", areas: "Areas we serve", switch: "Français", home: "Home", address: "Address" },
  fr: { rental: "Location", airport: "Aéroport", faq: "FAQ", contact: "Contact", book: "Réserver", areas: "Zones desservies", switch: "English", home: "Accueil", address: "Adresse" },
};

export function SiteShell({ lang, altPath, crumbs, children }: { lang: Lang; altPath: string; crumbs?: { name: string; path: string }[]; children: ReactNode }) {
  const t = T[lang];
  const fr = lang === "fr";
  return (
    <div lang={lang} className="min-h-screen bg-background">
      <header className="border-b border-border bg-card py-3 pr-4">
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          {fr ? (
            <Link to="/fr"><img src={BRAND_LOGO} alt={`${BRAND_NAME} logo`} width={144} height={49} loading="eager" decoding="async" className="h-12 w-36 object-contain object-left" /></Link>
          ) : (
            <Link to="/"><img src={BRAND_LOGO} alt={`${BRAND_NAME} logo`} width={144} height={49} loading="eager" decoding="async" className="h-12 w-36 object-contain object-left" /></Link>
          )}
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold">
            {fr ? (
              <>
                <Link to="/fr/car-rental" className="hover:text-primary">{t.rental}</Link>
                <Link to="/fr/airport-transfers" className="hover:text-primary">{t.airport}</Link>
                <Link to="/fr/faq" className="hover:text-primary">{t.faq}</Link>
                <Link to="/fr/contact" className="hover:text-primary">{t.contact}</Link>
              </>
            ) : (
              <>
                <Link to="/car-rental" className="hover:text-primary">{t.rental}</Link>
                <Link to="/airport-transfers" className="hover:text-primary">{t.airport}</Link>
                <Link to="/faq" className="hover:text-primary">{t.faq}</Link>
                <Link to="/contact" className="hover:text-primary">{t.contact}</Link>
              </>
            )}
            <a href={altPath} hrefLang={fr ? "en" : "fr"} className="text-primary">{t.switch}</a>
            <Link to="/book" search={{}} className="rounded-md bg-coral px-3 py-1.5 text-coral-foreground">{t.book}</Link>
          </nav>
        </div>
      </header>
      {crumbs && (
        <nav aria-label="Breadcrumb" className="mx-auto max-w-3xl px-4 pt-4 text-sm text-muted-foreground">
          {crumbs.map((c, i) => (
            <span key={c.path}>{i > 0 && " / "}{i === crumbs.length - 1 ? <span>{c.name}</span> : <a href={c.path} className="hover:text-primary">{c.name}</a>}</span>
          ))}
        </nav>
      )}
      <main className="mx-auto max-w-3xl px-4 pb-12 pt-6">{children}</main>
      <footer className="border-t border-border bg-card px-4 py-8 text-sm">
        <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2">
          <div>
            <p className="font-semibold">{BRAND_NAME}</p>
            <p className="mt-1 text-muted-foreground">Royal road, Grand baie , Port Louis, Mauritius</p>
            <p className="mt-1"><a href="mailto:ravishnarrainen@gmail.com" className="text-primary">ravishnarrainen@gmail.com</a></p>
            <p className="mt-2 flex flex-wrap gap-3">
              <a href={`tel:${BUSINESS_PHONE.replace(/\s/g, "")}`} className="inline-flex items-center gap-1 text-primary"><Phone className="h-4 w-4" />{BUSINESS_PHONE}</a>
              <a href={whatsappUrl(BUSINESS_PHONE, "Hello Destination Paradise Mauritius Car Rental, I would like to rent a car.")} className="inline-flex items-center gap-1 text-primary" target="_blank" rel="noopener noreferrer"><MessageCircle className="h-4 w-4" />WhatsApp</a>
            </p>
          </div>
          <div>
            <p className="font-semibold">{t.areas}</p>
            <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
              {LOCATIONS.map((l) => (
                <li key={l.slug}>
                  {fr ? <Link to="/fr/locations/$slug" params={{ slug: l.slug }} className="text-primary">{l.fr.name}</Link>
                    : <Link to="/locations/$slug" params={{ slug: l.slug }} className="text-primary">{l.en.name}</Link>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function Prose({ h1, intro, sections }: { h1: string; intro?: string; sections: { h: string; p: string[] }[] }) {
  return (
    <article className="space-y-6">
      <h1 className="text-3xl font-bold sm:text-4xl">{h1}</h1>
      {intro && <p className="text-lg leading-relaxed text-muted-foreground">{intro}</p>}
      {sections.map((s) => (
        <section key={s.h} className="space-y-3">
          <h2 className="text-xl font-bold">{s.h}</h2>
          {s.p.map((p, i) => <p key={i} className="leading-relaxed">{p}</p>)}
        </section>
      ))}
    </article>
  );
}
