import type { Lang } from "./site";

export type Section = { h: string; p: string[] };
export type LocationContent = { name: string; title: string; description: string; sections: Section[] };
export type LocationEntry = { slug: string; en: LocationContent; fr: LocationContent };

export const LOCATIONS: LocationEntry[] = [
  {
    slug: "grand-baie",
    en: {
      name: "Grand Baie",
      title: "Car rental in Grand Baie, Mauritius — Victoria Car rental",
      description: "Rent a car for Grand Baie or book an airport pickup. Explore the north of Mauritius from Pointe aux Piments with Victoria Car rental.",
      sections: [
        { h: "Renting a car for Grand Baie", p: [
          "Grand Baie is the busiest seaside town in the north of Mauritius. Its wide, sheltered bay is lined with restaurants, bars, supermarkets and boat operators, and the Sunset Boulevard shopping street sits right on the waterfront. Many visitors stay here because everything is close, yet the best beaches of the north are a short drive away rather than a short walk.",
          "Our base on the Coastal Road in Pointe aux Piments is along the same northwest coast, so Grand Baie is an easy run up the road. Having your own car means you can leave early for the quiet public beaches at Pereybère or Cap Malheureux, come back for lunch in town and still be on the sand for the sunset at Trou aux Biches.",
        ]},
        { h: "Things worth driving to from Grand Baie", p: [
          "Boat trips to the northern islets such as Coin de Mire and Île Plate leave from the bay, but the land around it is just as rewarding. The red-roofed church at Cap Malheureux, the Pamplemousses botanical garden and the fishing villages on the northeast coast all make relaxed half-day drives. Parking in the town centre fills up at weekends and in the evening, so plan a little extra time when you head out to dinner.",
        ]},
        { h: "Getting to Grand Baie from the airport", p: [
          "SSR International Airport is in the southeast of the island, so the trip north to Grand Baie takes roughly an hour and a quarter by motorway depending on traffic. You can collect your car at the airport and drive yourself, which saves a separate transfer. Choose the airport as your pickup point when you book and we confirm the details and your invoice on WhatsApp.",
        ]},
      ],
    },
    fr: {
      name: "Grand Baie",
      title: "Location de voiture à Grand Baie, île Maurice — Victoria Car rental",
      description: "Louez une voiture pour Grand Baie ou réservez une prise en charge à l'aéroport. Découvrez le nord de l'île Maurice avec Victoria Car rental.",
      sections: [
        { h: "Louer une voiture pour Grand Baie", p: [
          "Grand Baie est la station balnéaire la plus animée du nord de l'île Maurice. Sa grande baie abritée est bordée de restaurants, de bars, de supermarchés et de prestataires d'excursions en bateau, et la rue commerçante Sunset Boulevard donne directement sur l'eau. Beaucoup de visiteurs logent ici parce que tout est proche, mais les plus belles plages du nord se rejoignent en voiture plutôt qu'à pied.",
          "Notre agence sur la Coastal Road à Pointe aux Piments se trouve sur la même côte nord-ouest : Grand Baie n'est qu'à quelques kilomètres. Avec votre propre voiture, vous pouvez partir tôt vers les plages tranquilles de Pereybère ou de Cap Malheureux, revenir déjeuner en ville et profiter du coucher de soleil à Trou aux Biches.",
        ]},
        { h: "Où aller en voiture depuis Grand Baie", p: [
          "Les sorties en bateau vers les îlots du nord comme le Coin de Mire et l'île Plate partent de la baie, mais l'intérieur des terres vaut aussi le détour. L'église au toit rouge de Cap Malheureux, le jardin botanique de Pamplemousses et les villages de pêcheurs de la côte nord-est sont de belles demi-journées en voiture. Le stationnement au centre-ville est vite complet le soir et le week-end : prévoyez un peu de marge pour aller dîner.",
        ]},
        { h: "Rejoindre Grand Baie depuis l'aéroport", p: [
          "L'aéroport international SSR est situé au sud-est de l'île ; il faut compter environ une heure et quart par l'autoroute pour rejoindre Grand Baie selon la circulation. Vous pouvez récupérer votre voiture directement à l'aéroport et conduire vous-même, sans transfert séparé. Choisissez l'aéroport comme lieu de prise en charge lors de la réservation ; nous confirmons les détails et la facture sur WhatsApp.",
        ]},
      ],
    },
  },
  {
    slug: "flic-en-flac",
    en: {
      name: "Flic en Flac",
      title: "Car rental in Flic en Flac, Mauritius — Victoria Car rental",
      description: "Hire a car for Flic en Flac on the west coast of Mauritius. Long beach, sunsets and easy drives to Tamarin, Casela and Black River Gorges.",
      sections: [
        { h: "Why a car helps in Flic en Flac", p: [
          "Flic en Flac sits on the sunny west coast and is known for one of the longest public beaches on the island, shaded by casuarina trees and famous for its evening sunsets. The village itself is compact, with small restaurants and food stalls along the beach road, but most of the west coast's highlights are spread out inland and to the south.",
          "With a rental car you can reach the Black River Gorges National Park for a morning walk, stop at the Casela nature park on the way back and finish with a swim in the calm lagoon. Tamarin bay, the salt pans and the Martello tower at La Preneuse are all within a short drive.",
        ]},
        { h: "Driving from Pointe aux Piments to the west", p: [
          "From our base in the northwest, Flic en Flac is reached by following the motorway past Port Louis and turning towards the west coast. Outside rush hour the drive is straightforward, and the road along the coast is well signposted. If you are staying in the west for most of your holiday, we can discuss a pickup point that suits you when we confirm your booking.",
        ]},
        { h: "Arriving from the airport", p: [
          "The airport is on the opposite side of the island, so the journey to Flic en Flac takes roughly fifty minutes to an hour. Collecting your car at SSR International Airport lets you drive straight to your accommodation at your own pace, with a stop for groceries on the way.",
        ]},
      ],
    },
    fr: {
      name: "Flic en Flac",
      title: "Location de voiture à Flic en Flac, île Maurice — Victoria Car rental",
      description: "Louez une voiture pour Flic en Flac, sur la côte ouest de l'île Maurice : longue plage, couchers de soleil, Tamarin, Casela et les gorges de Rivière Noire.",
      sections: [
        { h: "Pourquoi une voiture à Flic en Flac", p: [
          "Flic en Flac se trouve sur la côte ouest ensoleillée et possède l'une des plus longues plages publiques de l'île, ombragée par des filaos et réputée pour ses couchers de soleil. Le village est petit, avec des restaurants et des marchands ambulants le long de la route de la plage, mais les grands sites de l'ouest sont dispersés à l'intérieur des terres et vers le sud.",
          "Avec une voiture de location, vous pouvez marcher le matin dans le parc national des gorges de Rivière Noire, vous arrêter au parc de Casela au retour et terminer la journée par une baignade dans le lagon. La baie de Tamarin, les salines et la tour Martello de La Preneuse sont à quelques minutes.",
        ]},
        { h: "De Pointe aux Piments vers l'ouest", p: [
          "Depuis notre agence au nord-ouest, on rejoint Flic en Flac par l'autoroute en passant Port-Louis, puis en bifurquant vers la côte ouest. En dehors des heures de pointe, le trajet est simple et bien indiqué. Si vous séjournez surtout dans l'ouest, nous pouvons convenir d'un lieu de remise pratique au moment de confirmer votre réservation.",
        ]},
        { h: "Arrivée depuis l'aéroport", p: [
          "L'aéroport se trouve de l'autre côté de l'île : comptez environ cinquante minutes à une heure jusqu'à Flic en Flac. En récupérant votre voiture à l'aéroport international SSR, vous rejoignez votre logement à votre rythme, avec un arrêt courses en chemin.",
        ]},
      ],
    },
  },
  {
    slug: "port-louis",
    en: {
      name: "Port Louis",
      title: "Car rental for Port Louis, Mauritius — Victoria Car rental",
      description: "Visiting Port Louis? Rent a car from Victoria Car rental to explore the capital's market, Caudan Waterfront and Aapravasi Ghat, then the rest of Mauritius.",
      sections: [
        { h: "Exploring the capital by car", p: [
          "Port Louis is the capital of Mauritius and its main harbour. The central market, the Caudan Waterfront, the Aapravasi Ghat UNESCO site and the Citadel overlooking the city are all worth a visit, and the streets of Chinatown are full of small eateries. The centre itself is best explored on foot, so a car is most useful for getting there and for everything you want to see afterwards.",
          "Weekday traffic into the city can be heavy in the morning and late afternoon. We suggest arriving mid-morning, leaving the car in one of the paid car parks near the waterfront and walking between the sights. Sundays are much quieter, although many shops close.",
        ]},
        { h: "Close to our base", p: [
          "Pointe aux Piments is on the northwest coast, a short drive north of the capital, which makes Port Louis an easy day trip. From the city you can continue to the Pamplemousses botanical garden in the north or drive up to the cooler central plateau around Curepipe and the Trou aux Cerfs crater.",
        ]},
        { h: "From the airport to Port Louis", p: [
          "The motorway links SSR International Airport with Port Louis in roughly fifty minutes outside peak times. If you have business in the capital, collecting a car at the airport is often simpler than arranging taxis for each meeting.",
        ]},
      ],
    },
    fr: {
      name: "Port-Louis",
      title: "Location de voiture pour Port-Louis, île Maurice — Victoria Car rental",
      description: "Vous visitez Port-Louis ? Louez une voiture chez Victoria Car rental pour découvrir le marché, le Caudan Waterfront et l'Aapravasi Ghat, puis toute l'île.",
      sections: [
        { h: "Découvrir la capitale en voiture", p: [
          "Port-Louis est la capitale de l'île Maurice et son principal port. Le marché central, le Caudan Waterfront, le site UNESCO de l'Aapravasi Ghat et la Citadelle qui domine la ville méritent une visite, et les rues du quartier chinois regorgent de petites tables. Le centre se découvre à pied : la voiture sert surtout à s'y rendre et à poursuivre la journée ailleurs.",
          "En semaine, la circulation vers la ville est dense le matin et en fin d'après-midi. Nous conseillons d'arriver en milieu de matinée, de laisser la voiture dans un parking payant près du front de mer et de marcher entre les sites. Le dimanche est beaucoup plus calme, même si de nombreux commerces ferment.",
        ]},
        { h: "Tout près de notre agence", p: [
          "Pointe aux Piments se trouve sur la côte nord-ouest, à peu de distance au nord de la capitale : Port-Louis est donc une excursion facile à la journée. Depuis la ville, vous pouvez continuer vers le jardin botanique de Pamplemousses ou monter vers le plateau central, plus frais, autour de Curepipe et du cratère de Trou aux Cerfs.",
        ]},
        { h: "De l'aéroport à Port-Louis", p: [
          "L'autoroute relie l'aéroport international SSR à Port-Louis en une cinquantaine de minutes hors heures de pointe. Pour un déplacement professionnel, récupérer une voiture à l'aéroport est souvent plus simple que de réserver un taxi pour chaque rendez-vous.",
        ]},
      ],
    },
  },
  {
    slug: "mahebourg",
    en: {
      name: "Mahébourg",
      title: "Car rental in Mahébourg, Mauritius — Victoria Car rental",
      description: "Rent a car near Mahébourg and SSR airport. Visit Blue Bay, Île aux Aigrettes and the southeast coast of Mauritius with Victoria Car rental.",
      sections: [
        { h: "Mahébourg and the southeast coast", p: [
          "Mahébourg is a historic fishing town on the shore of Grand Port bay, only a few minutes from SSR International Airport. Its seafront promenade, the weekly market and the National History Museum give a feel for everyday Mauritian life away from the big resorts.",
          "Just south of the town lies Blue Bay, a protected marine park with clear shallow water that is popular for snorkelling and glass-bottom boat trips. Boats also go to Île aux Aigrettes, a small nature reserve where native forest and giant tortoises are protected.",
        ]},
        { h: "Why drive in the southeast", p: [
          "Public transport in the southeast is limited, and the coast road towards Souillac, Gris Gris and the wild south is one of the most scenic drives on the island. A car lets you combine a morning in Blue Bay with lunch further along the coast and an afternoon at the waterfalls and tea fields inland.",
        ]},
        { h: "Airport pickup for Mahébourg", p: [
          "Because the airport is so close, collecting your car there is the natural choice if you stay in Mahébourg or Blue Bay. Choose SSR International Airport as your pickup point in the booking form, add your flight time in the notes, and we confirm everything on WhatsApp.",
        ]},
      ],
    },
    fr: {
      name: "Mahébourg",
      title: "Location de voiture à Mahébourg, île Maurice — Victoria Car rental",
      description: "Louez une voiture près de Mahébourg et de l'aéroport SSR. Visitez Blue Bay, l'île aux Aigrettes et la côte sud-est avec Victoria Car rental.",
      sections: [
        { h: "Mahébourg et la côte sud-est", p: [
          "Mahébourg est une ville de pêcheurs historique au bord de la baie de Grand Port, à quelques minutes de l'aéroport international SSR. Son front de mer, son marché hebdomadaire et le Musée d'histoire nationale donnent un aperçu de la vie mauricienne loin des grands hôtels.",
          "Juste au sud se trouve Blue Bay, un parc marin protégé aux eaux claires et peu profondes, très apprécié pour le snorkeling et les bateaux à fond de verre. Des bateaux rejoignent aussi l'île aux Aigrettes, une petite réserve naturelle qui protège la forêt indigène et les tortues géantes.",
        ]},
        { h: "Pourquoi conduire dans le sud-est", p: [
          "Les transports en commun sont limités dans le sud-est, et la route côtière vers Souillac, Gris Gris et le sud sauvage compte parmi les plus belles de l'île. Une voiture permet d'enchaîner une matinée à Blue Bay, un déjeuner plus loin sur la côte et un après-midi entre cascades et champs de thé.",
        ]},
        { h: "Prise en charge à l'aéroport pour Mahébourg", p: [
          "L'aéroport étant tout proche, c'est le lieu idéal pour récupérer votre voiture si vous logez à Mahébourg ou Blue Bay. Choisissez l'aéroport international SSR dans le formulaire, indiquez l'heure de votre vol dans les remarques, et nous confirmons tout sur WhatsApp.",
        ]},
      ],
    },
  },
  {
    slug: "trou-aux-biches",
    en: {
      name: "Trou aux Biches",
      title: "Car rental in Trou aux Biches, Mauritius — Victoria Car rental",
      description: "Car hire next door to Trou aux Biches. Victoria Car rental is based in Pointe aux Piments, minutes from the calm lagoon and Mont Choisy beach.",
      sections: [
        { h: "Our closest beach village", p: [
          "Trou aux Biches is right next to our base in Pointe aux Piments, a few minutes along the Coastal Road. Its calm, shallow lagoon and white sand make it one of the most comfortable beaches in Mauritius for swimming, and the long beach of Mont Choisy continues just to the north.",
          "Being this close means we know the area well. Many guests in Trou aux Biches stay in villas and apartments set back from the beach road, where supermarkets and restaurants are a drive rather than a stroll away. A car makes daily shopping and evening meals in Grand Baie much easier.",
        ]},
        { h: "Day trips from Trou aux Biches", p: [
          "From here you are well placed for the whole north and west. Port Louis is a short trip down the motorway, the Pamplemousses garden is inland to the east, and the northern beaches at Pereybère and Cap Malheureux are a short hop up the coast. The Mauritius Aquarium in Pointe aux Piments is also nearby, which is handy with children.",
        ]},
        { h: "From the airport to Trou aux Biches", p: [
          "Allow about an hour and ten minutes from SSR International Airport, depending on traffic. You can pick up your car at the airport and drive north, or ask for a pickup close to your accommodation when you book.",
        ]},
      ],
    },
    fr: {
      name: "Trou aux Biches",
      title: "Location de voiture à Trou aux Biches, île Maurice — Victoria Car rental",
      description: "Location de voiture à côté de Trou aux Biches. Victoria Car rental est basé à Pointe aux Piments, à quelques minutes du lagon et de la plage de Mont Choisy.",
      sections: [
        { h: "Le village balnéaire le plus proche", p: [
          "Trou aux Biches est voisin de notre agence de Pointe aux Piments, à quelques minutes par la Coastal Road. Son lagon calme et peu profond et son sable blanc en font l'une des plages les plus agréables de l'île Maurice pour se baigner, et la longue plage de Mont Choisy la prolonge vers le nord.",
          "Cette proximité nous permet de bien connaître le secteur. Beaucoup de vacanciers logent dans des villas et appartements en retrait de la route côtière, où supermarchés et restaurants se rejoignent plutôt en voiture. Une voiture facilite les courses et les dîners à Grand Baie.",
        ]},
        { h: "Excursions depuis Trou aux Biches", p: [
          "Vous êtes ici bien placé pour tout le nord et l'ouest. Port-Louis est à un court trajet par l'autoroute, le jardin de Pamplemousses se trouve à l'intérieur des terres et les plages de Pereybère et Cap Malheureux sont un peu plus haut sur la côte. L'aquarium de Pointe aux Piments est également tout proche, pratique avec des enfants.",
        ]},
        { h: "De l'aéroport à Trou aux Biches", p: [
          "Comptez environ une heure dix depuis l'aéroport international SSR selon la circulation. Vous pouvez récupérer la voiture à l'aéroport ou demander une remise près de votre logement lors de la réservation.",
        ]},
      ],
    },
  },
  {
    slug: "le-morne",
    en: {
      name: "Le Morne",
      title: "Car rental for Le Morne, Mauritius — Victoria Car rental",
      description: "Rent a car to reach Le Morne in the southwest of Mauritius: the UNESCO mountain, kitesurf lagoon, Chamarel and the south coast road.",
      sections: [
        { h: "The southwest peninsula", p: [
          "Le Morne Brabant is the dramatic basalt mountain at the southwest tip of Mauritius, listed by UNESCO for its history as a refuge for escaped slaves. At its foot, a wide lagoon and a long public beach attract swimmers, while the windy outer lagoon is one of the best known kitesurfing spots in the Indian Ocean.",
          "Le Morne is remote compared with the north and the hotels there are spread around the peninsula, so a car makes a big difference. It lets you visit the Seven Coloured Earth and the waterfall at Chamarel in the hills above, eat in the fishing village of La Gaulette and watch the sunset over the mountain on the way back.",
        ]},
        { h: "Planning the drive", p: [
          "From our base in Pointe aux Piments, Le Morne is a longer drive down the west coast through Flic en Flac and Tamarin, so we recommend leaving early in the day for a day trip. If you are staying in the southwest, let us know in the booking notes so we can agree a convenient handover.",
        ]},
        { h: "Arriving at the airport", p: [
          "Driving from SSR International Airport to Le Morne takes roughly an hour, across the south of the island. Picking up your car at arrival avoids a long taxi ride and gives you the freedom to explore the south coast.",
        ]},
      ],
    },
    fr: {
      name: "Le Morne",
      title: "Location de voiture pour Le Morne, île Maurice — Victoria Car rental",
      description: "Louez une voiture pour rejoindre Le Morne au sud-ouest de l'île Maurice : la montagne classée UNESCO, le lagon du kitesurf, Chamarel et la côte sud.",
      sections: [
        { h: "La péninsule du sud-ouest", p: [
          "Le Morne Brabant est l'impressionnante montagne de basalte qui marque la pointe sud-ouest de l'île Maurice, classée par l'UNESCO pour son histoire de refuge des esclaves marrons. À ses pieds, un vaste lagon et une longue plage publique attirent les baigneurs, tandis que le lagon extérieur, très venté, est l'un des spots de kitesurf les plus connus de l'océan Indien.",
          "Le Morne est éloigné du nord et ses hôtels sont dispersés autour de la péninsule : une voiture change tout. Elle permet de visiter la Terre des Sept Couleurs et la cascade de Chamarel sur les hauteurs, de manger au village de pêcheurs de La Gaulette et d'admirer le coucher de soleil sur la montagne au retour.",
        ]},
        { h: "Préparer le trajet", p: [
          "Depuis notre agence de Pointe aux Piments, Le Morne demande un plus long trajet le long de la côte ouest par Flic en Flac et Tamarin ; pour une excursion à la journée, partez tôt. Si vous séjournez dans le sud-ouest, indiquez-le dans les remarques afin que nous convenions d'une remise pratique.",
        ]},
        { h: "Arrivée à l'aéroport", p: [
          "Il faut environ une heure de route de l'aéroport international SSR au Morne, en traversant le sud de l'île. Récupérer la voiture dès l'arrivée évite un long trajet en taxi et vous laisse libre d'explorer la côte sud.",
        ]},
      ],
    },
  },
  {
    slug: "pereybere",
    en: {
      name: "Pereybère",
      title: "Car rental in Pereybère, Mauritius — Victoria Car rental",
      description: "Hire a car for Pereybère in the north of Mauritius. Snorkelling beach, Cap Malheureux and Grand Baie nearby, with airport pickup available.",
      sections: [
        { h: "A small beach with a local feel", p: [
          "Pereybère lies between Grand Baie and Cap Malheureux at the northern tip of the island. Its small public beach is sheltered, with clear water that is good for snorkelling close to shore, and in the evening families gather under the trees with snacks from the food vans along the road.",
          "Accommodation here is mostly guest houses, apartments and small hotels on the side streets. With a car you can head to the quieter coves at Cap Malheureux, see the red-roofed church facing Coin de Mire island, and drive round to the less visited northeast coast at Grand Gaube.",
        ]},
        { h: "Near our base", p: [
          "Pointe aux Piments is on the same northern stretch of coast, so Pereybère is an easy drive from us. The roads in the north are busy around Grand Baie at peak times but short distances keep journeys quick.",
        ]},
        { h: "Airport to Pereybère", p: [
          "Pereybère is one of the furthest points from the airport, roughly an hour and twenty minutes by road. Collecting your car at SSR International Airport is usually the most practical option; add your arrival time to the booking notes and we confirm the handover on WhatsApp.",
        ]},
      ],
    },
    fr: {
      name: "Pereybère",
      title: "Location de voiture à Pereybère, île Maurice — Victoria Car rental",
      description: "Louez une voiture pour Pereybère, au nord de l'île Maurice : plage de snorkeling, Cap Malheureux et Grand Baie, avec prise en charge à l'aéroport.",
      sections: [
        { h: "Une petite plage à l'ambiance locale", p: [
          "Pereybère se trouve entre Grand Baie et Cap Malheureux, à la pointe nord de l'île. Sa petite plage publique est abritée, avec une eau claire idéale pour le snorkeling près du bord, et le soir les familles se retrouvent sous les arbres avec des en-cas achetés aux camionnettes le long de la route.",
          "Les hébergements sont surtout des maisons d'hôtes, appartements et petits hôtels dans les rues adjacentes. Avec une voiture, vous rejoignez les criques tranquilles de Cap Malheureux, l'église au toit rouge face au Coin de Mire et la côte nord-est, moins fréquentée, à Grand Gaube.",
        ]},
        { h: "Près de notre agence", p: [
          "Pointe aux Piments se trouve sur la même portion de côte nord : Pereybère est facile d'accès depuis chez nous. Les routes autour de Grand Baie sont chargées aux heures de pointe, mais les courtes distances gardent les trajets rapides.",
        ]},
        { h: "De l'aéroport à Pereybère", p: [
          "Pereybère est l'un des points les plus éloignés de l'aéroport, à environ une heure vingt de route. Récupérer votre voiture à l'aéroport international SSR est généralement le plus pratique ; indiquez votre heure d'arrivée dans les remarques et nous confirmons la remise sur WhatsApp.",
        ]},
      ],
    },
  },
];

export function findLocation(slug: string) {
  return LOCATIONS.find((l) => l.slug === slug);
}
export function locationText(l: LocationEntry, lang: Lang) {
  return l[lang];
}
