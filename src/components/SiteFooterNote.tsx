import { Link } from "@tanstack/react-router";
import { BRAND_NAME } from "@/lib/brand";

/** Copyright line; it quietly doubles as the owner sign-in entrance. */
export function SiteFooterNote() {
  return (
    <p className="mt-6 text-xs text-muted-foreground">
      <Link to="/auth" className="cursor-text text-muted-foreground no-underline" aria-label={`© ${new Date().getFullYear()} ${BRAND_NAME}`}>
        © {new Date().getFullYear()} {BRAND_NAME}
      </Link>
      . All rights reserved.
    </p>
  );
}
