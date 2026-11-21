import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { SiteShell } from "./SiteShell";
import { PRIVACY, PRIVACY_UPDATED } from "@/lib/seo/privacy";
import type { Lang } from "@/lib/seo/site";

export function PrivacyPage({ lang }: { lang: Lang }) {
  const fr = lang === "fr";
  const c = PRIVACY[lang];
  const updated = new Date(PRIVACY_UPDATED).toLocaleDateString(fr ? "fr-FR" : "en-GB", { day: "numeric", month: "long", year: "numeric" });
  return (
    <SiteShell lang={lang} altPath={fr ? "/privacy" : "/fr/privacy"} crumbs={[{ name: fr ? "Accueil" : "Home", path: fr ? "/fr" : "/" }, { name: c.h1, path: fr ? "/fr/privacy" : "/privacy" }]}>
      <header className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-primary"><ShieldCheck className="h-4 w-4" />{fr ? "Vos données" : "Your data"}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{c.h1}</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{c.intro}</p>
      </header>
      <div className="mt-10 space-y-9">
        {c.sections.map((s) => (
          <section key={s.h}>
            <h2 className="text-xl font-bold">{s.h}</h2>
            <div className="mt-3 space-y-3 leading-relaxed">
              {s.p.map((p, i) => <p key={i}>{p}</p>)}
              {s.list && <ul className="list-disc space-y-1.5 pl-5">{s.list.map((li) => <li key={li}>{li}</li>)}</ul>}
            </div>
          </section>
        ))}
      </div>
      <p className="mt-10 border-t border-border pt-6 text-sm text-muted-foreground">
        {fr ? "Dernière mise à jour : " : "Last updated: "}{updated}.{" "}
        {fr ? <Link to="/fr/contact" className="text-primary underline">Nous contacter</Link> : <Link to="/contact" className="text-primary underline">Contact us</Link>}
      </p>
    </SiteShell>
  );
}
