export interface FrenchPhrase {
  french: string;
  pronunciation: string;
  english: string;
  context: string;
}

export interface NeighborhoodSpotlight {
  arrondissement: string;
  name: string;
  tip: string;
}

export const phrases: FrenchPhrase[] = [
  { french: "Bonjour", pronunciation: "bohn-ZHOOR", english: "Hello / Good day", context: "Use every single interaction — entering shops, cafes, everywhere" },
  { french: "Bonsoir", pronunciation: "bohn-SWAHR", english: "Good evening", context: "Switch from Bonjour after ~6pm" },
  { french: "Excusez-moi", pronunciation: "ex-koo-zay MWAH", english: "Excuse me", context: "Before asking a question or squeezing past someone" },
  { french: "Je voudrais...", pronunciation: "zhuh voo-DRAY", english: "I would like...", context: "The polite way to order anything" },
  { french: "L'addition, s'il vous plait", pronunciation: "lah-dee-SYOHN seel voo PLAY", english: "The check, please", context: "Waiters never bring the check until you ask" },
  { french: "Une carafe d'eau", pronunciation: "oon kah-RAHF doh", english: "A pitcher of tap water", context: "Free tap water — don't pay for bottled unless you want to" },
  { french: "Un cafe", pronunciation: "uhn kah-FAY", english: "An espresso", context: "Cafe = espresso in France. For American-style, ask for un cafe allonge" },
  { french: "Est-ce que vous avez une chaise haute?", pronunciation: "es kuh voo zah-VAY oon shez OHT", english: "Do you have a high chair?", context: "Essential with Sloane at restaurants" },
  { french: "Ou est l'aire de jeux?", pronunciation: "oo ay LAIR duh zhuh", english: "Where is the playground?", context: "Paris has playgrounds everywhere — ask locals for the nearest one" },
  { french: "Parlez-vous anglais?", pronunciation: "par-LAY voo ahn-GLAY", english: "Do you speak English?", context: "Always ask in French first — it's polite and they'll appreciate the effort" },
  { french: "Je ne comprends pas", pronunciation: "zhuh nuh kohm-PRAHN pah", english: "I don't understand", context: "They'll usually switch to English or slow down" },
  { french: "Combien ca coute?", pronunciation: "kohm-BYEHN sah KOOT", english: "How much does it cost?", context: "At markets where prices aren't posted" },
  { french: "Je regarde seulement", pronunciation: "zhuh reh-GARD suhl-MAHN", english: "I'm just looking", context: "When shop assistants approach you" },
  { french: "Pouvez-vous m'aider?", pronunciation: "poo-VAY voo may-DAY", english: "Can you help me?", context: "When you need directions or assistance" },
  { french: "Ou sont les toilettes?", pronunciation: "oo sohn lay twah-LET", english: "Where are the bathrooms?", context: "Cafes usually have them downstairs. Buy a coffee first." },
  { french: "Mon enfant a trois ans", pronunciation: "mohn ahn-FAHN ah twah zahn", english: "My child is three years old", context: "Useful for museum entries, metro (free under 4), activities" },
  { french: "Merci beaucoup", pronunciation: "mehr-SEE boh-KOO", english: "Thank you very much", context: "A little extra warmth goes a long way" },
  { french: "Au revoir", pronunciation: "oh reh-VWAHR", english: "Goodbye", context: "Always say it when leaving a shop or restaurant" },
  { french: "Un cafe allonge", pronunciation: "uhn kah-FAY ah-lohn-ZHAY", english: "An Americano-style coffee", context: "Closest thing to American drip coffee" },
  { french: "C'est delicieux", pronunciation: "say day-lee-SYUH", english: "It's delicious", context: "Compliment the food — chefs and waiters love it" },
];

export const neighborhoods: NeighborhoodSpotlight[] = [
  { arrondissement: "1er", name: "Louvre", tip: "Tuileries Garden has a summer carnival with trampolines and a carousel — great for Sloane" },
  { arrondissement: "2e", name: "Bourse", tip: "Rue Montorgueil is a pedestrian market street with bakeries, fromageries, and crape stands" },
  { arrondissement: "3e", name: "Temple (Marais)", tip: "Marche des Enfants Rouges is the oldest covered market in Paris — get the Moroccan couscous" },
  { arrondissement: "4e", name: "Hotel-de-Ville", tip: "Musee Carnavalet is free, kid-friendly, and tells the history of Paris through rooms" },
  { arrondissement: "5e", name: "Pantheon (Latin Quarter)", tip: "Your arrival night neighborhood — Rue Mouffetard has cheap eats and a great market" },
  { arrondissement: "6e", name: "Luxembourg", tip: "Luxembourg Garden puppet shows run all summer. Sailboat rental at the pond is a must with Sloane" },
  { arrondissement: "7e", name: "Palais-Bourbon", tip: "Champ de Mars is your backyard. Musee Rodin's garden is the most underrated picnic spot in Paris" },
  { arrondissement: "8e", name: "Elysee", tip: "Parc Monceau is an elegant, quiet park with a playground. Less crowded than Luxembourg" },
  { arrondissement: "9e", name: "Opera", tip: "Galeries Lafayette has a free rooftop with panoramic views — no need to buy anything" },
  { arrondissement: "10e", name: "Enclos-St-Laurent", tip: "Canal Saint-Martin locks are mesmerizing. Great for a stroller walk with cafe stops" },
  { arrondissement: "11e", name: "Popincourt", tip: "Rue Oberkampf has the best street art in Paris and a young, local food scene" },
  { arrondissement: "12e", name: "Reuilly", tip: "Promenade Plantee — the original elevated park that inspired NYC's High Line. Stroller-friendly" },
  { arrondissement: "13e", name: "Gobelins", tip: "Chinatown has the best pho in Paris. Huge Asian supermarkets for snack supplies" },
  { arrondissement: "14e", name: "Observatoire", tip: "Parc Montsouris is peaceful and rarely touristy. The Catacombs entrance is nearby" },
  { arrondissement: "15e", name: "Vaugirard (Home!)", tip: "Your home base. Marche Grenelle Wed/Sun mornings, 2 min walk. Rue du Commerce for stroller-friendly shopping" },
  { arrondissement: "16e", name: "Passy", tip: "Jardin d'Acclimatation is a full amusement park + zoo in Bois de Boulogne — half-day with Sloane" },
  { arrondissement: "17e", name: "Batignolles-Monceau", tip: "Batignolles organic market on Saturdays is low-key and local. Great people-watching" },
  { arrondissement: "18e", name: "Butte-Montmartre", tip: "Skip Sacre-Coeur crowds. Instead walk Rue Lepic for bakeries and the Amelie cafe" },
  { arrondissement: "19e", name: "Buttes-Chaumont", tip: "Parc des Buttes-Chaumont has cliffs, a waterfall, and a temple. Cite des Sciences nearby for Sloane" },
  { arrondissement: "20e", name: "Menilmontant", tip: "Pere Lachaise is surprisingly kid-friendly for a walk. Belleville has the best city views" },
];

export function getTodaysPhrase(): FrenchPhrase {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return phrases[dayOfYear % phrases.length];
}

export function getTodaysNeighborhood(): NeighborhoodSpotlight {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return neighborhoods[dayOfYear % neighborhoods.length];
}
