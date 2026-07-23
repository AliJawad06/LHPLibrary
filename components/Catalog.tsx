"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { AUDIENCES, LANGUAGES, STATUSES, TOPICS } from "@/lib/catalog";
import { BookCard } from "./BookCard";
import { BookDetailModal } from "./BookDetailModal";
import { KhatamMark, ShelfDivider } from "./ornaments";

type FacetId = "topic" | "language" | "audience" | "status";

const FACETS: { id: FacetId; label: string; options: readonly { id: string; label: string }[] }[] = [
  { id: "topic", label: "Topic", options: TOPICS },
  { id: "language", label: "Language", options: LANGUAGES },
  { id: "audience", label: "Audience", options: AUDIENCES },
  { id: "status", label: "On the shelf", options: STATUSES },
];

const bookField: Record<FacetId, keyof Doc<"books">> = {
  topic: "topic",
  language: "language",
  audience: "audience",
  status: "status",
};

function norm(s: string): string {
  return s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");
}

export function Catalog() {
  const books = useQuery(api.books.list, {});
  const [selected, setSelected] = useState<Record<FacetId, Set<string>>>({
    topic: new Set(),
    language: new Set(),
    audience: new Set(),
    status: new Set(),
  });
  const [queryInput, setQueryInput] = useState("");
  const [query, setQuery] = useState("");
  const [openBook, setOpenBook] = useState<Doc<"books"> | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const t = setTimeout(() => setQuery(queryInput.trim()), 120);
    return () => clearTimeout(t);
  }, [queryInput]);

  const showToast = (msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4200);
  };

  const filtering =
    query.length > 0 || Object.values(selected).some((s) => s.size > 0);

  const filtered = useMemo(() => {
    if (!books) return [];
    return books.filter((b) => {
      for (const facet of FACETS) {
        const sel = selected[facet.id];
        if (sel.size && !sel.has(String(b[bookField[facet.id]]))) return false;
      }
      if (query) {
        const hay = norm(`${b.title} ${b.author} ${b.publisher ?? ""} ${b.description}`);
        if (!hay.includes(norm(query))) return false;
      }
      return true;
    });
  }, [books, selected, query]);

  const toggle = (facet: FacetId, id: string) => {
    setSelected((prev) => {
      const next = { ...prev, [facet]: new Set(prev[facet]) };
      if (next[facet].has(id)) next[facet].delete(id);
      else next[facet].add(id);
      return next;
    });
  };

  const clearAll = () => {
    setSelected({ topic: new Set(), language: new Set(), audience: new Set(), status: new Set() });
    setQueryInput("");
    setQuery("");
  };

  const countFor = (facet: FacetId, id: string) =>
    books?.filter((b) => String(b[bookField[facet]]) === id).length ?? 0;

  return (
    <>
      <section className="mast" aria-labelledby="mast-title">
        <div className="mast__inner">
          <p className="mast__salaam" lang="ar" aria-label="Peace be upon you">السلام عليكم</p>
          <h1 id="mast-title" className="mast__title">The Community Bookshelf.</h1>
          <p className="mast__lede">
            Books held in trust for the Triangle — <em>seerah</em>, <em>tafsir</em>, <em>fiqh</em>,
            contemporary writing, and the shelves our children will keep coming back to. Borrow one,
            return one, and take your time.
          </p>
          <div className="mast__meta">
            <span className="mast__count">{books?.length ?? "—"}</span>
            <span className="mast__sep" aria-hidden="true">·</span>
            <span>Free borrowing for members</span>
            <span className="mast__sep" aria-hidden="true">·</span>
            <span>1127 Kildaire Farm Rd, Cary</span>
          </div>
        </div>
      </section>

      <section className="filters" aria-labelledby="filters-title">
        <div className="filters__inner">
          <div className="filters__row filters__row--search">
            <h2 id="filters-title" className="visually-hidden">Filter and search</h2>
            <label className="search">
              <span className="visually-hidden">Search the library</span>
              <svg className="search__icon" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <g fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </g>
              </svg>
              <input
                type="search"
                className="search__input"
                placeholder="Search by title, author, topic…"
                autoComplete="off"
                spellCheck={false}
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
              />
              {queryInput && (
                <button
                  type="button"
                  className="search__clear"
                  aria-label="Clear search"
                  onClick={() => { setQueryInput(""); setQuery(""); }}
                >
                  ×
                </button>
              )}
            </label>
          </div>

          <div className="filters__row filters__row--chips">
            {FACETS.map((facet) => (
              <fieldset key={facet.id} className="chipset">
                <legend className="chipset__label">{facet.label}</legend>
                <div className="chipset__scroll" role="group" aria-label={`${facet.label} filters`}>
                  {facet.options.map((opt) => {
                    const count = countFor(facet.id, opt.id);
                    const zero = count === 0 && facet.id !== "status";
                    const active = selected[facet.id].has(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        className="chip"
                        aria-pressed={active}
                        disabled={zero}
                        title={zero ? `No ${opt.label.toLowerCase()} titles in the collection yet` : undefined}
                        onClick={() => toggle(facet.id, opt.id)}
                      >
                        {opt.label}
                        <span className="chip__count">· {count}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}
            {filtering && (
              <button type="button" className="filters__reset" onClick={clearAll}>
                Clear filters
              </button>
            )}
          </div>
        </div>
      </section>

      {books === undefined ? (
        <section className="shelves" aria-label="Loading the shelves">
          <div className="shelves__inner">
            <div className="skeleton-row" />
          </div>
        </section>
      ) : filtering ? (
        <section className="results" aria-labelledby="results-title">
          <div className="results__inner">
            <header className="results__header">
              <h2 id="results-title" className="results__title">Results</h2>
              <p className="results__meta" aria-live="polite">
                {filtered.length
                  ? `${filtered.length} title${filtered.length === 1 ? "" : "s"}${query ? ` matching “${query}”` : ""}`
                  : "No matches — try loosening a filter."}
              </p>
            </header>
            <div className="results__grid">
              {filtered.length ? (
                filtered.map((b, i) => (
                  <BookCard key={b._id} book={b} index={i} onOpen={setOpenBook} />
                ))
              ) : (
                <div className="empty" role="status">
                  <KhatamMark />
                  <h3 className="empty__title">Nothing on this shelf yet.</h3>
                  <p className="empty__body">
                    No books match every filter you've set. Try loosening one, or clear all filters
                    to see the whole collection.
                  </p>
                  <button type="button" className="btn btn--primary" onClick={clearAll}>
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      ) : (
        <section className="shelves" aria-labelledby="shelves-title">
          <h2 id="shelves-title" className="visually-hidden">Curated shelves</h2>
          <div className="shelves__inner">
            <article className="shelf" aria-labelledby="shelf-new">
              <header className="shelf__header">
                <h3 id="shelf-new" className="shelf__title">New Arrivals</h3>
                <p className="shelf__note">Latest additions to the collection.</p>
              </header>
              <div className="shelf__row">
                {books.filter((b) => b.isNew).map((b, i) => (
                  <BookCard key={b._id} book={b} index={i} onOpen={setOpenBook} />
                ))}
              </div>
            </article>

            <ShelfDivider />

            <article className="shelf" aria-labelledby="shelf-staff">
              <header className="shelf__header">
                <h3 id="shelf-staff" className="shelf__title">Staff Picks</h3>
                <p className="shelf__note">Chosen by the volunteers who tend the shelves.</p>
              </header>
              <div className="shelf__row">
                {books.filter((b) => b.staffPick).map((b, i) => (
                  <BookCard key={b._id} book={b} index={i} onOpen={setOpenBook} />
                ))}
              </div>
            </article>

            <ShelfDivider />

            <article className="shelf shelf--topics" aria-labelledby="shelf-topics">
              <header className="shelf__header">
                <h3 id="shelf-topics" className="shelf__title">By Topic</h3>
                <p className="shelf__note">The whole collection, organized by subject.</p>
              </header>
              <div className="topic-groups">
                {TOPICS.map((topic) => {
                  const inTopic = books.filter((b) => b.topic === topic.id);
                  if (!inTopic.length) return null;
                  return (
                    <section key={topic.id} className="topic-group">
                      <header className="topic-group__header">
                        <h4 className="topic-group__title">{topic.label}</h4>
                        <span className="topic-group__count">
                          {inTopic.length} title{inTopic.length === 1 ? "" : "s"}
                        </span>
                        <span className="topic-group__title-ar" lang="ar">{topic.ar}</span>
                      </header>
                      <div className="topic-group__grid">
                        {inTopic.map((b, i) => (
                          <BookCard key={b._id} book={b} index={i} onOpen={setOpenBook} />
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            </article>
          </div>
        </section>
      )}

      <BookDetailModal book={openBook} onClose={() => setOpenBook(null)} onToast={showToast} />

      {toast && (
        <div className="toast" role="status" aria-live="polite">{toast}</div>
      )}
    </>
  );
}
