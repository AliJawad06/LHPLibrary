"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { daysUntil, formatDate } from "@/lib/catalog";
import { KhatamMark } from "./ornaments";

export function MyShelf() {
  const me = useQuery(api.me.get);
  const loans = useQuery(api.me.loans, me ? {} : "skip");
  const holds = useQuery(api.me.holds, me ? {} : "skip");
  const returnBook = useMutation(api.loans.returnBook);
  const cancelHold = useMutation(api.holds.cancel);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4200);
  };

  if (me === undefined || (me && (loans === undefined || holds === undefined))) {
    return <div className="skeleton-row" aria-label="Loading your shelf" />;
  }
  if (me === null) return null; // middleware redirects; this is a brief flash guard

  return (
    <>
      <div>
        <h1 className="page__title">My shelf</h1>
        <p className="page__sub">
          As-salamu alaykum, {me.name || me.email}. Your borrowed books and hold queue live here —
          due dates update the moment anything changes.
        </p>
      </div>

      <section className="section-block" aria-labelledby="loans-title">
        <h2 id="loans-title" className="section-block__title">
          Borrowed ({loans!.active.length} of 5)
        </h2>
        {loans!.active.length === 0 ? (
          <div className="empty">
            <KhatamMark size={56} />
            <h3 className="empty__title">Nothing borrowed right now.</h3>
            <p className="empty__body">
              The shelves are full and waiting. Borrow up to five books, fourteen days at a time.
            </p>
            <Link href="/" className="btn btn--primary">Browse the library</Link>
          </div>
        ) : (
          loans!.active.map((loan) => {
            const days = daysUntil(loan.dueAt);
            return (
              <div key={loan._id} className="line-item">
                <span
                  className="line-item__cover"
                  style={{ ["--tint" as string]: `var(${loan.book?.tint ?? "--tint-slate"})` }}
                  aria-hidden="true"
                />
                <div className="line-item__body">
                  <span className="line-item__title">{loan.book?.title ?? "(removed title)"}</span>
                  <span className="line-item__meta">{loan.book?.author}</span>
                  <span className={`line-item__meta${days <= 3 ? " line-item__meta--due" : ""}`}>
                    {days < 0
                      ? `Overdue since ${formatDate(loan.dueAt)}`
                      : days === 0
                        ? "Due today"
                        : `Due ${formatDate(loan.dueAt)} · ${days} day${days === 1 ? "" : "s"} left`}
                  </span>
                </div>
                <div className="line-item__actions">
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={async () => {
                      await returnBook({ loanId: loan._id });
                      showToast(`Returned “${loan.book?.title}”. JazakAllah khair!`);
                    }}
                  >
                    Return
                  </button>
                </div>
              </div>
            );
          })
        )}
      </section>

      <section className="section-block" aria-labelledby="holds-title">
        <h2 id="holds-title" className="section-block__title">Hold queue</h2>
        {holds!.length === 0 ? (
          <p className="page__sub">No holds — when a book you want is checked out, join its queue and it lands here.</p>
        ) : (
          holds!.map((hold) => (
            <div key={hold._id} className="line-item">
              <span
                className="line-item__cover"
                style={{ ["--tint" as string]: `var(${hold.book?.tint ?? "--tint-slate"})` }}
                aria-hidden="true"
              />
              <div className="line-item__body">
                <span className="line-item__title">{hold.book?.title ?? "(removed title)"}</span>
                <span className="line-item__meta">{hold.book?.author}</span>
                <span className="line-item__meta">
                  You're #{hold.position} of {hold.queueLength} in the queue · joined {formatDate(hold.createdAt)}
                </span>
              </div>
              <div className="line-item__actions">
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={async () => {
                    await cancelHold({ holdId: hold._id });
                    showToast("Hold cancelled.");
                  }}
                >
                  Leave queue
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      {loans!.past.length > 0 && (
        <section className="section-block" aria-labelledby="past-title">
          <h2 id="past-title" className="section-block__title">Reading history</h2>
          {loans!.past.map((loan) => (
            <div key={loan._id} className="line-item">
              <span
                className="line-item__cover"
                style={{ ["--tint" as string]: `var(${loan.book?.tint ?? "--tint-slate"})` }}
                aria-hidden="true"
              />
              <div className="line-item__body">
                <span className="line-item__title">{loan.book?.title ?? "(removed title)"}</span>
                <span className="line-item__meta">
                  Borrowed {formatDate(loan.borrowedAt)} · returned {loan.returnedAt ? formatDate(loan.returnedAt) : "—"}
                </span>
              </div>
            </div>
          ))}
        </section>
      )}

      {toast && <div className="toast" role="status" aria-live="polite">{toast}</div>}
    </>
  );
}
