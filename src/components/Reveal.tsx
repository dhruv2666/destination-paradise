import { useEffect, useRef, type ReactNode } from "react";

/**
 * Marks its child section for reveal-on-scroll. The .reveal class is added
 * in useEffect (after hydration) so server and client HTML always match;
 * SiteMotion's observer then adds .revealed when it scrolls into view.
 * With prefers-reduced-motion the CSS transition is disabled entirely.
 */
export function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) el.classList.add("reveal", "revealed");
    else el.classList.add("reveal");
  }, []);
  return <div ref={ref} className={className}>{children}</div>;
}
