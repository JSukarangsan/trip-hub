#!/usr/bin/env python3
"""
Pull data from the France Trip Google Sheet and write to ~/.hermes/context/ files.
Run via cron daily before the morning digest.

Tabs that sync to context files (read-only, sheet is source of truth):
  - Tasks → context/tasks.md
  - Daily Itinerary → context/trip-itinerary.md
  - Fitness/Wellness → context/fitness.md
  - Childcare → context/childcare.md

Things NOT synced (managed manually or by Hermes memory):
  - Flights, Lodging, Provence Research → static, already in trip.md
  - Preferences, learned facts → Hermes memory (MEMORY.md)
"""

import json
import os
import sys
from pathlib import Path
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

SHEET_ID = os.environ.get("GOOGLE_SHEETS_ID", "1eu_Zo9u5xEPuEs-4sxbaOY45SR49Bq51vnwopNv-UM4")
TOKEN_PATH = os.path.expanduser(os.environ.get("GOOGLE_TOKEN_PATH", "~/hermes-google-token.json"))
CONTEXT_DIR = Path(os.path.expanduser("~/.hermes/context"))

# Tab name → output file, header template
TABS = {
    "To Do": {
        "file": "tasks.md",
        "title": "# Open Tasks",
        "columns": ["Priority", "Category", "Task", "Owner", "Due", "Status", "Notes"],
        "filter": lambda row: row.get("Status", "").strip().lower() not in ("done", "complete", "cancelled"),
    },
    "Daily Itinerary": {
        "file": "trip-itinerary.md",
        "title": "# Daily Itinerary",
        "columns": ["Date", "Day", "Segment", "Lodging", "Jess Schedule", "Sloane Schedule", "Activities", "Meals", "Notes"],
    },
    "Gyms & Wellness": {
        "file": "fitness.md",
        "title": "# Fitness & Wellness Venues",
        "columns": ["Category", "Name", "Website", "Distance", "Metro", "Pricing", "Rating", "English", "Hours", "Notes"],
    },
    "Childcare": {
        "file": "childcare.md",
        "title": "# Childcare Options",
        "columns": ["Program", "Location", "Distance", "Availability", "Languages", "Dates", "Days/Week", "Hours", "Cost", "Status", "Notes"],
    },
    "Holidays": {
        "file": "holidays.md",
        "title": "# French Holidays During Trip",
        "columns": ["Date", "Day", "Country", "Holiday", "Closures", "Impact"],
    },
}


def get_sheets_service():
    with open(TOKEN_PATH) as f:
        token_data = json.load(f)
    creds = Credentials.from_authorized_user_info(token_data)
    return build("sheets", "v4", credentials=creds)


def fetch_tab(service, tab_name):
    result = service.spreadsheets().values().get(
        spreadsheetId=SHEET_ID,
        range=f"'{tab_name}'",
    ).execute()
    rows = result.get("values", [])
    if len(rows) < 2:
        return [], []
    headers = rows[0]
    data = rows[1:]
    return headers, data


def rows_to_dicts(headers, data):
    return [dict(zip(headers, row + [""] * (len(headers) - len(row)))) for row in data]


def write_markdown_table(filepath, title, columns, rows):
    lines = [title, ""]
    # Table header
    lines.append("| " + " | ".join(columns) + " |")
    lines.append("|" + "|".join(["---"] * len(columns)) + "|")
    for row in rows:
        vals = [row.get(c, "").replace("|", "/").replace("\n", " ") for c in columns]
        lines.append("| " + " | ".join(vals) + " |")
    lines.append("")
    filepath.write_text("\n".join(lines))


def main():
    service = get_sheets_service()
    synced = []

    for tab_name, config in TABS.items():
        try:
            headers, data = fetch_tab(service, tab_name)
            if not headers:
                print(f"  SKIP {tab_name}: empty")
                continue

            rows = rows_to_dicts(headers, data)

            # Apply filter if defined (e.g., skip completed tasks)
            row_filter = config.get("filter")
            if row_filter:
                rows = [r for r in rows if row_filter(r)]

            # Use actual sheet headers if our expected columns don't match
            columns = config["columns"]
            actual_cols = [c for c in columns if c in headers]
            if not actual_cols:
                actual_cols = headers  # fallback to whatever's in the sheet

            outpath = CONTEXT_DIR / config["file"]
            write_markdown_table(outpath, config["title"], actual_cols, rows)
            synced.append(f"{tab_name} → {config['file']} ({len(rows)} rows)")
        except Exception as e:
            print(f"  ERROR {tab_name}: {e}", file=sys.stderr)

    print(f"Synced {len(synced)} tabs:")
    for s in synced:
        print(f"  {s}")


if __name__ == "__main__":
    main()
