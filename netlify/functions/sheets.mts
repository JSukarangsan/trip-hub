import type { Context } from "@netlify/functions";

const SHEET_ID = "1eu_Zo9u5xEPuEs-4sxbaOY45SR49Bq51vnwopNv-UM4";
const API_KEY = process.env.GOOGLE_SHEETS_API_KEY;

const TABS: Record<string, string> = {
  places: "Places!A1:K200",
  itinerary: "Daily Itinerary!A1:K50",
};

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const tab = url.searchParams.get("tab") || "places";
  const range = TABS[tab];

  if (!range) {
    return new Response(JSON.stringify({ error: "Unknown tab" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!API_KEY) {
    return new Response(JSON.stringify({ error: "GOOGLE_SHEETS_API_KEY not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const sheetsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(range)}?key=${API_KEY}`;

  try {
    const res = await fetch(sheetsUrl);
    const data = await res.json();

    if (!res.ok) {
      return new Response(JSON.stringify({ error: "Sheets API error", details: data }), {
        status: res.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const rows: string[][] = data.values || [];
    if (rows.length === 0) {
      return new Response(JSON.stringify([]), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=300",
        },
      });
    }

    const headers = rows[0];
    const items = rows.slice(1).map((row) => {
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => {
        obj[h] = row[i] || "";
      });
      return obj;
    });

    return new Response(JSON.stringify(items), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Fetch failed", message: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
