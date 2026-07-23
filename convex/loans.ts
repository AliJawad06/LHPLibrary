import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { requireUser, requireUserEnsureProfile } from "./lib/authz";
import { BORROW_LIMIT, LOAN_PERIOD_MS } from "./lib/constants";

/**
 * Spec §6 — borrowBook. Steps 2–5 run in one serializable mutation, so two
 * members racing for the last copy resolve to exactly one winner (M4).
 */
export const borrow = mutation({
  args: { bookId: v.id("books"), pickupEventId: v.id("events") },
  handler: async (ctx, args) => {
    const user = await requireUserEnsureProfile(ctx);

    const book = await ctx.db.get(args.bookId);
    if (!book) throw new ConvexError("BookNotFound");
    if (book.status !== "available") throw new ConvexError("BookNotAvailable");

    const pickup = await resolvePickup(ctx, args.pickupEventId);

    const activeLoans = await ctx.db
      .query("loans")
      .withIndex("by_user", (q) => q.eq("userId", user.userId).eq("status", "active"))
      .collect();
    if (activeLoans.length >= BORROW_LIMIT) {
      throw new ConvexError("BorrowLimitReached");
    }

    const now = Date.now();
    const loanId = await ctx.db.insert("loans", {
      bookId: args.bookId,
      userId: user.userId,
      status: "active",
      borrowedAt: now,
      dueAt: now + LOAN_PERIOD_MS,
      pickup,
    });
    await ctx.db.patch(args.bookId, { status: "loaned" });
    return loanId;
  },
});

/**
 * Choose (or change) the pickup event on an active loan. Hold-fulfilled loans
 * are created without a pickup — the member wasn't present — so My shelf
 * prompts them to pick one here.
 */
export const setPickup = mutation({
  args: { loanId: v.id("loans"), pickupEventId: v.id("events") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const loan = await ctx.db.get(args.loanId);
    if (!loan) throw new ConvexError("LoanNotFound");
    if (loan.userId !== user.userId && user.role !== "admin") {
      throw new ConvexError("NotYourLoan");
    }
    if (loan.status !== "active") throw new ConvexError("LoanAlreadyClosed");

    const pickup = await resolvePickup(ctx, args.pickupEventId);
    await ctx.db.patch(args.loanId, { pickup });
  },
});

/** Validate a pickup event and return the snapshot to store on the loan. */
async function resolvePickup(ctx: MutationCtx, pickupEventId: Id<"events">) {
  const event = await ctx.db.get(pickupEventId);
  if (!event || event.start <= Date.now()) {
    throw new ConvexError("PickupEventInvalid");
  }
  return {
    gcalId: event.gcalId,
    title: event.title,
    location: event.location,
    start: event.start,
  };
}

/**
 * Spec §6 — returnBook. Ownership-checked (admin may force via
 * admin.loans.forceReturn which shares this close path). Hold promotion
 * happens in the same mutation so availability and queue state can't
 * interleave inconsistently (M5).
 */
export const returnBook = mutation({
  args: { loanId: v.id("loans") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const loan = await ctx.db.get(args.loanId);
    if (!loan) throw new ConvexError("LoanNotFound");
    if (loan.userId !== user.userId && user.role !== "admin") {
      throw new ConvexError("NotYourLoan");
    }
    if (loan.status !== "active") throw new ConvexError("LoanAlreadyClosed");

    await closeLoanAndPromoteHold(ctx, args.loanId, loan.bookId);
  },
});

/**
 * Shared close path: mark the loan returned, then either hand the book to the
 * next waiting hold (creating their loan — v1 policy: hold fulfillment
 * auto-borrows) or set it available.
 */
export async function closeLoanAndPromoteHold(
  ctx: MutationCtx,
  loanId: Id<"loans">,
  bookId: Id<"books">,
) {
  const now = Date.now();
  await ctx.db.patch(loanId, { status: "returned", returnedAt: now });

  const nextHold = await ctx.db
    .query("holds")
    .withIndex("by_book", (q) => q.eq("bookId", bookId).eq("status", "waiting"))
    .order("asc")
    .first();

  if (nextHold) {
    await ctx.db.patch(nextHold._id, { status: "fulfilled" });
    await ctx.db.insert("loans", {
      bookId,
      userId: nextHold.userId,
      status: "active",
      borrowedAt: now,
      dueAt: now + LOAN_PERIOD_MS,
    });
    // Book stays "loaned" — it moved straight to the next reader.
  } else {
    await ctx.db.patch(bookId, { status: "available" });
  }
}
