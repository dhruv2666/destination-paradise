import { z } from "zod";
import { mauritiusDate } from "./holidays";
import { BUSINESS_PHONE } from "./brand";
import { whatsappUrl } from "./whatsapp";

export const WEDDING_CARS = ["BMW X5", "BMW 7 Series"] as const;
export const SERVICE_STATUSES = ["new", "quoted", "confirmed"] as const;
export const TRANSFER_ROUTES = ["Grand Baie", "Flic en Flac", "Le Morne", "Port Louis"] as const;
const text = z.string().trim().min(1).max(300);
export const serviceRequestSchema = z.object({
  id: z.string().uuid(), service: z.enum(["wedding", "transfer"]),
  request_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => { const d = new Date(`${v}T00:00:00Z`); return Number.isFinite(d.getTime()) && d.toISOString().slice(0,10) === v && v >= mauritiusDate(); }, "Choose a valid future date"),
  request_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  name: z.string().trim().min(2).max(120), phone: z.string().trim().min(5).max(40),
  pickup_location: text, dropoff_location: text,
  car_choice: z.enum(WEDDING_CARS).nullable(), hours: z.number().positive().max(48).nullable(),
  passengers: z.number().int().positive().max(100).nullable(), luggage: z.number().int().min(0).max(100).nullable(),
  flight_number: z.string().trim().max(80), notes: z.string().trim().max(2000),
}).superRefine((v, ctx) => {
  if (v.service === "wedding" && (!v.car_choice || !v.hours)) ctx.addIssue({ code: "custom", message: "Choose a wedding car and number of hours" });
  if (v.service === "transfer" && (v.passengers === null || v.luggage === null)) ctx.addIssue({ code: "custom", message: "Enter passengers and luggage" });
  if (Date.parse(`${v.request_date}T${v.request_time}:00+04:00`) < Date.now()) ctx.addIssue({ code: "custom", message: "Choose a future date and time" });
});
export type ServiceInput = z.infer<typeof serviceRequestSchema>;
export function serviceMessage(r: ServiceInput, fr = false) {
  return [fr ? "Bonjour Destination Paradise, je souhaite un devis." : "Hello Destination Paradise, I would like a quote.",
    `${fr ? "Service" : "Service"}: ${r.service === "wedding" ? (fr ? "Voiture de mariage" : "Wedding car") : (fr ? "Transfert" : "Airport & Island Transfer")}`,
    `${fr ? "Date / heure" : "Date / time"}: ${r.request_date} ${r.request_time} (Mauritius UTC+4)`,
    `${fr ? "Départ / cérémonie" : "Pickup / ceremony"}: ${r.pickup_location}`,
    `${fr ? "Destination / réception" : "Drop-off / venue"}: ${r.dropoff_location}`,
    ...(r.service === "wedding" ? [`${fr ? "Voiture" : "Car"}: ${r.car_choice}`, `${fr ? "Heures" : "Hours"}: ${r.hours}`] : [`${fr ? "Passagers" : "Passengers"}: ${r.passengers}`, `${fr ? "Bagages" : "Luggage"}: ${r.luggage}`, ...(r.flight_number ? [`${fr ? "Vol" : "Flight"}: ${r.flight_number}`] : [])]),
    `${fr ? "Nom" : "Name"}: ${r.name}`, `${fr ? "Téléphone" : "Phone"}: ${r.phone}`, ...(r.notes ? [`Notes: ${r.notes}`] : []), `${fr ? "Référence" : "Reference"}: ${r.id}`].join("\n");
}
export function serviceWhatsapp(r: ServiceInput, fr = false) { return whatsappUrl(BUSINESS_PHONE, serviceMessage(r, fr)); }