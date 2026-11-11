import { createFileRoute } from "@tanstack/react-router";
import { FaqPage } from "@/components/seo/pages";
import { FAQS } from "@/lib/seo/pages";
import { seoHead } from "@/lib/seo/site";

export const Route = createFileRoute("/fr/faq")({
  staticData: { sitemap: true },
  head: () => seoHead({
    lang: "fr", path: "/fr/faq", altPath: "/faq",
    title: "FAQ location de voiture à Maurice — permis, caution, aéroport | Destination Paradise Mauritius Car Rental",
    description: "Réponses sur le permis, la conduite à gauche, l'âge minimum, la caution, les sièges enfant, l'aéroport et le paiement pour louer une voiture à Maurice.",
    crumbs: [{ name: "Accueil", path: "/fr" }, { name: "FAQ", path: "/fr/faq" }],
    extra: [{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQS.fr.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }],
  }),
  component: () => <FaqPage lang="fr" />,
});
