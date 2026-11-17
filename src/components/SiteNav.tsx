import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { Lang } from "@/lib/seo/site";

/** Shared header nav: language switch always top-right, all links in a 3-line pop-up menu. */
export function SiteNav({ lang, altPath }: { lang: Lang; altPath: string }) {
  const fr = lang === "fr";
  const [open, setOpen] = useState(false);
  const links: [string, string][] = fr
    ? [["/fr/car-rental", "Location de voiture"], ["/fr/airport-transfers", "Transferts aéroport"], ["/fr/mariage", "Voitures de mariage"], ["/fr/faq", "FAQ"], ["/fr/contact", "Contact"]]
    : [["/car-rental", "Car rental"], ["/airport-transfers", "Airport transfers"], ["/wedding-cars", "Wedding cars"], ["/faq", "FAQ"], ["/contact", "Contact"]];
  return (
    <div className="flex items-center gap-2">
      <a href={altPath} hrefLang={fr ? "en" : "fr"} className="rounded-md border border-border px-2.5 py-1.5 text-sm font-semibold text-primary">{fr ? "English" : "Français"}</a>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button type="button" aria-label={fr ? "Ouvrir le menu" : "Open menu"} className="grid h-10 w-10 place-items-center rounded-md border border-border hover:bg-secondary"><Menu className="h-5 w-5" /></button>
        </SheetTrigger>
        <SheetContent side="right" className="w-72">
          <SheetTitle className="mb-4">Menu</SheetTitle>
          <nav className="flex flex-col gap-1 text-base font-semibold">
            {links.map(([to, label]) => <Link key={to} to={to} onClick={() => setOpen(false)} className="rounded-md px-3 py-3 hover:bg-secondary">{label}</Link>)}
            <Link to="/book" search={{}} onClick={() => setOpen(false)} className="mt-3 rounded-md bg-coral px-3 py-3 text-center text-coral-foreground">{fr ? "Réserver une voiture" : "Book a car"}</Link>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
