import type { Doc } from "@/convex/_generated/dataModel";

function titleSizeClass(title: string): string {
  if (title.length < 18) return "book__cover-title--short";
  if (title.length > 42) return "book__cover-title--long";
  return "";
}

/**
 * Typography-forward tinted placeholder panel. Real cover photography (shot
 * borderless, with its own background) drops into this slot later without
 * changing the cell chrome.
 */
export function BookCover({
  book,
  detail = false,
}: {
  book: Pick<Doc<"books">, "title" | "author" | "tint">;
  detail?: boolean;
}) {
  return (
    <div
      className={detail ? "book__cover detail__cover-panel" : "book__cover"}
      style={{ ["--tint" as string]: `var(${book.tint ?? "--tint-slate"})` }}
    >
      <span className={`book__cover-title ${titleSizeClass(book.title)}`}>
        {book.title}
      </span>
      <span className="book__cover-author">{book.author}</span>
    </div>
  );
}
