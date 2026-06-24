# Daily Digest

Generate a proactive morning briefing for the family Telegram group chat.

## Trigger
- Cron: 7am Europe/Paris daily
- Manual: "what should we do today", "daily digest", "morning briefing"

## Data Sources

1. **Daily Itinerary** (context/trip-itinerary.md) — match today's date to get segment, lodging, Jess/Sloane schedule, any pre-planned activities or meals
2. **Gmail calendar** — search for Google Calendar invitations/notifications for today (from:calendar-notification@google.com OR subject:invitation with today's date)
3. **Visited log** (context/visited.md) — everything the family has already done. NEVER suggest these again.
4. **Local calendar** (context/local-calendar.md) — check if today is a market day, if Paris Plages or outdoor cinema is running, brocante nearby
5. **Context files** — trip.md, fitness.md, childcare.md, tasks.md for reference
6. **Weather** — web search current weather + hourly forecast for today's location
7. **Memory** — learned preferences (e.g., "they prefer outdoor seating", "Sloane loved the park at Champ de Mars")

## Digest Format

```
Day X of 42 | [Weekday], [Date] | [City/Area] | [Temp]°C, [conditions]

WEATHER
- [Today's weather: high/low, conditions, hourly if rain expected]
- [If hot: sunscreen reminder. If rain: suggest indoor plans. If cool evening: bring a layer.]

SCHEDULE
- [Calendar events, daycare, Jess working/PTO, friends visiting]
- [Upcoming reservation today or tomorrow — time, location, how to get there]

LOCAL TODAY
- [Market day? Which one, hours, what to get there for]
- [Paris Plages open? Outdoor cinema tonight? Brocante nearby?]
- [Only include if something is actually happening today]

PICK OF THE DAY
- [1-2 activity suggestions — NOT from visited.md]
- Pull from the sheet first, fill gaps with web research
- Include: what it is, why today, walk time from apartment or current location
- On work days: morning = Jon+Sloane activity. Evening = family.
- On friend days (Jul 25–Aug 2): group-friendly for 5+ adults + kids
- On Provence days: car-based, village exploration
- Weather-aware: rainy → museums, covered markets. Sunny → parks, gardens.
- Nap-aware: morning activities should wrap by 12:30. Post-3pm for afternoon picks.

EAT HERE
- [1 restaurant/cafe/bakery they haven't tried]
- Include: type of food, distance, price range, reservation needed?
- Sunday/holiday aware — check if it's actually open today
- If it's a market day, suggest grabbing lunch at the market instead

PHRASE DU JOUR
- [One useful street-level French phrase — NOT textbook]
- Phonetic pronunciation in parentheses
- Brief context: when/where you'd actually say this
- Lean local: playground parent chat, ordering for a kid, cafe etiquette, market banter, asking for directions

HEADS UP (only if relevant)
- Task due soon
- Checkout/travel day approaching
- Reservation reminder (today or tomorrow)
- Holiday closure warning
```

## Suggestion Engine Rules

1. **Pull from the sheet first** — itinerary Activities/Meals columns, Gyms & Wellness venues. These are pre-researched and vetted.
2. **Cross-check against visited.md** — if the family has been there, skip it. No repeats.
3. **Fill gaps with web research** — if the sheet is thin for today's area, search for options and note them as new finds.
4. **Weather-match** — rainy → museums, covered markets, indoor play. Sunny → parks, gardens, outdoor dining.
5. **Time-match** — mornings suggest active things, afternoons consider nap window (1-3pm), evenings suggest dinner spots.
6. **When suggesting a new find not on the sheet**, ask if they want to save it: "Want me to add this to the sheet?"
7. **After any visit**, prompt to log it: "How was [place]? Want me to mark it as visited?" Then append to visited.md with date, rating, and short note.

## Keeping the Visited Log Updated

When the family says they went somewhere, did something, or ate somewhere:
- Append a line to `context/visited.md` with: Date | Type | Name | Rating | Notes
- Types: Restaurant, Cafe, Park, Museum, Market, Activity, Gym, Day Trip
- If they don't give a rating, leave it blank — don't ask unless it's natural
- This is how you avoid re-suggesting places

## Rules
- Keep the whole message under 400 words — scannable on a phone
- Use line breaks between sections, not markdown headers (Telegram rendering)
- Never repeat a visited place
- On Provence days (Aug 21-26): no metro directions, switch to driving distances
- Include walk time from apartment for Paris recs
