import type { QueryCtx } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";

export type BookWithCover = Doc<"books"> & { coverUrl: string | null };

export async function attachCoverUrl(
  ctx: QueryCtx,
  book: Doc<"books">,
): Promise<BookWithCover> {
  return {
    ...book,
    coverUrl: book.coverStorageId
      ? await ctx.storage.getUrl(book.coverStorageId)
      : null,
  };
}

export async function attachCoverUrls(
  ctx: QueryCtx,
  books: Doc<"books">[],
): Promise<BookWithCover[]> {
  return Promise.all(books.map((b) => attachCoverUrl(ctx, b)));
}
