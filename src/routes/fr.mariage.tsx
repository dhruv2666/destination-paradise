import { createFileRoute } from "@tanstack/react-router";
import { WeddingPage } from "@/components/seo/WeddingPage";
import { seoHead } from "@/lib/seo/site";

export const Route = createFileRoute("/fr/mariage")({
  staticData: { sitemap: true },
  head: () => seoHead({ lang: "fr", path: "/fr/mariage", altPath: "/wedding-cars", title: "Voitures de mariage à l'île Maurice — Destination Paradise", description: "BMW X5 et BMW Série 7 avec chauffeur pour votre mariage à l'île Maurice, décorées de rubans et de fleurs. Prix sur demande — devis sur WhatsApp.", crumbs: [{ name: "Accueil", path: "/fr" }, { name: "Voitures de mariage", path: "/fr/mariage" }] }),
  component: () => <WeddingPage lang="fr" />,
});
