import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Car = Tables<"cars">;
export type Booking = Tables<"bookings">;
export type Settings = Tables<"settings">;
export type PublicSettings = Pick<
  Settings,
  "company_name" | "logo_url" | "address" | "phone" | "company_email" | "currency" | "terms_html"
>;
export type BookingWithCar = Booking & { cars: Pick<Car, "id" | "name" | "plate"> | null };

export const qk = {
  publicSettings: ["public-settings"] as const,
  settings: ["settings"] as const,
  activeCars: ["cars", "active"] as const,
  allCars: ["cars", "all"] as const,
  bookings: ["bookings"] as const,
};

export async function fetchPublicSettings(): Promise<PublicSettings> {
  const { data, error } = await supabase.rpc("public_settings");
  if (error) throw error;
  const row = (data as PublicSettings[] | null)?.[0];
  return (
    row ?? {
      company_name: "Victoria Car rental",
      logo_url: null,
      address: "Coastal Road, Pointe Aux Piment, Grande Pointe aux Piments, Mauritius, 21304",
      phone: "+230 5920 6432",
      company_email: "",
      currency: "Rs",
      terms_html: "",
    }
  );
}

export async function fetchSettings(): Promise<Settings> {
  const { data, error } = await supabase.from("settings").select("*").eq("id", 1).maybeSingle();
  if (error) throw error;
  return data ?? {
    id: 1, company_name: "Victoria Car rental", logo_url: null,
    address: "Coastal Road, Pointe Aux Piment, Grande Pointe aux Piments, Mauritius, 21304", phone: "+230 5920 6432",
    company_email: "", currency: "Rs", owner_email: "", terms_html: "",
    whatsapp_template: "Hello {name}, your booking for {car} from {from} to {to} is confirmed. Total: {total}. Invoice and terms: {link}",
    updated_at: new Date().toISOString(),
  };
}

export async function fetchActiveCars(): Promise<Car[]> {
  const { data, error } = await supabase.from("cars").select("*").eq("active", true).order("name");
  if (error) throw error;
  return data;
}

export async function fetchAllCars(): Promise<Car[]> {
  const { data, error } = await supabase
    .from("cars")
    .select("*")
    .order("active", { ascending: false })
    .order("name");
  if (error) throw error;
  return data;
}

export async function fetchBookings(): Promise<BookingWithCar[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select("*, cars(id, name, plate)")
    .order("pickup_at", { ascending: false });
  if (error) throw error;
  return data as BookingWithCar[];
}

export async function fetchCarUnavailable(carId: string) {
  const { data, error } = await supabase.rpc("car_unavailable", { _car_id: carId });
  if (error) throw error;
  return (data ?? []) as { pickup_at: string; return_at: string }[];
}

export function friendlyError(e: unknown): string {
  const msg = e instanceof Error ? e.message : typeof e === "object" && e && "message" in e ? String((e as { message: unknown }).message) : String(e);
  if (msg.includes("already booked")) return "This car is already booked for those dates.";
  if (msg.includes("Return must be after")) return "Return must be after pickup.";
  if (msg.includes("Pickup location is required")) return "Please choose where you want to pick up the car.";
  if (msg.includes("where the car will be picked up")) return "Please say where the car will be picked up.";
  return msg;
}
