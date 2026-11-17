import { createFileRoute } from "@tanstack/react-router";
import { WeddingPage } from "@/components/seo/WeddingPage";
import { seoHead } from "@/lib/seo/site";

export const Route = createFileRoute("/wedding-cars")({
  staticData: { sitemap: true },
  head: () => seoHead({ lang: "en", path: "/wedding-cars", altPath: "/fr/mariage", title: "Wedding Cars in Mauritius — Destination Paradise", description: "Chauffeur-driven BMW X5 and BMW 7 Series wedding cars in Mauritius, decorated with ribbons and flowers. Price on request — get your quote on WhatsApp.", crumbs: [{ name: "Home", path: "/" }, { name: "Wedding Cars", path: "/wedding-cars" }] }),
  component: () => <WeddingPage lang="en" />,
});
