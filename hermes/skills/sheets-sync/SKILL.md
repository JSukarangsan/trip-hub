# Sheets Sync

Read from and write to the family's Google Sheets trip planning document.

## Trigger
- Automatic: on startup and daily at 8am CEST (before morning digest)
- Manual: "sync sheet", "update sheet", "mark as visited", "add to sheet"

## Google Sheet
- **ID**: `1eu_Zo9u5xEPuEs-4sxbaOY45SR49Bq51vnwopNv-UM4`
- **Auth**: Google Sheets API with token at `GOOGLE_TOKEN_PATH`

## Sheet Tabs (known structure)

1. **Daily Itinerary** — Date, Day, Segment, Lodging, Jess Schedule, Sloane Schedule, Activities, Meals, Notes
2. **Time Zones** — CEST/PST/EST reference
3. **Places** — Category, Name, Website, Distance from Apt, Metro, Pricing, Rating, English Friendly, Hours, Notes (renamed from Fitness/Wellness — now includes all place types: fitness, restaurants, markets, shopping, attractions, etc.)
4. **Flights** — Leg, Date, Airline, Flight#, Confirmation, Airports, Times, Terminals, Duration, Seats, Cost
5. **Lodging** — Segment, Check-in, Check-out, Nights, Property, Address, Platform, Confirmation, Cost, Notes
6. **Post Paris Options** — Hotel options with URLs and costs
7. **Childcare** — Program, Location, Distance, Availability, Languages, Dates, Days/Week, Hours, Cost, Status, Notes
8. **To Do** — Priority, Category, Task, Owner, Due, Status, Notes
9. **Holidays** — Date, Day, Country, Holiday, Closures, Impact
10. **Nannies** — Nanny research and contacts

## Read Operations
- Pull venue data for recommendations (fitness, restaurants, attractions)
- Check task statuses
- Verify reservation details and confirmation numbers
- Get childcare schedule

## Write Operations
- **Mark visited**: Add "VISITED" + date to Notes column for any venue
- **Add rating**: Append rating (1-5) and short note to visited venues
- **Update task status**: Change status to "Done" or "In Progress"
- **Add new finds**: If the family discovers a great place not on the sheet, add a new row
- **Update Activities/Meals columns**: Fill in the daily itinerary as the trip progresses

## Rules
- Always confirm before writing to the sheet: "Want me to mark X as visited?"
- When adding notes, keep them concise (under 50 chars)
- Sync local context files after sheet changes so skills have fresh data
- If the sheet structure changes, adapt gracefully and note the new structure in memory
