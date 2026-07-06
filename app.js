// =============================================================
// LHP Library — data + render + filter/search/modal
// Vanilla ES modules, no dependencies.
// =============================================================

// -------------------------------------------------------------
// Book data. Real titles the org's community would recognize.
// staff & new flags flow into curated shelves.
// tint keys reference CSS custom properties for placeholder cover.
// -------------------------------------------------------------

const TOPICS = [
  { id: "seerah",     label: "Seerah",          ar: "السيرة" },
  { id: "quran",      label: "Qur'an & Tafsir", ar: "القرآن والتفسير" },
  { id: "fiqh",       label: "Fiqh & Spiritual",ar: "الفقه والتزكية" },
  { id: "history",    label: "History",         ar: "التاريخ" },
  { id: "youth",      label: "Youth & Kids",    ar: "الأطفال والشباب" },
  { id: "contemp",    label: "Contemporary",    ar: "المعاصر" },
];

const LANGUAGES = [
  { id: "en", label: "English" },
  { id: "ar", label: "Arabic" },
  { id: "bilingual", label: "Bilingual" },
];

const AUDIENCES = [
  { id: "adult", label: "Adult" },
  { id: "youth", label: "Youth" },
  { id: "child", label: "Kids" },
];

const AVAILABILITY = [
  { id: "available", label: "Available" },
  { id: "out",       label: "Checked out" },
];

const BOOKS = [
  // --- Seerah ---
  { id: "b01", title: "Muhammad: His Life Based on the Earliest Sources", author: "Martin Lings",
    publisher: "Islamic Texts Society", year: 1983, topic: "seerah", language: "en", audience: "adult",
    availability: "available", tint: "--tint-slate", staff: true, new: false,
    desc: "A cornerstone contemporary Seerah drawn directly from the earliest Arabic sources. Read slowly; it rewards patience." },
  { id: "b02", title: "The Sealed Nectar", author: "Safi-ur-Rahman al-Mubarakpuri",
    publisher: "Darussalam", year: 1996, topic: "seerah", language: "en", audience: "adult",
    availability: "available", tint: "--tint-forest", staff: false, new: false,
    desc: "The award-winning modern Seerah, thorough and accessible. A default starting point in many masjid libraries." },
  { id: "b03", title: "In the Footsteps of the Prophet", author: "Tariq Ramadan",
    publisher: "Oxford University Press", year: 2007, topic: "seerah", language: "en", audience: "adult",
    availability: "out", tint: "--tint-aubergine", staff: true, new: false,
    desc: "Lessons drawn from the Prophet's life for present-day readers, with a reflective tone rather than pure biography." },
  { id: "b04", title: "When the Moon Split", author: "Safi-ur-Rahman al-Mubarakpuri",
    publisher: "Darussalam", year: 1998, topic: "seerah", language: "en", audience: "youth",
    availability: "available", tint: "--tint-teal", staff: false, new: false,
    desc: "A briefer, more narrative Seerah suited to teens and adults new to the tradition." },

  // --- Qur'an & Tafsir ---
  { id: "b05", title: "The Study Quran", author: "Seyyed Hossein Nasr (ed.)",
    publisher: "HarperOne", year: 2015, topic: "quran", language: "bilingual", audience: "adult",
    availability: "available", tint: "--tint-ink", staff: true, new: true,
    desc: "A comprehensive scholarly translation with running commentary drawn from classical tafsir traditions." },
  { id: "b06", title: "The Message of the Qur'an", author: "Muhammad Asad",
    publisher: "Book Foundation", year: 1980, topic: "quran", language: "bilingual", audience: "adult",
    availability: "available", tint: "--tint-oxblood", staff: false, new: false,
    desc: "A widely-read English rendering with extensive footnotes reflecting Asad's rationalist approach." },
  { id: "b07", title: "Tafsir Ibn Kathir (Abridged, 10 vols.)", author: "Safi-ur-Rahman al-Mubarakpuri (ed.)",
    publisher: "Darussalam", year: 2003, topic: "quran", language: "en", audience: "adult",
    availability: "available", tint: "--tint-mustard", staff: true, new: false,
    desc: "The classical tafsir in abridged English translation. Reference volume the borrowing desk will help you locate." },
  { id: "b08", title: "Reflecting on the Names of Allah", author: "Jinan Yousef",
    publisher: "Kube Publishing", year: 2020, topic: "quran", language: "en", audience: "adult",
    availability: "available", tint: "--tint-teal", staff: false, new: true,
    desc: "A contemplative walk through the Divine Names, structured for daily reading." },

  // --- Fiqh & Spiritual ---
  { id: "b09", title: "Reliance of the Traveller", author: "Ahmad ibn Naqib al-Misri (tr. N. H. M. Keller)",
    publisher: "Amana", year: 1994, topic: "fiqh", language: "bilingual", audience: "adult",
    availability: "out", tint: "--tint-slate", staff: true, new: false,
    desc: "The classical Shafi'i manual with parallel Arabic and annotated English. Reference — reads with a companion." },
  { id: "b10", title: "Purification of the Heart", author: "Hamza Yusuf",
    publisher: "Sandala", year: 2004, topic: "fiqh", language: "en", audience: "adult",
    availability: "available", tint: "--tint-forest", staff: true, new: false,
    desc: "Translation and commentary on Imam al-Mawlud's poem on tazkiyah — spiritual diseases of the heart and their cures." },
  { id: "b11", title: "Being Muslim", author: "Asad Tarsin",
    publisher: "Sandala", year: 2015, topic: "fiqh", language: "en", audience: "adult",
    availability: "available", tint: "--tint-aubergine", staff: false, new: false,
    desc: "A practical primer on Islamic beliefs, practice, and spirituality for readers new to the tradition." },
  { id: "b12", title: "The Content of Character", author: "Shaykh al-Amin Ali Mazrui",
    publisher: "Sandala", year: 2005, topic: "fiqh", language: "bilingual", audience: "adult",
    availability: "available", tint: "--tint-oxblood", staff: false, new: false,
    desc: "A collection of prophetic sayings on ethics with parallel Arabic and English translations." },
  { id: "b13", title: "Reclaim Your Heart", author: "Yasmin Mogahed",
    publisher: "FB Publishing", year: 2012, topic: "fiqh", language: "en", audience: "adult",
    availability: "available", tint: "--tint-terracotta", staff: false, new: false,
    desc: "Essays on faith, love, loss, and returning attention to the eternal — widely read among younger adults." },

  // --- History ---
  { id: "b14", title: "Lost Islamic History", author: "Firas Alkhateeb",
    publisher: "Hurst", year: 2014, topic: "history", language: "en", audience: "adult",
    availability: "available", tint: "--tint-mustard", staff: true, new: false,
    desc: "A single-volume narrative history of Muslim civilizations from the Prophet ﷺ to the twentieth century." },
  { id: "b15", title: "Destiny Disrupted", author: "Tamim Ansary",
    publisher: "PublicAffairs", year: 2009, topic: "history", language: "en", audience: "adult",
    availability: "available", tint: "--tint-terracotta", staff: false, new: false,
    desc: "World history as it looks from the middle of the Muslim world outward — a valuable corrective to Eurocentric surveys." },
  { id: "b16", title: "The Great Theft: Wrestling Islam from the Extremists", author: "Khaled Abou El Fadl",
    publisher: "HarperOne", year: 2005, topic: "history", language: "en", audience: "adult",
    availability: "out", tint: "--tint-ink", staff: false, new: false,
    desc: "A scholar of Islamic law argues for reclaiming the mainstream tradition from puritanical readings." },

  // --- Youth & Kids ---
  { id: "b17", title: "Amina's Voice", author: "Hena Khan",
    publisher: "Salaam Reads", year: 2017, topic: "youth", language: "en", audience: "child",
    availability: "available", tint: "--tint-teal", staff: true, new: false,
    desc: "A Pakistani-American middle-schooler finds her voice — and her community — after a devastating loss." },
  { id: "b18", title: "The Proudest Blue", author: "Ibtihaj Muhammad & S. K. Ali",
    publisher: "Little, Brown", year: 2019, topic: "youth", language: "en", audience: "child",
    availability: "available", tint: "--tint-slate", staff: true, new: false,
    desc: "A picture book about a young girl's first day of school with her older sister in a beautiful blue hijab." },
  { id: "b19", title: "Once Upon an Eid", author: "S. K. Ali & Aisha Saeed (eds.)",
    publisher: "Amulet", year: 2020, topic: "youth", language: "en", audience: "youth",
    availability: "available", tint: "--tint-forest", staff: false, new: true,
    desc: "An anthology of Eid stories by fifteen Muslim writers — funny, tender, everyday and celebratory." },
  { id: "b20", title: "Yasmin the Explorer", author: "Saadia Faruqi",
    publisher: "Picture Window Books", year: 2018, topic: "youth", language: "en", audience: "child",
    availability: "available", tint: "--tint-mustard", staff: false, new: false,
    desc: "An early-reader series about a curious Pakistani-American girl. The whole set is on the kids' shelf." },
  { id: "b21", title: "The Gift of Ramadan", author: "Rabiah York Lumbard",
    publisher: "Albert Whitman", year: 2019, topic: "youth", language: "en", audience: "child",
    availability: "out", tint: "--tint-aubergine", staff: false, new: false,
    desc: "A tender picture book about a young girl attempting her first fast." },

  // --- Contemporary Muslim American writing ---
  { id: "b22", title: "The Butterfly Mosque", author: "G. Willow Wilson",
    publisher: "Grove Atlantic", year: 2010, topic: "contemp", language: "en", audience: "adult",
    availability: "available", tint: "--tint-terracotta", staff: true, new: false,
    desc: "A memoir of conversion and cross-cultural marriage, told with warmth and precision." },
  { id: "b23", title: "The Bad Muslim Discount", author: "Syed M. Masood",
    publisher: "Doubleday", year: 2021, topic: "contemp", language: "en", audience: "adult",
    availability: "available", tint: "--tint-oxblood", staff: false, new: true,
    desc: "A generous, funny novel about two Muslim families in America, and about faith held with a light hand." },
  { id: "b24", title: "The Beauty of Your Face", author: "Sahar Mustafah",
    publisher: "W. W. Norton", year: 2020, topic: "contemp", language: "en", audience: "adult",
    availability: "available", tint: "--tint-ink", staff: false, new: false,
    desc: "A Palestinian-American principal's story, told across two timelines — recent and everyday, taut and searching." },
  { id: "b25", title: "Salt Houses", author: "Hala Alyan",
    publisher: "Mariner", year: 2017, topic: "contemp", language: "en", audience: "adult",
    availability: "available", tint: "--tint-forest", staff: true, new: false,
    desc: "A multi-generational novel following one Palestinian family through displacement, in luminous, unhurried prose." },
  { id: "b26", title: "The Faith of Others", author: "Homayra Ziad",
    publisher: "Interfaith Press", year: 2023, topic: "contemp", language: "en", audience: "adult",
    availability: "available", tint: "--tint-teal", staff: false, new: true,
    desc: "Essays on Muslim interfaith engagement in the American century, from a scholar-practitioner working in the Triangle." },
  { id: "b27", title: "The Kildaire Road", author: "Rasheed A. Amini",
    publisher: "Triangle Editions", year: 2024, topic: "contemp", language: "en", audience: "adult",
    availability: "available", tint: "--tint-mustard", staff: true, new: true,
    desc: "Essays from the first decade of a Cary masjid — potlucks, funerals, Friday khutbahs, and the slow work of building a community. Written by a longtime volunteer at The Light House Project." },
];

// -------------------------------------------------------------
// State
// -------------------------------------------------------------
const state = {
  topics: new Set(),
  languages: new Set(),
  audiences: new Set(),
  availability: new Set(),
  query: "",
};

// -------------------------------------------------------------
// Utilities
// -------------------------------------------------------------
const el = (tag, props = {}, ...children) => {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === "class") node.className = v;
    else if (k === "dataset") Object.assign(node.dataset, v);
    else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2).toLowerCase(), v);
    else if (v === true) node.setAttribute(k, "");
    else if (v === false || v == null) { /* skip */ }
    else node.setAttribute(k, v);
  }
  for (const child of children) {
    if (child == null || child === false) continue;
    node.append(child.nodeType ? child : document.createTextNode(String(child)));
  }
  return node;
};

const norm = (s) => (s || "").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");

const facetMeta = { topic: TOPICS, language: LANGUAGES, audience: AUDIENCES, availability: AVAILABILITY };
const facetToStateKey = { topic: "topics", language: "languages", audience: "audiences", availability: "availability" };

// -------------------------------------------------------------
// Render helpers
// -------------------------------------------------------------
function titleSizeClass(title) {
  const len = title.length;
  if (len < 18) return "book__cover-title--short";
  if (len > 42) return "book__cover-title--long";
  return "";
}

function renderBookCoverPanel(book, opts = {}) {
  const size = opts.detail ? "detail" : "card";
  const wrap = el("div", { class: `book__cover ${size === "detail" ? "book__detail-cover" : ""}`,
                            style: `--tint: var(${book.tint});` });
  const title = el("span", { class: `book__cover-title ${titleSizeClass(book.title)}` }, book.title);
  const author = el("span", { class: "book__cover-author" }, book.author);
  wrap.append(title, author);
  return wrap;
}

function renderBookCard(book, index = 0) {
  const cover = renderBookCoverPanel(book);
  const meta = el("div", { class: "book__meta" });
  meta.append(
    el("span", { class: "book__title" }, book.title),
    el("span", { class: "book__author" }, book.author),
    el("span", { class: `book__status book__status--${book.availability}` },
      book.availability === "available" ? "On the shelf" : "Checked out")
  );

  const card = el("button", {
    type: "button",
    class: "book",
    style: `--i: ${index}`,
    "data-book-id": book.id,
    "aria-label": `${book.title} by ${book.author}. ${book.availability === "available" ? "On the shelf." : "Checked out."} Open details.`,
  }, cover, meta);

  card.addEventListener("click", () => openDetail(book));
  return card;
}

// -------------------------------------------------------------
// Filter / search logic
// -------------------------------------------------------------
function matches(book) {
  if (state.topics.size && !state.topics.has(book.topic)) return false;
  if (state.languages.size && !state.languages.has(book.language)) return false;
  if (state.audiences.size && !state.audiences.has(book.audience)) return false;
  if (state.availability.size && !state.availability.has(book.availability)) return false;
  if (state.query) {
    const q = norm(state.query);
    const hay = norm(`${book.title} ${book.author} ${book.publisher} ${book.desc}`);
    if (!hay.includes(q)) return false;
  }
  return true;
}

function isFiltering() {
  return state.query.length > 0 ||
    state.topics.size > 0 ||
    state.languages.size > 0 ||
    state.audiences.size > 0 ||
    state.availability.size > 0;
}

// -------------------------------------------------------------
// Chip rendering
// -------------------------------------------------------------
function renderChipsets() {
  for (const facet of Object.keys(facetMeta)) {
    const container = document.querySelector(`.chipset[data-facet="${facet}"] .chipset__scroll`);
    container.replaceChildren();
    for (const opt of facetMeta[facet]) {
      const stateKey = facetToStateKey[facet];
      const isActive = state[stateKey].has(opt.id);
      const count = BOOKS.filter(b => b[facetMapField(facet)] === opt.id).length;
      const zero = count === 0;
      const chip = el("button", {
        type: "button",
        class: "chip",
        "aria-pressed": isActive ? "true" : "false",
        "data-facet": facet,
        "data-value": opt.id,
        disabled: zero,
        "aria-disabled": zero ? "true" : null,
        title: zero ? `No ${opt.label.toLowerCase()} titles in the collection yet` : null,
      }, opt.label, el("span", { class: "chip__count" }, `· ${count}`));
      if (!zero) chip.addEventListener("click", () => toggleChip(facet, opt.id));
      container.append(chip);
    }
  }
}

function facetMapField(facet) {
  return { topic: "topic", language: "language", audience: "audience", availability: "availability" }[facet];
}

function toggleChip(facet, id) {
  const key = facetToStateKey[facet];
  const set = state[key];
  if (set.has(id)) set.delete(id); else set.add(id);
  render();
}

// -------------------------------------------------------------
// Views
// -------------------------------------------------------------
const shelvesRoot = document.getElementById("shelves");
const resultsRoot = document.getElementById("results");
const resultsGrid = document.querySelector("[data-results-grid]");
const resultsMeta = document.querySelector("[data-results-meta]");

function renderCuratedShelves() {
  // New Arrivals
  const newRow = document.querySelector('[data-shelf="new"] [data-shelf-row]');
  newRow.replaceChildren();
  BOOKS.filter(b => b.new).forEach((b, i) => {
    newRow.append(renderBookCard(b, i));
  });

  // Staff Picks
  const staffRow = document.querySelector('[data-shelf="staff"] [data-shelf-row]');
  staffRow.replaceChildren();
  BOOKS.filter(b => b.staff).forEach((b, i) => {
    staffRow.append(renderBookCard(b, i));
  });

  // By Topic grouped
  const topicRoot = document.querySelector("[data-topic-groups]");
  topicRoot.replaceChildren();
  for (const topic of TOPICS) {
    const inTopic = BOOKS.filter(b => b.topic === topic.id);
    if (!inTopic.length) continue;
    const group = el("section", { class: "topic-group" });
    const header = el("header", { class: "topic-group__header" },
      el("h4", { class: "topic-group__title" }, topic.label),
      el("span", { class: "topic-group__count" }, `${inTopic.length} title${inTopic.length === 1 ? "" : "s"}`),
      el("span", { class: "topic-group__title-ar", lang: "ar" }, topic.ar),
    );
    const grid = el("div", { class: "topic-group__grid" });
    inTopic.forEach((b, i) => grid.append(renderBookCard(b, i)));
    group.append(header, grid);
    topicRoot.append(group);
  }
}

function renderResults() {
  const filtered = BOOKS.filter(matches);
  resultsGrid.replaceChildren();

  if (!filtered.length) {
    const tpl = document.getElementById("empty-template").content.cloneNode(true);
    const btn = tpl.querySelector("[data-empty-reset]");
    btn.addEventListener("click", clearAll);
    resultsGrid.append(tpl);
    resultsMeta.textContent = "No matches — try loosening a filter.";
    return;
  }

  filtered.forEach((b, i) => resultsGrid.append(renderBookCard(b, i)));

  const parts = [];
  const n = filtered.length;
  parts.push(`${n} title${n === 1 ? "" : "s"}`);
  if (state.query) parts.push(`matching “${state.query}”`);
  const facets = [];
  if (state.topics.size) facets.push(labelsFrom(state.topics, TOPICS));
  if (state.languages.size) facets.push(labelsFrom(state.languages, LANGUAGES));
  if (state.audiences.size) facets.push(labelsFrom(state.audiences, AUDIENCES));
  if (state.availability.size) facets.push(labelsFrom(state.availability, AVAILABILITY));
  if (facets.length) parts.push(`in ${facets.join(" · ")}`);
  resultsMeta.textContent = parts.join(" ");
}

function labelsFrom(set, coll) {
  return [...set].map(id => coll.find(x => x.id === id)?.label).filter(Boolean).join(", ");
}

// -------------------------------------------------------------
// Detail modal
// -------------------------------------------------------------
const detailDialog = document.getElementById("book-detail");
function openDetail(book) {
  const cover = document.querySelector("[data-detail-cover]");
  cover.replaceChildren(renderBookCoverPanel(book, { detail: true }));

  document.querySelector("[data-detail-topic]").textContent =
    TOPICS.find(t => t.id === book.topic)?.label || "";
  document.querySelector("[data-detail-title]").textContent = book.title;
  document.querySelector("[data-detail-author]").textContent = `by ${book.author}`;
  document.querySelector("[data-detail-desc]").textContent = book.desc;
  document.querySelector("[data-detail-language]").textContent =
    LANGUAGES.find(l => l.id === book.language)?.label || "";
  document.querySelector("[data-detail-audience]").textContent =
    AUDIENCES.find(a => a.id === book.audience)?.label || "";
  document.querySelector("[data-detail-publisher]").textContent = book.publisher;
  document.querySelector("[data-detail-year]").textContent = book.year;
  document.querySelector("[data-detail-availability]").textContent =
    book.availability === "available" ? "Yes — come by the desk" : "No — checked out";

  const borrowBtn = document.querySelector("[data-detail-borrow]");
  borrowBtn.textContent = book.availability === "available"
    ? "Reserve at the desk"
    : "Add to hold list";
  borrowBtn.disabled = false;

  if (typeof detailDialog.showModal === "function") detailDialog.showModal();
  else detailDialog.setAttribute("open", "");
}

// close on backdrop click
detailDialog.addEventListener("click", (e) => {
  const rect = detailDialog.getBoundingClientRect();
  const clicked = e.target === detailDialog;
  if (clicked) {
    const inside =
      e.clientX >= rect.left && e.clientX <= rect.right &&
      e.clientY >= rect.top && e.clientY <= rect.bottom;
    if (!inside) detailDialog.close();
  }
});

// -------------------------------------------------------------
// Search wiring
// -------------------------------------------------------------
const searchInput = document.getElementById("search-input");
const searchClear = document.querySelector(".search__clear");
let searchTimer = 0;
searchInput.addEventListener("input", () => {
  clearTimeout(searchTimer);
  const val = searchInput.value;
  searchClear.hidden = val.length === 0;
  searchTimer = setTimeout(() => {
    state.query = val.trim();
    render();
  }, 120);
});
searchClear.addEventListener("click", () => {
  searchInput.value = "";
  state.query = "";
  searchClear.hidden = true;
  render();
  searchInput.focus();
});

// -------------------------------------------------------------
// Reset
// -------------------------------------------------------------
const resetBtn = document.getElementById("filters-reset");
resetBtn.addEventListener("click", clearAll);
function clearAll() {
  state.topics.clear();
  state.languages.clear();
  state.audiences.clear();
  state.availability.clear();
  state.query = "";
  searchInput.value = "";
  searchClear.hidden = true;
  render();
  document.getElementById("main").scrollIntoView({ behavior: "smooth", block: "start" });
}

// -------------------------------------------------------------
// Render — top level
// -------------------------------------------------------------
function render() {
  renderChipsets();
  const filtering = isFiltering();
  shelvesRoot.hidden = filtering;
  resultsRoot.hidden = !filtering;
  resetBtn.hidden = !filtering;

  if (filtering) renderResults();
  else renderCuratedShelves();

  const count = BOOKS.length;
  document.querySelector("[data-book-count]").textContent = count;
}

// -------------------------------------------------------------
// Boot
// -------------------------------------------------------------
render();
