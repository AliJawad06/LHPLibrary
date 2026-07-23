export const TOPICS = [
  { id: "seerah", label: "Seerah", ar: "السيرة" },
  { id: "quran", label: "Qur'an & Tafsir", ar: "القرآن والتفسير" },
  { id: "fiqh", label: "Fiqh & Spiritual", ar: "الفقه والتزكية" },
  { id: "history", label: "History", ar: "التاريخ" },
  { id: "youth", label: "Youth & Kids", ar: "الأطفال والشباب" },
  { id: "contemp", label: "Contemporary", ar: "المعاصر" },
] as const;

export const LANGUAGES = [
  { id: "en", label: "English" },
  { id: "ar", label: "Arabic" },
  { id: "bilingual", label: "Bilingual" },
] as const;

export const AUDIENCES = [
  { id: "adult", label: "Adult" },
  { id: "teen", label: "Teen" },
  { id: "child", label: "Kids" },
] as const;

export const STATUSES = [
  { id: "available", label: "Available" },
  { id: "loaned", label: "Checked out" },
] as const;

export type Topic = (typeof TOPICS)[number]["id"];
export type Language = (typeof LANGUAGES)[number]["id"];
export type Audience = (typeof AUDIENCES)[number]["id"];
export type BookStatus = (typeof STATUSES)[number]["id"];

export const topicLabel = (id: string) =>
  TOPICS.find((t) => t.id === id)?.label ?? id;
export const languageLabel = (id: string) =>
  LANGUAGES.find((l) => l.id === id)?.label ?? id;
export const audienceLabel = (id: string) =>
  AUDIENCES.find((a) => a.id === id)?.label ?? id;

export function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function daysUntil(ms: number): number {
  return Math.ceil((ms - Date.now()) / (24 * 60 * 60 * 1000));
}
