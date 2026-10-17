const locale = "pt-BR";

const time = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" });
const weekday = new Intl.DateTimeFormat(locale, { weekday: "long" });
const monthShort = new Intl.DateTimeFormat(locale, { month: "short" });
const fullDate = new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long" });
const relative = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

export function formatTime(iso: string) {
  return time.format(new Date(iso));
}

export function formatTimeRange(start: string, end: string | null) {
  return end ? `${formatTime(start)} – ${formatTime(end)}` : formatTime(start);
}

export function formatFullDate(iso: string) {
  return fullDate.format(new Date(iso));
}

export function dateParts(iso: string) {
  const date = new Date(iso);
  return {
    day: String(date.getDate()).padStart(2, "0"),
    month: monthShort.format(date).replace(".", ""),
    weekday: weekday.format(date),
  };
}

const DAY = 86_400_000;

export function relativeDay(iso: string, now = new Date()) {
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diff = Math.round((startOfDay(new Date(iso)) - startOfDay(now)) / DAY);
  if (Math.abs(diff) < 7) return relative.format(diff, "day");
  if (Math.abs(diff) < 31) return relative.format(Math.round(diff / 7), "week");
  return relative.format(Math.round(diff / 30), "month");
}

export function isHappeningNow(start: string, end: string | null, now = new Date()) {
  const s = new Date(start).getTime();
  const e = end ? new Date(end).getTime() : s + 2 * 3_600_000;
  return now.getTime() >= s && now.getTime() <= e;
}

export function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromLocalInput(value: string) {
  return value ? new Date(value).toISOString() : null;
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
