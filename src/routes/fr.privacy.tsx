import { createFileRoute } from "@tanstack/react-router";
import { PrivacyPage } from "@/components/seo/PrivacyPage";
import { PRIVACY } from "@/lib/seo/privacy";
import { seoHead } from "@/lib/seo/site";

export const Route = createFileRoute("/fr/privacy")({
  staticData: { sitemap: true },
  head: () => seoHead({ lang: "fr", path: "/fr/privacy", altPath: "/privacy", title: PRIVACY.fr.title, description: PRIVACY.fr.description, crumbs: [{ name: "Accueil", path: "/fr" }, { name: PRIVACY.fr.h1, path: "/fr/privacy" }] }),
  component: () => <PrivacyPage lang="fr" />,
});
