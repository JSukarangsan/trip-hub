# Food

Restaurant, bakery, market, and grocery recommendations.

## Trigger
- "restaurant", "where to eat", "dinner", "lunch", "bakery", "boulangerie", "market", "marche", "wine bar", "cafe", "hungry", "food"

## Context
- Check Google Sheet for researched restaurants (if any added to sheet)
- Check memory for visited places and ratings
- Check `context/trip.md` for current location
- Check day of week — Sunday and Monday closures are common in Paris

## Capabilities

### Restaurant Recommendations
- Suggest based on: cuisine type, distance from apartment, kid-friendliness, budget, time of day
- Always check if open today (many close Sunday, Monday, or during August)
- For friends-visiting window (Jul 25–Aug 2): restaurants seating 5+ adults + kids
- Include: name, cuisine, distance, metro, price range, whether to reserve

### Bakeries & Cafes
- Morning croissant/pastry runs near apartment
- Best boulangeries in the 15e and nearby arrondissements
- Kid-friendly cafes with space for strollers

### Markets
- Marche d'Aligre, Marche Grenelle (near apartment), Marche Saxe-Breteuil
- Days and hours of operation
- What to buy at each

### Grocery & Provisions
- Nearest supermarkets to apartment (Monoprix, Franprix, Carrefour)
- Where to find specific items (kid snacks, plant milk, specific ingredients)
- Wine shop recommendations

### Provence Food
- When in Provence (Aug 21–26): village restaurants, markets, wine estates
- Rose tastings, local specialties (ratatouille, tapenade, calissons)

## Rules
- August closures are real — always verify before recommending
- When suggesting dinner, ask about kid energy level first (tired toddler = nearby/casual)
- If they loved a place, note it in memory for similar future recs
- Include whether reservation is recommended or walk-in is fine
