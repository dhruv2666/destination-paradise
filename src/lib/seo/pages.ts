import type { Section } from "./locations";

export type PageContent = { title: string; description: string; h1: string; intro: string; sections: Section[] };
export type Faq = { q: string; a: string };

export const CAR_RENTAL: Record<"en" | "fr", PageContent> = {
  en: {
    title: "How car rental works in Mauritius — Victoria Car rental",
    description: "Step-by-step guide to renting a car with Victoria Car rental in Mauritius: requirements, deposit, insurance, fuel and pickup at SSR airport.",
    h1: "Car rental in Mauritius",
    intro: "Victoria Car rental is a local car hire company based on the Coastal Road in Pointe aux Piments, on the northwest coast of Mauritius. This page explains exactly how renting with us works, from choosing a car to handing back the keys.",
    sections: [
      { h: "How renting works", p: [
        "Start by picking a car from our list. Each car shows its daily price, and some cars have lower daily rates for longer rentals; the booking form calculates the total for your dates automatically. Choose your pickup date and time, your return date and time, and where you want to collect the car: at SSR International Airport or at another place you name.",
        "Fill in your name, phone number, ID or passport number and driving licence number, accept the terms and send the request. Nothing is charged online. We check that the car is free for your dates, approve the booking and send you the invoice on WhatsApp. If a car is already booked for part of your dates, the form tells you straight away so you can choose different dates or another car.",
      ]},
      { h: "Requirements", p: [
        "You need a valid driving licence and an identity document such as a passport or national ID card. The booking form asks for both numbers so the rental agreement can be prepared before you arrive. Please bring the original documents to the handover. If you have questions about a licence issued outside Mauritius or about age requirements, ask us on WhatsApp before you book and we will answer for your exact situation.",
      ]},
      { h: "Deposit", p: [
        "A security deposit may apply depending on the car and the length of the rental. When it does, the amount is written on your invoice before the rental starts, so there are no surprises at pickup. The deposit is returned when the car comes back in the same condition.",
      ]},
      { h: "Insurance", p: [
        "Insurance cover and any excess are explained in our rental terms and on your invoice. Read them before you drive, and ask us if anything is unclear. In the event of an accident or damage, contact us immediately on +230 5920 6432.",
      ]},
      { h: "Fuel policy", p: [
        "The fuel arrangement for your car is confirmed with your booking. Petrol stations are common along the motorway and in every town, and most accept cards as well as cash. Keep the receipt from your last fill-up in case it is needed at return.",
      ]},
      { h: "Driving in Mauritius", p: [
        "Mauritius drives on the left. The motorway runs from the airport in the southeast, past Port Louis, up to the north. Coastal and village roads are narrower and busy with buses, scooters and pedestrians, so allow time and drive calmly, especially after dark.",
      ]},
    ],
  },
  fr: {
    title: "Comment louer une voiture à l'île Maurice — Victoria Car rental",
    description: "Guide de la location de voiture avec Victoria Car rental à l'île Maurice : conditions, caution, assurance, carburant et prise en charge à l'aéroport SSR.",
    h1: "Location de voiture à l'île Maurice",
    intro: "Victoria Car rental est une agence locale de location de voitures installée sur la Coastal Road à Pointe aux Piments, sur la côte nord-ouest de l'île Maurice. Cette page explique comment se déroule une location chez nous, du choix de la voiture à la restitution des clés.",
    sections: [
      { h: "Le déroulement de la location", p: [
        "Commencez par choisir une voiture dans notre liste. Chaque modèle affiche son prix par jour, et certains bénéficient d'un tarif dégressif pour les locations plus longues ; le formulaire calcule automatiquement le total pour vos dates. Indiquez la date et l'heure de prise en charge, celles du retour, et le lieu de remise : l'aéroport international SSR ou un autre endroit que vous précisez.",
        "Renseignez votre nom, votre numéro de téléphone, votre numéro de pièce d'identité ou de passeport et votre numéro de permis, acceptez les conditions et envoyez la demande. Aucun paiement n'est demandé en ligne. Nous vérifions la disponibilité, validons la réservation et vous envoyons la facture sur WhatsApp. Si la voiture est déjà réservée sur une partie de vos dates, le formulaire vous l'indique immédiatement.",
      ]},
      { h: "Conditions", p: [
        "Il vous faut un permis de conduire valide et une pièce d'identité, passeport ou carte d'identité. Le formulaire demande les deux numéros afin de préparer le contrat avant votre arrivée. Apportez les documents originaux lors de la remise. Pour toute question sur un permis étranger ou sur l'âge minimum, écrivez-nous sur WhatsApp avant de réserver et nous répondrons selon votre situation.",
      ]},
      { h: "Caution", p: [
        "Une caution peut être demandée selon la voiture et la durée de location. Le cas échéant, son montant figure sur votre facture avant le début de la location, sans surprise à la remise des clés. Elle est restituée au retour du véhicule dans le même état.",
      ]},
      { h: "Assurance", p: [
        "La couverture d'assurance et l'éventuelle franchise sont détaillées dans nos conditions de location et sur votre facture. Lisez-les avant de prendre la route et n'hésitez pas à nous poser vos questions. En cas d'accident ou de dommage, appelez-nous immédiatement au +230 5920 6432.",
      ]},
      { h: "Carburant", p: [
        "Les modalités de carburant de votre voiture sont confirmées avec la réservation. Les stations-service sont nombreuses le long de l'autoroute et dans chaque ville, et la plupart acceptent la carte comme les espèces. Gardez le ticket du dernier plein au cas où il serait demandé au retour.",
      ]},
      { h: "Conduire à l'île Maurice", p: [
        "À Maurice, on roule à gauche. L'autoroute relie l'aéroport au sud-est, Port-Louis et le nord. Les routes côtières et de village sont plus étroites et fréquentées par les bus, scooters et piétons : prenez votre temps, surtout de nuit.",
      ]},
    ],
  },
};

export const AIRPORT: Record<"en" | "fr", PageContent> = {
  en: {
    title: "SSR airport (MRU) car pickup and transfers — Victoria Car rental",
    description: "Collect your rental car at SSR International Airport (MRU), Mauritius. How airport pickup works, prices and how to book with Victoria Car rental.",
    h1: "Airport pickup at SSR International Airport (MRU)",
    intro: "Sir Seewoosagur Ramgoolam International Airport, code MRU, is the only international airport in Mauritius and sits in Plaine Magnien in the southeast of the island. Most of our customers start their holiday here, so airport pickup is built into our booking form.",
    sections: [
      { h: "How airport pickup works", p: [
        "When you book, choose “SSR International Airport” as your pickup point and enter the date and time your flight lands. Add your flight number in the notes so we can follow any delay. After you clear immigration and collect your luggage, we meet you with the car, check your licence and ID, walk round the car with you and hand over the keys. You then drive directly to your hotel or villa.",
        "Returning works the same way: choose the airport and the time you want to drop the car before your departure. Leave yourself enough margin to check in, as the drive from the north and west coasts can take more than an hour in traffic.",
      ]},
      { h: "Prices", p: [
        "Airport pickup is booked together with a rental car, and you pay the car's daily rate shown on our car pages. The booking form shows the full total for your dates before you send the request, and the final amount, including any deposit, is written on the invoice we send you on WhatsApp. If you need a different arrangement, such as a pickup at an unusual hour, ask us on WhatsApp and we will quote you directly.",
      ]},
      { h: "Typical driving times from the airport", p: [
        "The motorway makes most of the island reachable quickly. As a rough guide outside rush hour: Mahébourg and Blue Bay around ten to fifteen minutes, Port Louis and Flic en Flac about fifty minutes, Le Morne about an hour, Trou aux Biches and Pointe aux Piments about an hour and ten minutes, Grand Baie and Pereybère around an hour and a quarter or more. Traffic around Port Louis on weekday mornings and evenings can add time.",
      ]},
      { h: "How to book", p: [
        "Open the booking page, choose your car, select the airport as pickup and send the request. You can also send us a WhatsApp message on +230 5920 6432 with your flight details and preferred car. We reply to confirm availability and send your invoice.",
      ]},
    ],
  },
  fr: {
    title: "Prise en charge à l'aéroport SSR (MRU) — Victoria Car rental",
    description: "Récupérez votre voiture de location à l'aéroport international SSR (MRU), île Maurice : fonctionnement, prix et réservation avec Victoria Car rental.",
    h1: "Prise en charge à l'aéroport international SSR (MRU)",
    intro: "L'aéroport international Sir Seewoosagur Ramgoolam, code MRU, est le seul aéroport international de l'île Maurice ; il se trouve à Plaine Magnien, dans le sud-est. La plupart de nos clients commencent leurs vacances ici, c'est pourquoi la remise à l'aéroport est intégrée à notre formulaire.",
    sections: [
      { h: "Comment ça marche", p: [
        "Lors de la réservation, choisissez « SSR International Airport » comme lieu de prise en charge et indiquez la date et l'heure d'atterrissage. Ajoutez votre numéro de vol dans les remarques afin que nous suivions un éventuel retard. Après l'immigration et les bagages, nous vous attendons avec la voiture, vérifions votre permis et votre pièce d'identité, faisons le tour du véhicule avec vous et vous remettons les clés.",
        "Le retour fonctionne de la même manière : choisissez l'aéroport et l'heure de restitution avant votre départ. Prévoyez une marge suffisante pour l'enregistrement, car le trajet depuis le nord ou l'ouest peut dépasser une heure avec la circulation.",
      ]},
      { h: "Prix", p: [
        "La prise en charge à l'aéroport se réserve avec une voiture de location, au tarif journalier affiché sur nos pages voitures. Le formulaire affiche le total pour vos dates avant l'envoi, et le montant final, caution comprise le cas échéant, figure sur la facture envoyée sur WhatsApp. Pour une demande particulière, comme une remise à une heure inhabituelle, écrivez-nous et nous vous ferons une offre.",
      ]},
      { h: "Temps de trajet depuis l'aéroport", p: [
        "Grâce à l'autoroute, l'île se parcourt rapidement. À titre indicatif hors heures de pointe : Mahébourg et Blue Bay environ dix à quinze minutes, Port-Louis et Flic en Flac une cinquantaine de minutes, Le Morne environ une heure, Trou aux Biches et Pointe aux Piments environ une heure dix, Grand Baie et Pereybère une heure et quart ou plus. La circulation autour de Port-Louis en semaine peut rallonger le trajet.",
      ]},
      { h: "Réserver", p: [
        "Ouvrez la page de réservation, choisissez votre voiture, sélectionnez l'aéroport et envoyez la demande. Vous pouvez aussi nous écrire sur WhatsApp au +230 5920 6432 avec vos informations de vol et la voiture souhaitée. Nous confirmons la disponibilité et vous envoyons la facture.",
      ]},
    ],
  },
};

export const FAQS: Record<"en" | "fr", Faq[]> = {
  en: [
    { q: "Can I drive in Mauritius with my foreign driving licence?", a: "You need a valid driving licence to rent with us, and we record its number when you book. Rules for licences issued abroad can depend on the country of issue and the length of your stay, so send us a photo of your licence on WhatsApp before booking if you are unsure and we will confirm." },
    { q: "Which side of the road do people drive on in Mauritius?", a: "Mauritius drives on the left, and cars are right-hand drive. If you are used to driving on the right, take the first kilometres slowly, be careful at roundabouts, which are taken clockwise, and watch for buses and scooters on narrow coastal roads." },
    { q: "What is the minimum age to rent a car?", a: "Age requirements are part of our rental terms. Tell us the driver's age when you contact us and we will confirm before you book, so there is no problem at pickup." },
    { q: "Is there a deposit?", a: "A security deposit may apply depending on the car and rental length. If it does, the amount is shown on your invoice before the rental starts and is returned when the car comes back in the same condition." },
    { q: "Do you provide child seats?", a: "Ask for a child seat in the notes of the booking form or on WhatsApp, with the age of the child. We confirm availability with your booking." },
    { q: "Can I collect the car at the airport?", a: "Yes. Choose SSR International Airport as your pickup point in the booking form and add your flight number in the notes. We meet you at arrivals with the car." },
    { q: "How do I pay?", a: "Nothing is charged online. After we approve your request we send your invoice on WhatsApp, and payment details are confirmed with it." },
    { q: "Which currency are prices in?", a: "Prices are shown in Mauritian rupees (Rs) unless a car page states another currency. The total on the booking form and on your invoice uses the same currency." },
    { q: "Can I return the car somewhere else?", a: "Choose the return date and time in the form and tell us where you would like to hand the car back in the notes. We confirm the return point with your booking." },
    { q: "What happens if the car I want is already booked?", a: "The booking form checks our calendar. If the car is taken for part of your dates you see a warning immediately and can pick other dates or another car." },
    { q: "Where are you based?", a: "We are on the Coastal Road in Pointe aux Piments, Grande Pointe aux Piments 21304, on the northwest coast between Trou aux Biches and Balaclava." },
    { q: "How do I contact you?", a: "Call or WhatsApp +230 5920 6432. WhatsApp is the fastest way to reach us." },
  ],
  fr: [
    { q: "Puis-je conduire à Maurice avec mon permis étranger ?", a: "Un permis de conduire valide est nécessaire et nous enregistrons son numéro lors de la réservation. Les règles pour les permis étrangers peuvent dépendre du pays de délivrance et de la durée du séjour : en cas de doute, envoyez-nous une photo de votre permis sur WhatsApp avant de réserver." },
    { q: "De quel côté roule-t-on à l'île Maurice ?", a: "On roule à gauche et le volant est à droite. Si vous avez l'habitude de rouler à droite, prenez votre temps les premiers kilomètres, faites attention aux ronds-points, pris dans le sens des aiguilles d'une montre, et aux bus et scooters sur les routes côtières." },
    { q: "Quel est l'âge minimum pour louer ?", a: "Les conditions d'âge font partie de nos conditions de location. Indiquez-nous l'âge du conducteur et nous confirmons avant la réservation, pour éviter tout problème à la remise." },
    { q: "Y a-t-il une caution ?", a: "Une caution peut s'appliquer selon la voiture et la durée. Son montant figure alors sur votre facture avant le début de la location et elle est restituée au retour du véhicule dans le même état." },
    { q: "Proposez-vous des sièges enfant ?", a: "Demandez un siège enfant dans les remarques du formulaire ou sur WhatsApp, en précisant l'âge de l'enfant. Nous confirmons la disponibilité avec la réservation." },
    { q: "Puis-je récupérer la voiture à l'aéroport ?", a: "Oui. Choisissez l'aéroport international SSR comme lieu de prise en charge et indiquez votre numéro de vol dans les remarques. Nous vous attendons à l'arrivée." },
    { q: "Comment payer ?", a: "Aucun paiement en ligne. Après validation de votre demande, nous vous envoyons la facture sur WhatsApp avec les modalités de paiement." },
    { q: "Dans quelle devise sont les prix ?", a: "Les prix sont en roupies mauriciennes (Rs), sauf indication contraire sur la page de la voiture. Le total du formulaire et de la facture utilise la même devise." },
    { q: "Puis-je rendre la voiture ailleurs ?", a: "Indiquez la date et l'heure de retour et précisez dans les remarques où vous souhaitez rendre la voiture. Nous confirmons le lieu de retour avec la réservation." },
    { q: "Que se passe-t-il si la voiture est déjà réservée ?", a: "Le formulaire vérifie notre calendrier. Si la voiture est prise sur une partie de vos dates, un avertissement s'affiche immédiatement et vous pouvez choisir d'autres dates ou une autre voiture." },
    { q: "Où êtes-vous situés ?", a: "Sur la Coastal Road à Pointe aux Piments, Grande Pointe aux Piments 21304, sur la côte nord-ouest entre Trou aux Biches et Balaclava." },
    { q: "Comment vous contacter ?", a: "Par téléphone ou WhatsApp au +230 5920 6432. WhatsApp est le moyen le plus rapide." },
  ],
};
