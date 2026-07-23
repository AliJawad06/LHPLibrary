import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  /**
   * App-owned per-user data. The Better Auth component owns user/session/
   * account/verification tables in its own namespace; `profiles` extends the
   * auth user with app concerns. Role lives here (not as an auth
   * additionalField) so admins can change it with a plain patch and clients
   * see the change reactively.
   */
  profiles: defineTable({
    userId: v.string(), // Better Auth user id
    role: v.union(v.literal("member"), v.literal("admin")),
  }).index("by_user", ["userId"]),

  books: defineTable({
    title: v.string(),
    author: v.string(),
    publisher: v.optional(v.string()),
    year: v.optional(v.number()),
    topic: v.string(),
    language: v.string(),
    audience: v.union(v.literal("child"), v.literal("teen"), v.literal("adult")),
    tint: v.optional(v.string()),
    /** Uploaded cover photo; absent → typography-forward tinted panel. */
    coverStorageId: v.optional(v.id("_storage")),
    staffPick: v.boolean(),
    isNew: v.boolean(),
    description: v.string(),
    status: v.union(v.literal("available"), v.literal("loaned")),
  })
    .index("by_topic", ["topic"])
    .index("by_status", ["status"])
    .index("by_author", ["author"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["topic", "language", "audience", "status"],
    }),

  loans: defineTable({
    bookId: v.id("books"),
    userId: v.string(),
    status: v.union(v.literal("active"), v.literal("returned")),
    borrowedAt: v.number(),
    dueAt: v.number(),
    returnedAt: v.optional(v.number()),
    /**
     * Snapshot of the chosen pickup event, taken at borrow time — calendar
     * entries can be edited or deleted later, but the promise made to the
     * member shouldn't drift. Absent on hold-fulfilled loans until the member
     * chooses (loans.setPickup).
     */
    pickup: v.optional(
      v.object({
        gcalId: v.string(),
        title: v.string(),
        location: v.optional(v.string()),
        start: v.number(),
      }),
    ),
  })
    .index("by_user", ["userId", "status"])
    .index("by_book", ["bookId", "status"]),

  /** Cache of upcoming org events synced hourly from the public Google Calendar. */
  events: defineTable({
    gcalId: v.string(),
    title: v.string(),
    location: v.optional(v.string()),
    start: v.number(),
    end: v.optional(v.number()),
    syncedAt: v.number(),
  })
    .index("by_gcalId", ["gcalId"])
    .index("by_start", ["start"]),

  holds: defineTable({
    bookId: v.id("books"),
    userId: v.string(),
    status: v.union(
      v.literal("waiting"),
      v.literal("fulfilled"),
      v.literal("cancelled"),
    ),
    createdAt: v.number(),
  })
    .index("by_book", ["bookId", "status", "createdAt"])
    .index("by_user", ["userId", "status"]),
});
