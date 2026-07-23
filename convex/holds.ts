import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";
import { requireUser, requireUserEnsureProfile } from "./lib/authz";

export const place = mutation({
  args: { bookId: v.id("books") },
  handler: async (ctx, args) => {
    const user = await requireUserEnsureProfile(ctx);

    const book = await ctx.db.get(args.bookId);
    if (!book) throw new ConvexError("BookNotFound");
    if (book.status !== "loaned") {
      throw new ConvexError("BookIsAvailable"); // just borrow it
    }

    const existing = await ctx.db
      .query("holds")
      .withIndex("by_user", (q) => q.eq("userId", user.userId).eq("status", "waiting"))
      .collect();
    if (existing.some((h) => h.bookId === args.bookId)) {
      throw new ConvexError("DuplicateHold");
    }

    return ctx.db.insert("holds", {
      bookId: args.bookId,
      userId: user.userId,
      status: "waiting",
      createdAt: Date.now(),
    });
  },
});

export const cancel = mutation({
  args: { holdId: v.id("holds") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const hold = await ctx.db.get(args.holdId);
    if (!hold) throw new ConvexError("HoldNotFound");
    if (hold.userId !== user.userId && user.role !== "admin") {
      throw new ConvexError("NotYourHold");
    }
    if (hold.status !== "waiting") throw new ConvexError("HoldNotWaiting");
    await ctx.db.patch(args.holdId, { status: "cancelled" });
  },
});
