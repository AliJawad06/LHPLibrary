"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { AUDIENCES, LANGUAGES, TOPICS, formatDate, topicLabel } from "@/lib/catalog";
import { KhatamMark } from "./ornaments";

type Tab = "catalog" | "loans" | "holds" | "members";

const TINTS = [
  "--tint-slate", "--tint-teal", "--tint-oxblood", "--tint-forest",
  "--tint-aubergine", "--tint-mustard", "--tint-terracotta", "--tint-ink",
];

const EMPTY_FORM = {
  title: "", author: "", publisher: "", year: "",
  topic: TOPICS[0].id as string,
  language: LANGUAGES[0].id as string,
  audience: "adult" as "adult" | "teen" | "child",
  tint: TINTS[0],
  staffPick: false, isNew: true, description: "",
};

function errText(err: unknown): string {
  if (err instanceof ConvexError && typeof err.data === "string") {
    if (err.data === "BookHasActiveLoan") return "This book is on loan — it must be returned before deletion.";
    if (err.data === "Forbidden") return "Your account doesn't have librarian access.";
    if (err.data === "CannotDemoteSelf") return "You can't remove your own admin role.";
    return err.data;
  }
  return "Something went wrong.";
}

export function AdminPanel() {
  const me = useQuery(api.me.get);
  const [tab, setTab] = useState<Tab>("catalog");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4200);
  };

  if (me === undefined) return <div className="skeleton-row" aria-label="Loading" />;
  if (!me || me.role !== "admin") {
    return (
      <div className="empty">
        <KhatamMark size={56} />
        <h3 className="empty__title">Librarian access required.</h3>
        <p className="empty__body">
          This desk is for library volunteers. If you've been asked to help manage the catalog,
          an existing librarian can grant you access from their Members tab.
        </p>
      </div>
    );
  }

  return (
    <>
      <div>
        <h1 className="page__title">Librarian desk</h1>
        <p className="page__sub">
          Manage the catalog, circulation, and members. Every action here is re-checked on the
          server — the desk is a convenience, not the lock.
        </p>
      </div>

      <div className="chipset__scroll" role="tablist" aria-label="Admin sections">
        {(["catalog", "loans", "holds", "members"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            className="chip"
            aria-pressed={tab === t}
            aria-selected={tab === t}
            onClick={() => setTab(t)}
          >
            {t === "catalog" ? "Catalog" : t === "loans" ? "Loans" : t === "holds" ? "Holds" : "Members"}
          </button>
        ))}
      </div>

      {tab === "catalog" && <CatalogTab showToast={showToast} />}
      {tab === "loans" && <LoansTab showToast={showToast} />}
      {tab === "holds" && <HoldsTab showToast={showToast} />}
      {tab === "members" && <MembersTab showToast={showToast} myUserId={me.userId} />}

      {toast && <div className="toast" role="status" aria-live="polite">{toast}</div>}
    </>
  );
}

// ---- Catalog --------------------------------------------------------------

function CatalogTab({ showToast }: { showToast: (m: string) => void }) {
  const books = useQuery(api.books.list, {});
  const createBook = useMutation(api.admin.createBook);
  const updateBook = useMutation(api.admin.updateBook);
  const removeBook = useMutation(api.admin.removeBook);

  const [editing, setEditing] = useState<Id<"books"> | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [error, setError] = useState<string | null>(null);

  const startEdit = (book: Doc<"books">) => {
    setEditing(book._id);
    setForm({
      title: book.title, author: book.author,
      publisher: book.publisher ?? "", year: book.year ? String(book.year) : "",
      topic: book.topic, language: book.language, audience: book.audience,
      tint: book.tint ?? TINTS[0],
      staffPick: book.staffPick, isNew: book.isNew, description: book.description,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const reset = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setError(null);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const fields = {
      title: form.title.trim(),
      author: form.author.trim(),
      publisher: form.publisher.trim() || undefined,
      year: form.year ? Number(form.year) : undefined,
      topic: form.topic,
      language: form.language,
      audience: form.audience,
      tint: form.tint,
      staffPick: form.staffPick,
      isNew: form.isNew,
      description: form.description.trim(),
    };
    try {
      if (editing) {
        await updateBook({ bookId: editing, patch: fields });
        showToast(`Updated “${fields.title}”.`);
      } else {
        await createBook(fields);
        showToast(`Added “${fields.title}” to the catalog.`);
      }
      reset();
    } catch (err) {
      setError(errText(err));
    }
  };

  return (
    <>
      <section className="section-block" aria-labelledby="book-form-title">
        <h2 id="book-form-title" className="section-block__title">
          {editing ? "Edit book" : "Add a book"}
        </h2>
        <form className="auth__form" onSubmit={submit}>
          <div className="form-grid">
            <div className="field field--wide">
              <label className="field__label" htmlFor="bf-title">Title</label>
              <input id="bf-title" className="field__input" required value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="bf-author">Author</label>
              <input id="bf-author" className="field__input" required value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })} />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="bf-publisher">Publisher</label>
              <input id="bf-publisher" className="field__input" value={form.publisher}
                onChange={(e) => setForm({ ...form, publisher: e.target.value })} />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="bf-year">Year</label>
              <input id="bf-year" className="field__input" type="number" min={600} max={2100} value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })} />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="bf-topic">Topic</label>
              <select id="bf-topic" className="field__input" value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}>
                {TOPICS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="field__label" htmlFor="bf-language">Language</label>
              <select id="bf-language" className="field__input" value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}>
                {LANGUAGES.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="field__label" htmlFor="bf-audience">Audience</label>
              <select id="bf-audience" className="field__input" value={form.audience}
                onChange={(e) => setForm({ ...form, audience: e.target.value as typeof form.audience })}>
                {AUDIENCES.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="field__label" htmlFor="bf-tint">Cover tint</label>
              <select id="bf-tint" className="field__input" value={form.tint}
                onChange={(e) => setForm({ ...form, tint: e.target.value })}>
                {TINTS.map((t) => <option key={t} value={t}>{t.replace("--tint-", "")}</option>)}
              </select>
            </div>
            <div className="field field--wide">
              <label className="field__label" htmlFor="bf-desc">Description</label>
              <textarea id="bf-desc" className="field__input" required value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          <label className="checkbox-row">
            <input type="checkbox" checked={form.staffPick}
              onChange={(e) => setForm({ ...form, staffPick: e.target.checked })} />
            Staff pick
          </label>
          <label className="checkbox-row">
            <input type="checkbox" checked={form.isNew}
              onChange={(e) => setForm({ ...form, isNew: e.target.checked })} />
            Show in New Arrivals
          </label>
          {error && <p className="auth__error" role="alert">{error}</p>}
          <div className="form-actions">
            <button type="submit" className="btn btn--primary">
              {editing ? "Save changes" : "Add to catalog"}
            </button>
            {editing && (
              <button type="button" className="btn btn--ghost" onClick={reset}>
                Cancel edit
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="section-block" aria-labelledby="catalog-table-title">
        <h2 id="catalog-table-title" className="section-block__title">
          Catalog ({books?.length ?? "…"})
        </h2>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th><th>Author</th><th>Topic</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books?.map((book) => (
                <tr key={book._id}>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td>{topicLabel(book.topic)}</td>
                  <td>
                    <span className={`badge${book.status === "loaned" ? " badge--active" : ""}`}>
                      {book.status === "available" ? "Available" : "On loan"}
                    </span>
                  </td>
                  <td>
                    <div className="table__actions">
                      <button type="button" className="btn btn--ghost btn--sm" onClick={() => startEdit(book)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn--danger btn--sm"
                        onClick={async () => {
                          if (!confirm(`Delete “${book.title}” from the catalog?`)) return;
                          try {
                            await removeBook({ bookId: book._id });
                            showToast(`Deleted “${book.title}”.`);
                          } catch (err) {
                            alert(errText(err));
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

// ---- Loans ----------------------------------------------------------------

function LoansTab({ showToast }: { showToast: (m: string) => void }) {
  const [status, setStatus] = useState<"active" | "returned" | "all">("active");
  const loans = useQuery(api.admin.listLoans, status === "all" ? {} : { status });
  const forceReturn = useMutation(api.admin.forceReturn);

  return (
    <section className="section-block" aria-labelledby="loans-table-title">
      <h2 id="loans-table-title" className="section-block__title">Loans</h2>
      <div className="chipset__scroll">
        {(["active", "returned", "all"] as const).map((s) => (
          <button key={s} type="button" className="chip" aria-pressed={status === s} onClick={() => setStatus(s)}>
            {s === "active" ? "Active" : s === "returned" ? "Returned" : "All"}
          </button>
        ))}
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>Book</th><th>Borrower</th><th>Borrowed</th><th>Due</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {loans?.length === 0 && (
              <tr><td colSpan={6}>No loans in this view.</td></tr>
            )}
            {loans?.map((loan) => (
              <tr key={loan._id}>
                <td>{loan.book?.title ?? "(removed)"}</td>
                <td>{loan.borrower?.name ?? loan.borrower?.email ?? loan.userId}</td>
                <td>{formatDate(loan.borrowedAt)}</td>
                <td>{formatDate(loan.dueAt)}{loan.status === "active" && loan.dueAt < Date.now() ? " · overdue" : ""}</td>
                <td>
                  <span className={`badge${loan.status === "active" ? " badge--active" : ""}`}>
                    {loan.status}
                  </span>
                </td>
                <td>
                  {loan.status === "active" && (
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      onClick={async () => {
                        await forceReturn({ loanId: loan._id });
                        showToast(`Force-returned “${loan.book?.title}”.`);
                      }}
                    >
                      Force return
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ---- Holds ----------------------------------------------------------------

function HoldsTab({ showToast }: { showToast: (m: string) => void }) {
  const holds = useQuery(api.admin.listHolds, {});
  const removeHold = useMutation(api.admin.removeHold);

  return (
    <section className="section-block" aria-labelledby="holds-table-title">
      <h2 id="holds-table-title" className="section-block__title">Holds</h2>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>Book</th><th>Member</th><th>Placed</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {holds?.length === 0 && (
              <tr><td colSpan={5}>No holds on record.</td></tr>
            )}
            {holds?.map((hold) => (
              <tr key={hold._id}>
                <td>{hold.book?.title ?? "(removed)"}</td>
                <td>{hold.holder?.name ?? hold.holder?.email ?? hold.userId}</td>
                <td>{formatDate(hold.createdAt)}</td>
                <td>
                  <span className={`badge${hold.status === "waiting" ? " badge--active" : ""}`}>
                    {hold.status}
                  </span>
                </td>
                <td>
                  {hold.status === "waiting" && (
                    <button
                      type="button"
                      className="btn btn--danger btn--sm"
                      onClick={async () => {
                        await removeHold({ holdId: hold._id });
                        showToast("Hold removed.");
                      }}
                    >
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ---- Members --------------------------------------------------------------

function MembersTab({ showToast, myUserId }: { showToast: (m: string) => void; myUserId: string }) {
  const users = useQuery(api.admin.listUsers, {});
  const setRole = useMutation(api.admin.setRole);

  return (
    <section className="section-block" aria-labelledby="members-table-title">
      <h2 id="members-table-title" className="section-block__title">Members</h2>
      <p className="page__sub">
        Members appear here after their first borrow or hold. To promote someone who hasn't
        borrowed yet, ask them to sign in once, then use the bootstrap command in SETUP.md.
      </p>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users?.length === 0 && (
              <tr><td colSpan={4}>No member profiles yet.</td></tr>
            )}
            {users?.map((profile) => (
              <tr key={profile._id}>
                <td>{profile.user?.name ?? "—"}</td>
                <td>{profile.user?.email ?? profile.userId}</td>
                <td>
                  <span className={`badge${profile.role === "admin" ? " badge--admin" : ""}`}>
                    {profile.role}
                  </span>
                </td>
                <td>
                  {profile.userId !== myUserId && (
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      onClick={async () => {
                        const next = profile.role === "admin" ? "member" : "admin";
                        try {
                          await setRole({ userId: profile.userId, role: next });
                          showToast(next === "admin" ? "Granted librarian access." : "Removed librarian access.");
                        } catch (err) {
                          alert(errText(err));
                        }
                      }}
                    >
                      {profile.role === "admin" ? "Make member" : "Make librarian"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
