import { createFileRoute } from "@tanstack/react-router";
import { ContactPage } from "@/components/seo/pages";
import { seoHead } from "@/lib/seo/site";

export const Route = createFileRoute("/contact")({
  staticData: { sitemap: true },
  head: () => seoHead({ lang: "en", path: "/contact", altPath: "/fr/contact", title: "Contact Destination Paradise Mauritius Car Rental — Grand Baie, Mauritius", description: "Address, phone and WhatsApp for Destination Paradise Mauritius Car Rental on the Royal road, Grand Baie, Mauritius. Book a car or an airport pickup.", crumbs: [{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }] }),
  component: () => <ContactPage lang="en" />,
});
