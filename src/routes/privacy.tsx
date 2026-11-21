import { createFileRoute } from "@tanstack/react-router";
import { PrivacyPage } from "@/components/seo/PrivacyPage";
import { PRIVACY } from "@/lib/seo/privacy";
import { seoHead } from "@/lib/seo/site";

export const Route = createFileRoute("/privacy")({
  staticData: { sitemap: true },
  head: () => seoHead({ lang: "en", path: "/privacy", altPath: "/fr/privacy", title: PRIVACY.en.title, description: PRIVACY.en.description, crumbs: [{ name: "Home", path: "/" }, { name: PRIVACY.en.h1, path: "/privacy" }] }),
  component: () => <PrivacyPage lang="en" />,
});
