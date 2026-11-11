import { createFileRoute } from "@tanstack/react-router";
import { FaqPage } from "@/components/seo/pages";
import { FAQS } from "@/lib/seo/pages";
import { seoHead } from "@/lib/seo/site";

export const Route = createFileRoute("/faq")({
  staticData: { sitemap: true },
  head: () => seoHead({
    lang: "en", path: "/faq", altPath: "/fr/faq",
    title: "Car rental FAQ Mauritius — licence, deposit, airport | Destination Paradise Mauritius Car Rental",
    description: "Answers about driving licences, left-hand traffic, minimum age, deposits, child seats, airport pickup and payment when renting a car in Mauritius.",
    crumbs: [{ name: "Home", path: "/" }, { name: "FAQ", path: "/faq" }],
    extra: [{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQS.en.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }],
  }),
  component: () => <FaqPage lang="en" />,
});
