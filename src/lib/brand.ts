import logo from "@/assets/logo.png";

export const BRAND_NAME = "Destination Paradise Mauritius Car Rental";
export const BRAND_LOGO = logo;
export const BUSINESS_PHONE = "+230 5922 4353";
export function brandLogo(source?: string | null): string {
  return source || BRAND_LOGO;
}
