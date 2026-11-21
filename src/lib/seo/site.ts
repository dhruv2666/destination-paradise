import { BRAND_LOGO, BRAND_NAME, BUSINESS_PHONE } from "@/lib/brand";

export const SITE_URL = "http://destinationparadiseltd.com";
export type Lang = "en" | "fr";
export const ADDRESS = {
  street: "Royal road",
  locality: "Grand baie",
  country: "MU",
  region: "Port Louis",
};

export function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

/** AutoRental business schema shown on every public page. Opening hours are omitted until the owner confirms them. */
export function businessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["AutoRental", "LocalBusiness"],
    "@id": `${SITE_URL}/#business`,
    name: BRAND_NAME,
    url: SITE_URL,
    logo: BRAND_LOGO,
    image: BRAND_LOGO,
    telephone: BUSINESS_PHONE,
    priceRange: "Rs",
    address: { "@type": "PostalAddress", streetAddress: ADDRESS.street, addressLocality: ADDRESS.locality, addressRegion: ADDRESS.region, addressCountry: ADDRESS.country },
    areaServed: { "@type": "Country", name: "Mauritius" },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: `${SITE_URL}${it.path}` })),
  };
}

type HeadInput = { lang: Lang; path: string; altPath: string; title: string; description: string; crumbs?: { name: string; path: string }[]; extra?: object[]; type?: string };

/** Per-page head: unique title/description, canonical, hreflang pair and JSON-LD. */
export function seoHead({ lang, path, altPath, title, description, crumbs, extra = [], type = "website" }: HeadInput) {
  const en = lang === "en" ? path : altPath;
  const fr = lang === "fr" ? path : altPath;
  const json = [...(crumbs ? [breadcrumbJsonLd(crumbs)] : []), ...extra];
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: type },
      { property: "og:url", content: `${SITE_URL}${path}` },
      { property: "og:locale", content: lang === "fr" ? "fr_FR" : "en_GB" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: `${SITE_URL}${path}` },
      { rel: "alternate", hrefLang: "en", href: `${SITE_URL}${en}` },
      { rel: "alternate", hrefLang: "fr", href: `${SITE_URL}${fr}` },
      { rel: "alternate", hrefLang: "x-default", href: `${SITE_URL}${en}` },
    ],
    scripts: json.map((j) => ({ type: "application/ld+json", children: JSON.stringify(j) })),
  };
}
