import { ConvexError, v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { components } from "./_generated/api";
import { requireAdmin } from "./lib/authz";
import { closeLoanAndPromoteHold } from "./loans";
import { authComponent } from "./auth";

/**
 * Admin surface (spec §5.2, §7). Every function re-checks role server-side via
 * requireAdmin — middleware and hidden UI are UX, this is the gate.
 */

const bookFields = {
  title: v.string(),
  author: v.string(),
  publisher: v.optional(v.string()),
  year: v.optional(v.number()),
  topic: v.string(),
  language: v.string(),
  audience: v.union(v.literal("child"), v.literal("teen"), v.literal("adult")),
  tint: v.optional(v.string()),
  staffPick: v.boolean(),
  isNew: v.boolean(),
  description: v.string(),
};

// ---- Catalog CRUD (A1) ----------------------------------------------------

export const createBook = mutation({
  args: bookFields,
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return ctx.db.insert("books", { ...args, status: "available" });
  },
});

export const updateBook = mutation({
  args: {
    bookId: v.id("books"),
    patch: v.object(
      Object.fromEntries(
        Object.entries(bookFields).map(([k, val]) => [k, v.optional(val)]),
      ) as Record<string, ReturnType<typeof v.optional>>,
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const book = await ctx.db.get(args.bookId);
    if (!book) throw new ConvexError("BookNotFound");
    await ctx.db.patch(args.bookId, args.patch);
  },
});

export const removeBook = mutation({
  args: { bookId: v.id("books") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const activeLoan = await ctx.db
      .query("loans")
      .withIndex("by_book", (q) => q.eq("bookId", args.bookId).eq("status", "active"))
      .first();
    if (activeLoan) throw new ConvexError("BookHasActiveLoan");
    // Clear any waiting holds so no queue points at a dead book.
    const waiting = await ctx.db
      .query("holds")
      .withIndex("by_book", (q) => q.eq("bookId", args.bookId).eq("status", "waiting"))
      .collect();
    for (const hold of waiting) {
      await ctx.db.patch(hold._id, { status: "cancelled" });
    }
    await ctx.db.delete(args.bookId);
  },
});

// ---- Loans (A2, A3) -------------------------------------------------------

export const listLoans = query({
  args: {
    userId: v.optional(v.string()),
    bookId: v.optional(v.id("books")),
    status: v.optional(v.union(v.literal("active"), v.literal("returned"))),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    let loans;
    if (args.userId !== undefined && args.status !== undefined) {
      loans = await ctx.db
        .query("loans")
        .withIndex("by_user", (q) => q.eq("userId", args.userId!).eq("status", args.status!))
        .collect();
    } else if (args.bookId !== undefined && args.status !== undefined) {
      loans = await ctx.db
        .query("loans")
        .withIndex("by_book", (q) => q.eq("bookId", args.bookId!).eq("status", args.status!))
        .collect();
    } else {
      loans = await ctx.db.query("loans").order("desc").take(200);
      if (args.userId !== undefined) loans = loans.filter((l) => l.userId === args.userId);
      if (args.bookId !== undefined) loans = loans.filter((l) => l.bookId === args.bookId);
      if (args.status !== undefined) loans = loans.filter((l) => l.status === args.status);
    }
    return Promise.all(
      loans.map(async (loan) => ({
        ...loan,
        book: await ctx.db.get(loan.bookId),
        borrower: await authComponent.getAnyUserById(ctx, loan.userId),
      })),
    );
  },
});

export const forceReturn = mutation({
  args: { loanId: v.id("loans") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const loan = await ctx.db.get(args.loanId);
    if (!loan) throw new ConvexError("LoanNotFound");
    if (loan.status !== "active") throw new ConvexError("LoanAlreadyClosed");
    await closeLoanAndPromoteHold(ctx, args.loanId, loan.bookId);
  },
});

// ---- Holds (A4) -----------------------------------------------------------

export const listHolds = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const holds = await ctx.db.query("holds").order("desc").take(200);
    return Promise.all(
      holds.map(async (hold) => ({
        ...hold,
        book: await ctx.db.get(hold.bookId),
        holder: await authComponent.getAnyUserById(ctx, hold.userId),
      })),
    );
  },
});

export const removeHold = mutation({
  args: { holdId: v.id("holds") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const hold = await ctx.db.get(args.holdId);
    if (!hold) throw new ConvexError("HoldNotFound");
    await ctx.db.patch(args.holdId, { status: "cancelled" });
  },
});

// ---- Users (A5) -----------------------------------------------------------

export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const profiles = await ctx.db.query("profiles").collect();
    return Promise.all(
      profiles.map(async (profile) => ({
        ...profile,
        user: await authComponent.getAnyUserById(ctx, profile.userId),
      })),
    );
  },
});

export const setRole = mutation({
  args: {
    userId: v.string(),
    role: v.union(v.literal("member"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    const caller = await requireAdmin(ctx);
    if (caller.userId === args.userId && args.role !== "admin") {
      throw new ConvexError("CannotDemoteSelf");
    }
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
    if (profile) {
      await ctx.db.patch(profile._id, { role: args.role });
    } else {
      await ctx.db.insert("profiles", { userId: args.userId, role: args.role });
    }
  },
});

/**
 * Bootstrap: promote a user by email from the CLI. internalMutation — not
 * callable from any client, only `npx convex run admin:bootstrapAdmin`.
 * Solves the "who promotes the first admin" chicken-and-egg.
 */
export const bootstrapAdmin = internalMutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const authUser = await ctx.runQuery(components.betterAuth.adapter.findOne, {
      model: "user",
      where: [{ field: "email", value: args.email }],
    });
    if (!authUser) throw new ConvexError(`No user with email ${args.email} — sign in once first`);
    const userId = authUser._id as string;
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (profile) {
      await ctx.db.patch(profile._id, { role: "admin" });
    } else {
      await ctx.db.insert("profiles", { userId, role: "admin" });
    }
    return `${args.email} is now an admin`;
  },
});
