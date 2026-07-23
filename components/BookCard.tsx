"use client";

import type { Doc } from "@/convex/_generated/dataModel";
import { BookCover } from "./BookCover";

export function BookCard({
  book,
  index = 0,
  onOpen,
}: {
  book: Doc<"books">;
  index?: number;
  onOpen: (book: Doc<"books">) => void;
}) {
  const available = book.status === "available";
  return (
    <button
      type="button"
      className="book"
      style={{ ["--i" as string]: index }}
      aria-label={`${book.title} by ${book.author}. ${available ? "On the shelf." : "Checked out."} Open details.`}
      onClick={() => onOpen(book)}
    >
      <BookCover book={book} />
      <span className="book__meta">
        <span className="book__title">{book.title}</span>
        <span className="book__author">{book.author}</span>
        <span className={`book__status${available ? "" : " book__status--out"}`}>
          {available ? "On the shelf" : "Checked out"}
        </span>
      </span>
    </button>
  );
}
