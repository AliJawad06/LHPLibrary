"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { audienceLabel, formatDate, formatDateTime, languageLabel, topicLabel } from "@/lib/catalog";
import { BookCover } from "./BookCover";

const ERROR_COPY: Record<string, string> = {
  BookNotAvailable: "Someone reached this one first — it's just been checked out. You can join the hold queue below.",
  BorrowLimitReached: "You've reached the borrow limit (5 books). Return one to borrow another.",
  DuplicateHold: "You're already in the queue for this title.",
  Unauthenticated: "Please sign in to borrow or place holds.",
  PickupEventInvalid: "That event has passed — pick another pickup time.",
};

function errorMessage(err: unknown): string {
  if (err instanceof ConvexError && typeof err.data === "string") {
    return ERROR_COPY[err.data] ?? "Something went wrong — please try again.";
  }
  return "Something went wrong — please try again.";
}

export function BookDetailModal({
  book,
  onClose,
  onToast,
}: {
  book: Doc<"books"> | null;
  onClose: () => void;
  onToast: (msg: string) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const me = useQuery(api.me.get);
  const myLoans = useQuery(api.me.loans, me ? {} : "skip");
  const myHolds = useQuery(api.me.holds, me ? {} : "skip");
  const borrow = useMutation(api.loans.borrow);
  const returnBook = useMutation(api.loans.returnBook);
  const placeHold = useMutation(api.holds.place);
  const cancelHold = useMutation(api.holds.cancel);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickupEventId, setPickupEventId] = useState<Id<"events"> | "">("");

  // Live copy of the book so availability updates while the dialog is open.
  const liveBook = useQuery(api.books.get, book ? { bookId: book._id } : "skip");
  const current = liveBook ?? book;
  const events = useQuery(api.events.upcoming, book ? {} : "skip");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (book && !dialog.open) dialog.showModal();
    if (!book && dialog.open) dialog.close();
    setError(null);
    setPickupEventId("");
  }, [book]);

  if (!book || !current) return null;

  const myActiveLoan = myLoans?.active.find((l) => l.bookId === current._id);
  const myWaitingHold = myHolds?.find((h) => h.bookId === current._id);

  const run = async (fn: () => Promise<unknown>, successMsg: string) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
      onToast(successMsg);
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const primaryAction = () => {
    if (!me) {
      router.push("/signin");
      return null;
    }
    if (myActiveLoan) {
      return (
        <button
          type="button"
          className="btn btn--primary"
          disabled={busy}
          onClick={() =>
            run(() => returnBook({ loanId: myActiveLoan._id }), `Returned “${current.title}”. JazakAllah khair!`)
          }
        >
          Return this book
        </button>
      );
    }
    if (current.status === "available") {
      const chosen = events?.find((e) => e._id === pickupEventId);
      return (
        <button
          type="button"
          className="btn btn--primary"
          disabled={busy || !chosen}
          onClick={() =>
            chosen &&
            run(
              () => borrow({ bookId: current._id, pickupEventId: chosen._id }),
              `“${current.title}” is yours for 14 days. Pick it up at ${chosen.title}, ${formatDateTime(chosen.start)}.`,
            )
          }
        >
          Borrow — 14 days
        </button>
      );
    }
    if (myWaitingHold) {
      return (
        <button
          type="button"
          className="btn btn--ghost"
          disabled={busy}
          onClick={() =>
            run(() => cancelHold({ holdId: myWaitingHold._id }), "Hold cancelled.")
          }
        >
          Leave the queue (you're #{myWaitingHold.position})
        </button>
      );
    }
    return (
      <button
        type="button"
        className="btn btn--primary"
        disabled={busy}
        onClick={() =>
          run(() => placeHold({ bookId: current._id }), `You're in the queue for “${current.title}”.`)
        }
      >
        Join the hold queue
      </button>
    );
  };

  return (
    <dialog
      ref={dialogRef}
      className="detail"
      aria-labelledby="detail-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <div className="detail__form">
        <button type="button" className="detail__close" aria-label="Close details" onClick={onClose}>
          ×
        </button>
        <div className="detail__body">
          <div className="detail__cover-slot">
            <BookCover book={current} detail />
          </div>
          <div className="detail__meta">
            <p className="detail__topic">{topicLabel(current.topic)}</p>
            <h2 id="detail-title" className="detail__title">{current.title}</h2>
            <p className="detail__author">by {current.author}</p>
            <p className="detail__desc">{current.description}</p>
            <dl className="detail__facts">
              <div><dt>Language</dt><dd>{languageLabel(current.language)}</dd></div>
              <div><dt>Audience</dt><dd>{audienceLabel(current.audience)}</dd></div>
              {current.publisher && <div><dt>Publisher</dt><dd>{current.publisher}</dd></div>}
              {current.year && <div><dt>Year</dt><dd>{current.year}</dd></div>}
              <div>
                <dt>On the shelf</dt>
                <dd>
                  {myActiveLoan
                    ? `With you — due ${formatDate(myActiveLoan.dueAt)}`
                    : current.status === "available"
                      ? "Yes — come by the desk"
                      : "No — checked out"}
                </dd>
              </div>
            </dl>
            {me && !myActiveLoan && current.status === "available" && (
              <div className="field">
                <label className="field__label" htmlFor="pickup-event">
                  Pickup — choose an event
                </label>
                {events === undefined ? (
                  <p className="detail__pickup-note">Loading upcoming events…</p>
                ) : events.length === 0 ? (
                  <p className="detail__pickup-note">
                    No upcoming pickup events on the calendar — contact the desk to
                    arrange a time.
                  </p>
                ) : (
                  <select
                    id="pickup-event"
                    className="field__input"
                    value={pickupEventId}
                    onChange={(e) => setPickupEventId(e.target.value as Id<"events"> | "")}
                  >
                    <option value="">Select a pickup event…</option>
                    {events.map((event) => (
                      <option key={event._id} value={event._id}>
                        {event.title} — {formatDateTime(event.start)}
                        {event.location ? ` · ${event.location}` : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
            {error && <p className="auth__error" role="alert">{error}</p>}
            <div className="detail__actions">
              {me === undefined ? null : me === null ? (
                <button type="button" className="btn btn--primary" onClick={() => router.push("/signin")}>
                  Sign in to borrow
                </button>
              ) : (
                primaryAction()
              )}
              <button type="button" className="btn btn--ghost" onClick={onClose}>
                Back to the shelves
              </button>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
}
