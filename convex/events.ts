import { v } from "convex/values";
import { internalAction, internalMutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Pickup events come from the org's public Google Calendar. Queries can't
 * fetch external URLs (they're deterministic), so an hourly cron action
 * (convex/crons.ts) syncs upcoming events into the `events` cache table and
 * the UI reads them like any other reactive query.
 *
 * Initial population / manual refresh: `npx convex run events:sync`
 * Requires deployment env vars: GOOGLE_CALENDAR_ID, GOOGLE_API_KEY.
 */

interface GCalItem {
  id: string;
  status?: string;
  summary?: string;
  location?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
}

function toMs(t: { dateTime?: string; date?: string } | undefined): number | undefined {
  if (!t) return undefined;
  if (t.dateTime) return Date.parse(t.dateTime);
  // All-day events carry a bare date; treat as local midnight UTC.
  if (t.date) return Date.parse(`${t.date}T00:00:00Z`);
  return undefined;
}

export const sync = internalAction({
  args: {},
  handler: async (ctx) => {
    const calendarId = process.env.GOOGLE_CALENDAR_ID;
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!calendarId || !apiKey) {
      throw new Error(
        "GOOGLE_CALENDAR_ID / GOOGLE_API_KEY not set on this deployment — see SETUP.md",
      );
    }

    const now = new Date();
    const timeMax = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000); // +60 days
    const url = new URL(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
    );
    url.searchParams.set("key", apiKey);
    url.searchParams.set("timeMin", now.toISOString());
    url.searchParams.set("timeMax", timeMax.toISOString());
    url.searchParams.set("singleEvents", "true");
    url.searchParams.set("orderBy", "startTime");
    url.searchParams.set("maxResults", "50");

    const res = await fetch(url.toString());
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Google Calendar API ${res.status}: ${body.slice(0, 300)}`);
    }
    const data = (await res.json()) as { items?: GCalItem[] };

    const events = (data.items ?? [])
      .filter((item) => item.status !== "cancelled" && item.id)
      .flatMap((item) => {
        const start = toMs(item.start);
        if (start === undefined) return [];
        return [
          {
            gcalId: item.id,
            title: item.summary?.trim() || "Community event",
            location: item.location?.trim() || undefined,
            start,
            end: toMs(item.end),
          },
        ];
      });

    await ctx.runMutation(internal.events.replaceUpcoming, { events });
    return `Synced ${events.length} upcoming events`;
  },
});

export const replaceUpcoming = internalMutation({
  args: {
    events: v.array(
      v.object({
        gcalId: v.string(),
        title: v.string(),
        location: v.optional(v.string()),
        start: v.number(),
        end: v.optional(v.number()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    // Full replace is safe: loans snapshot pickup details at borrow time, so
    // nothing depends on cache rows surviving.
    const existing = await ctx.db.query("events").collect();
    for (const row of existing) {
      await ctx.db.delete(row._id);
    }
    const syncedAt = Date.now();
    for (const event of args.events) {
      await ctx.db.insert("events", { ...event, syncedAt });
    }
  },
});

/** Upcoming events for the pickup dropdown, soonest first. Public. */
export const upcoming = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db
      .query("events")
      .withIndex("by_start", (q) => q.gt("start", Date.now()))
      .order("asc")
      .take(25);
  },
});
