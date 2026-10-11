/** ISO-8601 week number (weeks start Monday; week 1 contains Jan 4th). */
export function isoWeek(date = new Date()): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/** 0 = Monday … 6 = Sunday */
export function todayIndex(date = new Date()): number {
  return (date.getDay() + 6) % 7;
}

/** The seven dates (Monday … Sunday) of the week containing `date`. */
export function weekDates(date = new Date()): Date[] {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate() - todayIndex(date));
  return Array.from({ length: 7 }, (_, i) => new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i));
}

const LOCALES: Record<string, string> = { en: "en-GB", da: "da-DK", de: "de-DE", fr: "fr-FR", es: "es-ES" };

/** BCP-47 locale for dates: the device's own variant when it speaks the app language. */
export function dateLocale(language: string): string {
  const device = typeof navigator !== "undefined" ? navigator.language : "";
  return device.toLowerCase().startsWith(language) ? device : LOCALES[language] ?? "en-GB";
}

/** "11. oktober" / "11 October" */
export function dayMonth(date: Date, language: string): string {
  try {
    return new Intl.DateTimeFormat(dateLocale(language), { day: "numeric", month: "long" }).format(date);
  } catch {
    return `${date.getDate()}/${date.getMonth() + 1}`;
  }
}
