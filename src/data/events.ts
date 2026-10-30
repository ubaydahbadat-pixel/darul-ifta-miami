// Events: loading, sorting and the upcoming/completed split. Dates are calendar days in New York time.
import { getCollection, type CollectionEntry } from 'astro:content';
export type Event = CollectionEntry<'events'>;

/** Today's date in New York as YYYY-MM-DD. */
export function todayNY(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}
const ymd = (d: Date) => d.toISOString().slice(0, 10);
export const lastDay = (e: Event) => ymd(e.data.end_date ?? e.data.date);

export async function getEvents() {
  const all = await getCollection('events', ({ data }) => import.meta.env.DEV || !data.draft);
  const today = todayNY();
  const upcoming = all.filter((e) => lastDay(e) >= today).sort((a, b) => a.data.date.valueOf() - b.data.date.valueOf());
  const past = all.filter((e) => lastDay(e) < today).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  return { all, upcoming, past };
}

const fmt = (d: Date, o: Intl.DateTimeFormatOptions) => d.toLocaleDateString('en-GB', { ...o, timeZone: 'UTC' });
/** e.g. "Saturday 7 November 2026" or "7–9 November 2026". */
export function eventDate(e: Event) {
  const s = e.data.date, f = e.data.end_date;
  if (!f || ymd(f) === ymd(s)) return fmt(s, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  if (s.getUTCMonth() === f.getUTCMonth() && s.getUTCFullYear() === f.getUTCFullYear())
    return `${s.getUTCDate()}–${fmt(f, { day: 'numeric', month: 'long', year: 'numeric' })}`;
  return `${fmt(s, { day: 'numeric', month: 'long' })} – ${fmt(f, { day: 'numeric', month: 'long', year: 'numeric' })}`;
}
export function eventTime(e: Event) {
  const a = e.data.start_time?.trim(), b = e.data.end_time?.trim();
  return a && b ? `${a} – ${b}` : a || '';
}
