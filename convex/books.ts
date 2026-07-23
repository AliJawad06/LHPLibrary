import { v } from "convex/values";
import { query } from "./_generated/server";
import { attachCoverUrl, attachCoverUrls } from "./lib/covers";

/**
 * Public catalog queries — no auth required (spec M2: browse without sign-in).
 * Availability (`status`) is a transactionally-maintained field, so these
 * reads are cheap and always consistent with loan state.
 */

export const list = query({
  args: {
    topic: v.optional(v.string()),
    language: v.optional(v.string()),
    audience: v.optional(
      v.union(v.literal("child"), v.literal("teen"), v.literal("adult")),
    ),
    status: v.optional(v.union(v.literal("available"), v.literal("loaned"))),
  },
  handler: async (ctx, args) => {
    let books;
    if (args.topic !== undefined) {
      books = await ctx.db
        .query("books")
        .withIndex("by_topic", (q) => q.eq("topic", args.topic!))
        .collect();
    } else if (args.status !== undefined) {
      books = await ctx.db
        .query("books")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .collect();
    } else {
      books = await ctx.db.query("books").collect();
    }
    const filtered = books.filter(
      (b) =>
        (args.language === undefined || b.language === args.language) &&
        (args.audience === undefined || b.audience === args.audience) &&
        (args.status === undefined || b.status === args.status),
    );
    return attachCoverUrls(ctx, filtered);
  },
});

export const search = query({
  args: {
    query: v.string(),
    topic: v.optional(v.string()),
    language: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const books = await ctx.db
      .query("books")
      .withSearchIndex("search_title", (q) => {
        let s = q.search("title", args.query);
        if (args.topic !== undefined) s = s.eq("topic", args.topic);
        if (args.language !== undefined) s = s.eq("language", args.language);
        return s;
      })
      .take(50);
    return attachCoverUrls(ctx, books);
  },
});

export const get = query({
  args: { bookId: v.id("books") },
  handler: async (ctx, args) => {
    const book = await ctx.db.get(args.bookId);
    if (!book) return null;
    return attachCoverUrl(ctx, book);
  },
});
