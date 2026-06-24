# Tools

## Google Sheets (Trip Research Document)

The family's trip planning spreadsheet is the shared source of truth.

- **Sheet ID**: `1eu_Zo9u5xEPuEs-4sxbaOY45SR49Bq51vnwopNv-UM4`
- **Auth**: Google Sheets API with token at `GOOGLE_TOKEN_PATH` (`~/hermes-google-token.json`)

### Tab Structure (for reads and writes)

| Tab | Columns | Context File |
|---|---|---|
| Daily Itinerary | Date, Day, Segment, Lodging, Jess Schedule, Sloane Schedule, Activities, Meals, Notes | trip-itinerary.md |
| Gyms & Wellness | Category, Name, Website, Distance, Metro, Pricing, Rating, English, Hours, Notes | fitness.md |
| To Do | Priority, Category, Task, Owner, Due, Status, Notes | tasks.md |
| Childcare | Program, Location, Distance, Availability, Languages, Dates, Days/Week, Hours, Cost, Status, Notes | childcare.md |
| Holidays | Date, Day, Country, Holiday, Closures, Impact | holidays.md |
| Flights | read-only — static reference | trip.md |
| Lodging | read-only — static reference | trip.md |

### Write Operations

- **Append row**: Add new venue, task, or childcare option to the right tab
- **Update cell**: Change task status, add "VISITED" + date, add rating
- **Fill in itinerary**: Update Activities/Meals columns as the trip progresses

After any sheet write, also update the matching context file so your knowledge is immediately current.

## Web Search

Use web search for:
- Current weather in Paris/Provence
- Restaurant hours and menus (verify sheet data is current)
- Event listings and temporary exhibitions
- Metro disruptions and transit updates
- Pharmacy locations and hours
- Playground and park details

## Memory

- `MEMORY.md` — Learned facts about the trip, what works, what doesn't
- `USER.md` — Jon and Jess's preferences, built from conversations
- Use the memory tool to persist useful observations (e.g., "they prefer walking over metro under 15 min")

## Session Search

Query `state.db` for past conversations when asked "what did we do" or "didn't we talk about X?"
