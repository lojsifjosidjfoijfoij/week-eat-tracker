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
