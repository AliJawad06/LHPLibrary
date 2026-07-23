import type { Doc } from "@/convex/_generated/dataModel";

function titleSizeClass(title: string): string {
  if (title.length < 18) return "book__cover-title--short";
  if (title.length > 42) return "book__cover-title--long";
  return "";
}

export function BookCover({
  book,
  detail = false,
}: {
  book: Pick<Doc<"books">, "title" | "author" | "tint"> & { coverUrl?: string | null };
  detail?: boolean;
}) {
  const cls = detail ? "book__cover detail__cover-panel" : "book__cover";

  if (book.coverUrl) {
    return (
      <div className={cls}>
        <img
          src={book.coverUrl}
          alt={`Cover of ${book.title}`}
          className="book__cover-img"
        />
      </div>
    );
  }

  return (
    <div
      className={cls}
      style={{ ["--tint" as string]: `var(${book.tint ?? "--tint-slate"})` }}
    >
      <span className={`book__cover-title ${titleSizeClass(book.title)}`}>
        {book.title}
      </span>
      <span className="book__cover-author">{book.author}</span>
    </div>
  );
}
