import { createFileRoute } from "@tanstack/react-router";
import { ContactPage } from "@/components/seo/pages";
import { seoHead } from "@/lib/seo/site";

export const Route = createFileRoute("/fr/contact")({
  staticData: { sitemap: true },
  head: () => seoHead({ lang: "fr", path: "/fr/contact", altPath: "/contact", title: "Contacter Destination Paradise Mauritius Car Rental — Grand Baie, Maurice", description: "Adresse, téléphone et WhatsApp de Destination Paradise Mauritius Car Rental, Royal road, Grand Baie, île Maurice. Réservez une voiture ou une remise à l'aéroport.", crumbs: [{ name: "Accueil", path: "/fr" }, { name: "Contact", path: "/fr/contact" }] }),
  component: () => <ContactPage lang="fr" />,
});
