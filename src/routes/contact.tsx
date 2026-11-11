import { createFileRoute } from "@tanstack/react-router";
import { ContactPage } from "@/components/seo/pages";
import { seoHead } from "@/lib/seo/site";

export const Route = createFileRoute("/contact")({
  staticData: { sitemap: true },
  head: () => seoHead({ lang: "en", path: "/contact", altPath: "/fr/contact", title: "Contact Victoria Car rental — Pointe aux Piments, Mauritius", description: "Address, phone and WhatsApp for Victoria Car rental on the Coastal Road, Pointe aux Piments, Mauritius. Book a car or an airport pickup.", crumbs: [{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }] }),
  component: () => <ContactPage lang="en" />,
});
