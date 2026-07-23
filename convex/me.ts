import { query } from "./_generated/server";
import { authComponent } from "./auth";
import { requireUser } from "./lib/authz";

/**
 * Current user + role for client-side UI gating (nav links, admin button).
 * Returns null when signed out — never throws, so it's safe to subscribe
 * unconditionally. Server-side enforcement stays in lib/authz.
 */
export const get = query({
  args: {},
  handler: async (ctx) => {
    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (!authUser) return null;
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", authUser._id))
      .unique();
    return {
      userId: authUser._id,
      name: authUser.name ?? "",
      email: authUser.email ?? "",
      image: authUser.image ?? null,
      role: (profile?.role ?? "member") as "member" | "admin",
    };
  },
});

/** Caller's loans, active first, each with its book (M7 — own data only). */
export const loans = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const active = await ctx.db
      .query("loans")
      .withIndex("by_user", (q) => q.eq("userId", user.userId).eq("status", "active"))
      .collect();
    const returned = await ctx.db
      .query("loans")
      .withIndex("by_user", (q) => q.eq("userId", user.userId).eq("status", "returned"))
      .order("desc")
      .take(25);
    const withBooks = async (rows: typeof active) =>
      Promise.all(
        rows.map(async (loan) => ({
          ...loan,
          book: await ctx.db.get(loan.bookId),
        })),
      );
    return {
      active: await withBooks(active),
      past: await withBooks(returned),
    };
  },
});

/** Caller's waiting holds with derived FIFO queue position (spec §4.4). */
export const holds = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const waiting = await ctx.db
      .query("holds")
      .withIndex("by_user", (q) => q.eq("userId", user.userId).eq("status", "waiting"))
      .collect();
    return Promise.all(
      waiting.map(async (hold) => {
        const queue = await ctx.db
          .query("holds")
          .withIndex("by_book", (q) => q.eq("bookId", hold.bookId).eq("status", "waiting"))
          .order("asc")
          .collect();
        const position = queue.findIndex((h) => h._id === hold._id) + 1;
        return {
          ...hold,
          position,
          queueLength: queue.length,
          book: await ctx.db.get(hold.bookId),
        };
      }),
    );
  },
});
