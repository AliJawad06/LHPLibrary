/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as admin from "../admin.js";
import type * as auth from "../auth.js";
import type * as books from "../books.js";
import type * as holds from "../holds.js";
import type * as http from "../http.js";
import type * as loans from "../loans.js";
import type * as me from "../me.js";
import type * as seed from "../seed.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  auth: typeof auth;
  books: typeof books;
  holds: typeof holds;
  http: typeof http;
  loans: typeof loans;
  me: typeof me;
  seed: typeof seed;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  betterAuth: {
    adapter: {
      create: FunctionReference<"mutation", "internal", any, any>;
      findOne: FunctionReference<"query", "internal", any, any>;
      findMany: FunctionReference<"query", "internal", any, any>;
      updateOne: FunctionReference<"mutation", "internal", any, any>;
      updateMany: FunctionReference<"mutation", "internal", any, any>;
      deleteOne: FunctionReference<"mutation", "internal", any, any>;
      deleteMany: FunctionReference<"mutation", "internal", any, any>;
    };
  };
};
