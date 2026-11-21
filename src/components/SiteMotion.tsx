import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { Button } from "./ui/button";
import { BUSINESS_PHONE } from "@/lib/brand";
import { whatsappUrl } from "@/lib/whatsapp";

/**
 * Site-wide motion: sticky-header shrink on scroll, WhatsApp pulse, and
 * reveal-on-scroll for elements a <Reveal> component marked with .reveal
 * after hydration. This component never writes classes itself, so the
 * server-rendered HTML always matches the client.
 */
export function SiteMotion() {
  const { pathname } = useLocation();
  useEffect(() => {
    const scroll = () => document.documentElement.classList.toggle("site-scrolled", window.scrollY > 40);
    scroll();
    window.addEventListener("scroll", scroll, { passive: true });
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("revealed"); observer.unobserve(e.target); } }),
      { threshold: 0.05 },
    );
    const watch = () => document.querySelectorAll(".reveal:not(.revealed)").forEach((el) => observer.observe(el));
    watch();
    const mutations = new MutationObserver(watch);
    mutations.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
    return () => { observer.disconnect(); mutations.disconnect(); window.removeEventListener("scroll", scroll); };
  }, [pathname]);
  const fr = pathname.startsWith("/fr");
  if (pathname.startsWith("/admin") || pathname.startsWith("/auth")) return null;
  const label = fr ? "Écrivez-nous sur WhatsApp" : "Chat with us on WhatsApp";
  return (
    // On phones the booking form needs the whole screen, so the button only shows there on larger screens.
    <div className={`group fixed bottom-5 right-4 z-40 items-center gap-3 sm:bottom-6 sm:right-6 ${pathname.startsWith("/book") ? "hidden sm:flex" : "flex"}`}>
      <span className="pointer-events-none hidden rounded-full bg-card px-3 py-1.5 text-sm font-medium shadow-card opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:block">{label}</span>
      <span className="whatsapp-ripple relative flex">
        <Button asChild variant="whatsapp" size="icon" className="whatsapp-float relative z-[1] h-14 w-14 rounded-full shadow-lg [&_svg]:size-7" aria-label={label}>
          <a href={whatsappUrl(BUSINESS_PHONE, fr ? "Bonjour, je souhaite un devis pour vos services." : "Hello, I would like to enquire about your services.")} target="_blank" rel="noopener noreferrer"><MessageCircle /></a>
        </Button>
      </span>
    </div>
  );
}
