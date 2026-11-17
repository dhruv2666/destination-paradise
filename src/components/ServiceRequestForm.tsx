import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { MessageCircle, Check, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { PhoneInput } from "./PhoneInput";
import { Textarea } from "./ui/textarea";
import { mauritiusDate } from "@/lib/holidays";
import { serviceRequestSchema, serviceWhatsapp, TRANSFER_ROUTES, type ServiceInput } from "@/lib/services";
import { submitServiceRequest } from "@/lib/services.functions";

export function ServiceRequestForm({service,lang,top=false}:{service:"wedding"|"transfer";lang:"en"|"fr";top?:boolean}) {
 const fr=lang==="fr", wedding=service==="wedding";
 const [pickup,setPickup]=useState(wedding ? "" : "SSR Airport");
 const [dropoff,setDropoff]=useState("");
 const [saved,setSaved]=useState<ServiceInput|null>(null);
 const [error,setError]=useState("");
 const submit=useServerFn(submitServiceRequest);
 const mutation=useMutation({mutationFn:(data:ServiceInput)=>submit({data})});
 const field=(label:string,key:string,type="text",required=true,extra:Record<string,string|number>={})=><label className="grid min-w-0 gap-1.5 text-sm font-medium">{label}<Input name={key} type={type} required={required} {...extra} /></label>;
 return <section id="service-request" className={top ? "scroll-mt-28 mt-4 rounded-xl border border-border bg-card p-4 shadow-card sm:p-6" : "scroll-mt-28 border-t border-border py-10"}>
  <h2 className={wedding ? "wedding-heading text-3xl" : "text-2xl font-bold"}>{wedding ? (fr ? "Votre arrivée, à votre image" : "Your arrival, your way") : (fr ? "Demander un transfert" : "Request a transfer")}</h2>
  <p className="mt-2 text-muted-foreground">{fr ? "Prix sur demande · Confirmation après devis" : "Price on request · Confirmed after your quote"}</p>
  {!wedding && <div className="my-5 flex flex-wrap gap-2" aria-label={fr ? "Trajets populaires" : "Popular routes"}>{TRANSFER_ROUTES.map(route=><Button key={route} variant="outline" size="sm" onClick={()=>{setPickup("SSR Airport");setDropoff(route);setSaved(null);}}>SSR Airport → {route}</Button>)}</div>}
  {saved ? <div className="mt-6 space-y-4 border-l-2 border-success-foreground pl-4"><p role="status" className="flex gap-2 font-semibold"><Check />{fr ? "Demande enregistrée. Envoyez votre message sur WhatsApp." : "Request saved. Send your message on WhatsApp."}</p><Button asChild variant="whatsapp"><a href={serviceWhatsapp(saved,fr)} target="_blank" rel="noopener noreferrer"><MessageCircle />{fr ? "Continuer sur WhatsApp" : "Continue on WhatsApp"}</a></Button><Button className="ml-2" variant="ghost" onClick={()=>{setSaved(null);mutation.reset();}}>{fr ? "Nouvelle demande" : "New request"}</Button></div> :
  <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={async e=>{
   e.preventDefault();setError("");const f=new FormData(e.currentTarget);
   const data={id:crypto.randomUUID(),service,request_date:String(f.get("date")),request_time:String(f.get("time")),name:String(f.get("name")),phone:String(f.get("phone")),pickup_location:pickup,dropoff_location:dropoff,car_choice:null,hours:wedding?Number(f.get("hours")):null,passengers:wedding?null:Number(f.get("passengers")),luggage:wedding?null:Number(f.get("luggage")),flight_number:String(f.get("flight")??""),notes:String(f.get("notes")??"")};
   const parsed=serviceRequestSchema.safeParse(data);if(!parsed.success){setError(fr ? "Vérifiez les champs et choisissez une date et une heure futures." : parsed.error.issues[0]?.message ?? "Check your details");return;}
   try{await mutation.mutateAsync(parsed.data);setSaved(parsed.data);
    // Same-tab navigation is never popup-blocked on phones; WhatsApp opens with the message prefilled.
    window.location.href=serviceWhatsapp(parsed.data,fr);}
   catch(err){setError(err instanceof Error ? err.message : "Could not save request");}
  }}>
   {field(fr?"Date":"Date","date","date",true,{min:mauritiusDate()})}
   {field(fr?"Heure (Maurice)":"Time (Mauritius)","time","time")}
   <label className="grid gap-1.5 text-sm font-medium">{wedding?(fr?"Lieu de cérémonie":"Ceremony location"):(fr?"Lieu de départ":"Pickup location")}<Input name="pickup" required maxLength={300} value={pickup} onChange={e=>setPickup(e.target.value)} /></label>
   <label className="grid gap-1.5 text-sm font-medium">{wedding?(fr?"Lieu de réception":"Venue"):(fr?"Destination":"Drop-off location")}<Input name="dropoff" required maxLength={300} value={dropoff} onChange={e=>setDropoff(e.target.value)} /></label>
   {wedding ? <>{field(fr?"Nombre d’heures":"Number of hours","hours","number",true,{min:0.5,max:48,step:0.5})}<div className="hidden sm:block" /></> : <>{field(fr?"Passagers":"Passengers","passengers","number",true,{min:1,max:100})}{field(fr?"Bagages":"Luggage","luggage","number",true,{min:0,max:100})}{field(fr?"Numéro de vol (facultatif)":"Flight number (optional)","flight","text",false,{maxLength:80})}</>}
   {field(fr?"Nom":"Name","name","text",true,{minLength:2,maxLength:120})}
   <label className="grid min-w-0 gap-1.5 text-sm font-medium">{fr?"Téléphone (WhatsApp)":"Phone (WhatsApp)"}<PhoneInput name="phone" required /></label>
   {wedding && <label className="grid gap-1.5 text-sm font-medium sm:col-span-2">Notes<Textarea name="notes" maxLength={2000} rows={3} /></label>}
   {error && <p role="alert" className="text-sm text-destructive sm:col-span-2">{error}</p>}
   <Button type="submit" variant={wedding?"gold":"whatsapp"} size="lg" disabled={mutation.isPending} className="h-auto min-h-12 whitespace-normal sm:col-span-2">{mutation.isPending ? <Loader2 className="animate-spin" /> : <MessageCircle />}{mutation.isPending ? (fr?"Enregistrement…":"Saving…") : (fr?"Demander un devis sur WhatsApp":"Request a quote on WhatsApp")}</Button>
  </form>}
 </section>;
}