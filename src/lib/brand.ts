import logo from "@/assets/destination-paradise-actual-logo.png.asset.json";

export const BRAND_NAME = "Destination Paradise Mauritius Car Rental";
export const BRAND_LOGO = logo.url;
export const BUSINESS_PHONE = "+230 5922 4353";
export function brandLogo(source?: string | null): string {
  return source || BRAND_LOGO;
}
