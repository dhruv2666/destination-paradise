import logo from "@/assets/victoria-car-rental-logo.png.asset.json";

export const BRAND_NAME = "Victoria Car rental";
export const BRAND_LOGO = logo.url;
export const BUSINESS_PHONE = "+230 5920 6432";
export function brandLogo(source?: string | null): string {
  return source || BRAND_LOGO;
}
