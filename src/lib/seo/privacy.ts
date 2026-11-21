// Privacy Policy text, English and French.
// Written for a small car rental business in Mauritius under the Data Protection Act 2017.
// Have it checked by a lawyer or the Data Protection Office if you are unsure about anything.

import { ID_DOC_KEEP_DAYS, ID_DOC_KEEP_DAYS_UNUSED } from "@/lib/id-documents.shared";

export const PRIVACY_UPDATED = "2026-11-21";
export const PRIVACY_EMAIL = "ravishnarrainen@gmail.com";

type Section = { h: string; p: string[]; list?: string[] };
type Privacy = { title: string; description: string; h1: string; intro: string; sections: Section[] };

export const PRIVACY: Record<"en" | "fr", Privacy> = {
  en: {
    title: "Privacy Policy — Destination Paradise Mauritius Car Rental",
    description: "How Destination Paradise Mauritius Car Rental collects, uses, stores and deletes your personal data and identity documents when you rent a car in Mauritius.",
    h1: "Privacy Policy",
    intro: "This policy explains what personal data we collect when you book a car with us, why we need it, who can see it, how long we keep it and what your rights are. We only collect what we need to rent you a car safely and legally.",
    sections: [
      { h: "Who we are", p: [
        "Destination Paradise Mauritius Car Rental, Royal road, Grand Baie, Mauritius, is responsible for your personal data (the \"controller\" under the Mauritius Data Protection Act 2017). You can contact us about anything in this policy by email at ravishnarrainen@gmail.com, by phone or on WhatsApp at +230 5922 4353.",
      ]},
      { h: "What we collect", p: ["When you send a booking request or a service request, we collect:"], list: [
        "Your name, phone number and email address.",
        "Your ID card or passport number and your driving licence number.",
        "If you choose to upload them with your booking: copies of your driving licence (front and back), your NIC or passport, or another document. Uploading is optional.",
        "Your booking details: car, dates and times, pickup and return place, extras, notes and prices.",
        "Messages you send us on WhatsApp, by phone or by email.",
      ]},
      { h: "Why we use it", p: ["We use your data only to:"], list: [
        "Check that you can legally drive the car and prepare the rental agreement before you arrive (needed to perform our contract with you).",
        "Confirm your booking and send you the invoice, terms and practical information.",
        "Deal with traffic fines, tolls, accidents, damage or insurance claims that happen during your rental (our legitimate interest and legal obligations).",
        "Keep accounting and tax records as required by Mauritian law.",
      ]},
      { h: "Your identity documents", p: [
        "Uploading your documents is optional. You do not need an account: you simply attach them to your booking request. Doing so lets us check your licence before handover so pickup is quicker. The files are stored in a private, encrypted storage area. Only the owners of Destination Paradise can open them, after signing in to our booking system. They are never public, never shared for marketing and never sold.",
        `We delete the copies automatically ${ID_DOC_KEEP_DAYS} days after the car is returned. This period lets us handle fines or damage claims that arrive after the rental. If your booking is rejected or cancelled, the copies are deleted after ${ID_DOC_KEEP_DAYS_UNUSED} days. You can ask us to delete them earlier, unless we need them for an open fine or claim.`,
        "Whether you upload them or not, please bring the original documents to the handover. If you don't upload anything, we simply check the originals at pickup.",
      ]},
      { h: "Who we share it with", p: ["We do not sell your data or use it for advertising. We only share it when needed:"], list: [
        "With the Police or other authorities when the law requires it, for example to transfer a traffic fine to the driver.",
        "With our insurer if there is an accident or damage claim.",
        "With the companies that run our website and booking system: Cloudflare (website hosting) and Supabase (database and file storage). They process data on our behalf and cannot use it for their own purposes.",
        "With Google, which supplies the fonts our pages use (your browser downloads them directly; Google receives your IP address but we do not use Google advertising or tracking).",
        "With WhatsApp (Meta) when you choose to message us there.",
      ]},
      { h: "How long we keep it", p: [
        `Identity document copies: ${ID_DOC_KEEP_DAYS} days after the car is returned (${ID_DOC_KEEP_DAYS_UNUSED} days for rejected or cancelled bookings).`,
        "Booking details and invoices: as long as Mauritian accounting and tax law requires us to keep business records. Booking requests that never go ahead are deleted when they are no longer needed.",
      ]},
      { h: "Keeping it safe", p: [
        "Our website uses an encrypted connection (HTTPS). Booking data and documents are stored in a private database and storage area protected by access rules, so customers can send information but cannot read anyone else's, and only signed-in owners can view it.",
      ]},
      { h: "Cookies", p: [
        "We do not use advertising or tracking cookies, and we do not use analytics tools that follow you across websites. Our pages only store what is needed to work, such as keeping an owner signed in to the booking system.",
      ]},
      { h: "Your rights", p: [
        "Under the Data Protection Act 2017 you can ask to see the personal data we hold about you, correct it, delete it, or object to how we use it. Send your request to ravishnarrainen@gmail.com or on WhatsApp and we will reply within one month.",
        "If you are not satisfied with our answer, you can complain to the Data Protection Office of Mauritius (dataprotection.govmu.org).",
      ]},
      { h: "Changes to this policy", p: [
        "If we change how we use your data, we will update this page and the date below.",
      ]},
    ],
  },
  fr: {
    title: "Politique de confidentialité — Destination Paradise Mauritius Car Rental",
    description: "Comment Destination Paradise Mauritius Car Rental collecte, utilise, conserve et supprime vos données personnelles et vos pièces d'identité lors d'une location de voiture à l'île Maurice.",
    h1: "Politique de confidentialité",
    intro: "Cette politique explique quelles données personnelles nous collectons lorsque vous réservez une voiture, pourquoi nous en avons besoin, qui peut les voir, combien de temps nous les gardons et quels sont vos droits. Nous ne collectons que ce qui est nécessaire pour vous louer une voiture en toute sécurité et légalement.",
    sections: [
      { h: "Qui nous sommes", p: [
        "Destination Paradise Mauritius Car Rental, Royal road, Grand Baie, île Maurice, est responsable de vos données personnelles (le « responsable du traitement » au sens du Data Protection Act 2017 de Maurice). Pour toute question sur cette politique : ravishnarrainen@gmail.com, ou par téléphone et WhatsApp au +230 5922 4353.",
      ]},
      { h: "Ce que nous collectons", p: ["Lorsque vous envoyez une demande de réservation ou de service, nous collectons :"], list: [
        "Votre nom, numéro de téléphone et adresse e-mail.",
        "Votre numéro de carte d'identité ou de passeport et votre numéro de permis de conduire.",
        "Si vous choisissez de les télécharger avec votre réservation : une copie de votre permis de conduire (recto et verso), de votre NIC ou passeport, ou d'un autre document. Le téléchargement est facultatif.",
        "Les détails de la réservation : voiture, dates et heures, lieux de prise en charge et de retour, options, notes et prix.",
        "Les messages que vous nous envoyez sur WhatsApp, par téléphone ou par e-mail.",
      ]},
      { h: "Pourquoi nous les utilisons", p: ["Nous utilisons vos données uniquement pour :"], list: [
        "Vérifier que vous pouvez conduire la voiture légalement et préparer le contrat de location avant votre arrivée (nécessaire à l'exécution du contrat).",
        "Confirmer votre réservation et vous envoyer la facture, les conditions et les informations pratiques.",
        "Gérer les amendes, péages, accidents, dommages ou sinistres survenus pendant la location (intérêt légitime et obligations légales).",
        "Tenir la comptabilité et les registres fiscaux exigés par la loi mauricienne.",
      ]},
      { h: "Vos pièces d'identité", p: [
        "Le téléchargement de vos documents est facultatif et ne nécessite aucun compte : vous les joignez simplement à votre demande de réservation. Cela nous permet de vérifier votre permis avant la remise des clés, pour une prise en charge plus rapide. Les fichiers sont conservés dans un espace de stockage privé et chiffré. Seuls les gérants de Destination Paradise peuvent les ouvrir, après connexion à notre système de réservation. Ils ne sont jamais publics, jamais utilisés pour du marketing et jamais vendus.",
        `Les copies sont supprimées automatiquement ${ID_DOC_KEEP_DAYS} jours après le retour de la voiture, afin de pouvoir traiter les amendes ou réclamations qui arrivent après la location. Si la réservation est refusée ou annulée, elles sont supprimées après ${ID_DOC_KEEP_DAYS_UNUSED} jours. Vous pouvez demander leur suppression plus tôt, sauf si une amende ou une réclamation est en cours.`,
        "Que vous les téléchargiez ou non, merci d'apporter les documents originaux à la remise des clés. Si vous ne téléchargez rien, nous vérifions simplement les originaux sur place.",
      ]},
      { h: "Avec qui nous les partageons", p: ["Nous ne vendons pas vos données et ne les utilisons pas pour de la publicité. Nous ne les partageons que si nécessaire :"], list: [
        "Avec la Police ou d'autres autorités lorsque la loi l'exige, par exemple pour transférer une amende au conducteur.",
        "Avec notre assureur en cas d'accident ou de sinistre.",
        "Avec les sociétés qui font fonctionner notre site et notre système de réservation : Cloudflare (hébergement du site) et Supabase (base de données et stockage des fichiers). Elles traitent les données pour notre compte et ne peuvent pas les utiliser à leurs propres fins.",
        "Avec Google, qui fournit les polices de caractères de nos pages (votre navigateur les télécharge directement ; Google reçoit votre adresse IP, mais nous n'utilisons ni la publicité ni le suivi de Google).",
        "Avec WhatsApp (Meta) lorsque vous choisissez de nous écrire par ce moyen.",
      ]},
      { h: "Durée de conservation", p: [
        `Copies des pièces d'identité : ${ID_DOC_KEEP_DAYS} jours après le retour de la voiture (${ID_DOC_KEEP_DAYS_UNUSED} jours pour les réservations refusées ou annulées).`,
        "Détails des réservations et factures : aussi longtemps que la loi comptable et fiscale mauricienne l'exige. Les demandes qui n'aboutissent pas sont supprimées lorsqu'elles ne sont plus utiles.",
      ]},
      { h: "Sécurité", p: [
        "Notre site utilise une connexion chiffrée (HTTPS). Les réservations et documents sont conservés dans une base de données et un espace de stockage privés, protégés par des règles d'accès : un client peut envoyer des informations mais ne peut pas lire celles des autres, et seuls les gérants connectés peuvent les consulter.",
      ]},
      { h: "Cookies", p: [
        "Nous n'utilisons pas de cookies publicitaires ou de suivi, ni d'outils d'analyse qui vous suivent d'un site à l'autre. Nos pages ne conservent que ce qui est nécessaire à leur fonctionnement, par exemple la connexion d'un gérant au système de réservation.",
      ]},
      { h: "Vos droits", p: [
        "Selon le Data Protection Act 2017, vous pouvez demander à consulter les données que nous détenons sur vous, à les corriger, à les supprimer ou vous opposer à leur utilisation. Envoyez votre demande à ravishnarrainen@gmail.com ou sur WhatsApp ; nous répondrons dans un délai d'un mois.",
        "Si notre réponse ne vous satisfait pas, vous pouvez vous adresser au Data Protection Office de Maurice (dataprotection.govmu.org).",
      ]},
      { h: "Modifications", p: [
        "Si nous changeons la façon dont nous utilisons vos données, nous mettrons cette page et la date ci-dessous à jour.",
      ]},
    ],
  },
};
