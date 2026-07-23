import { ConvexError } from "convex/values";
import { authComponent } from "../auth";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export type Role = "member" | "admin";

export interface AppUser {
  /** Better Auth user id (string form, used as the FK on loans/holds). */
  userId: string;
  name: string;
  email: string;
  image: string | null;
  role: Role;
}

/**
 * Resolve the authenticated Better Auth user plus their app profile.
 * Throws if unauthenticated. Reads only — safe in queries.
 */
export async function requireUser(ctx: QueryCtx | MutationCtx): Promise<AppUser> {
  const authUser = await authComponent.safeGetAuthUser(ctx);
  if (!authUser) throw new ConvexError("Unauthenticated");
  const userId = authUser._id;
  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();
  return {
    userId,
    name: authUser.name ?? "",
    email: authUser.email ?? "",
    image: authUser.image ?? null,
    role: profile?.role ?? "member",
  };
}

/**
 * Same as requireUser, but in a mutation also lazily creates the profile row
 * on first contact so every user ends up with an explicit role record.
 */
export async function requireUserEnsureProfile(ctx: MutationCtx): Promise<AppUser> {
  const user = await requireUser(ctx);
  const existing = await ctx.db
    .query("profiles")
    .withIndex("by_user", (q) => q.eq("userId", user.userId))
    .unique();
  if (!existing) {
    await ctx.db.insert("profiles", { userId: user.userId, role: "member" });
  }
  return user;
}

/** Role gate. The Convex function is the enforcement point, not the UI. */
export async function requireAdmin(ctx: QueryCtx | MutationCtx): Promise<AppUser> {
  const user = await requireUser(ctx);
  if (user.role !== "admin") throw new ConvexError("Forbidden");
  return user;
}
