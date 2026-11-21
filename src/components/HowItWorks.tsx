import { CalendarCheck, CarFront, KeyRound, MessageCircle } from "lucide-react";

const STEPS = {
  en: [
    { icon: CarFront, title: "Choose your car", text: "Pick your dates and a car. Prices are shown per day and the total is calculated for you." },
    { icon: CalendarCheck, title: "Send your request", text: "Fill in a short form. No account and no payment online. Add a photo of your licence if you like." },
    { icon: MessageCircle, title: "We confirm on WhatsApp", text: "We check the car is free and send your confirmation and invoice on WhatsApp." },
    { icon: KeyRound, title: "Pick up and drive", text: "Collect the keys at SSR airport or at the place we agreed. Bring your licence and ID." },
  ],
  fr: [
    { icon: CarFront, title: "Choisissez votre voiture", text: "Indiquez vos dates et choisissez une voiture. Le prix par jour et le total sont calculés pour vous." },
    { icon: CalendarCheck, title: "Envoyez votre demande", text: "Un court formulaire, sans compte et sans paiement en ligne. Ajoutez une photo de votre permis si vous le souhaitez." },
    { icon: MessageCircle, title: "Confirmation sur WhatsApp", text: "Nous vérifions la disponibilité et vous envoyons la confirmation et la facture sur WhatsApp." },
    { icon: KeyRound, title: "Récupérez les clés", text: "À l'aéroport SSR ou au lieu convenu. Apportez votre permis et une pièce d'identité." },
  ],
};

/** Four-step "how it works" strip used on the homepage and the car rental page. */
export function HowItWorks({ lang = "en", className = "" }: { lang?: "en" | "fr"; className?: string }) {
  const fr = lang === "fr";
  return (
    <section className={className} aria-labelledby={`how-it-works-${lang}`}>
      <h2 id={`how-it-works-${lang}`} className="text-2xl font-bold tracking-tight sm:text-3xl">{fr ? "Comment ça marche" : "How it works"}</h2>
      <p className="mt-2 text-muted-foreground">{fr ? "Louer une voiture avec nous en quatre étapes simples." : "Renting a car with us takes four simple steps."}</p>
      <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS[lang].map(({ icon: Icon, title, text }, i) => (
          <li key={title} className="relative rounded-xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground"><Icon className="h-5 w-5" /></span>
              <span className="text-sm font-semibold text-muted-foreground">{fr ? "Étape" : "Step"} {i + 1}</span>
            </div>
            <h3 className="mt-4 text-lg font-semibold">{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
